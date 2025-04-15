import {
  Business,
  DeviceToken,
  HotelAlert,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatReply,
  HotelRoomSession,
  HotelRoomType,
  HotelZone,
  Reviews,
  UrlModel,
  User,
} from "@hi/db-models";
import { WhatsAppBusinessConfig } from "@hi/db-models/src/models/whatsAppBusinessConfig";
import {
  bulkHotelRoom,
  hotelRoom,
  hotelRoomCheckIn,
  hotelRoomCheckOut,
  hotelRoomCheckOutRequest,
  updateHotelRoom,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
const admin = require("firebase-admin");

const sendPushNotification = async (token: string, hotelNo: string) => {
  const pushMessage = {
    token: token, // or use 'topic' if you're sending to a topic
    notification: {
      title: "Room Ready for Cleaning",
      body: `Room ${hotelNo} has just been checked out and is now ready for cleaning. Please ensure it is cleaned and prepared for the next guest. Thank you!`,
    },
    android: {
      notification: {
        channel_id: "custom_channel_id",
        sound: "order",
      },
    },
  };

  try {
    const response = await admin.messaging().send(pushMessage);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending FCM message:", error);
  }
};
const roomRouter = new Hono()

  .get(
    "/fetch_room",
    zValidator(
      "query",
      z
        .object({
          businessId: z.string().min(2).max(50), // Now mandatory
          roomId: z.string().min(2).max(50).optional(),
          roomName: z.string().min(1).max(50).optional(),
        })
        .refine((data) => data.roomId || data.roomName, {
          message: "Either roomId or roomName must be provided",
        }),
    ),
    async (c) => {
      const { businessId, roomId, roomName } = c.req.query();

      const room = await HotelRoom.findOne({
        businessId,
        $or: [{ _id: roomId }, { name: roomName }],
        isDeleted: false,
      });

      return room
        ? respond(c, "Room details", false, 200, room)
        : respond(c, "Room not found", true, 404, {});
    },
  )

  .get(
    "/fetch_rooms",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const rooms = await HotelRoom.find({
        businessId,
        availability: true,
        isDeleted: false,
      }).populate({
        path: "userIds",
        select: "name phone",
      });

      return respond(c, "All rooms", false, 200, rooms);
    },
  )

  .get(
    "/auth_code",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        room: z.string().min(1).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, room, userId } = c.req.query();

      const roomData = await HotelRoom.findOne({
        businessId,
        name: room,
      }).populate({
        path: "userIds",
        select: "name phone",
      });

      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      // Check if the provided userId exists in roomData.userIds by comparing with the _id field
      if (!roomData.userIds.some((user) => user._id.toString() === userId)) {
        return respond(
          c,
          `Room already Occupied by ${roomData.userIds[0].name}`,
          true,
          403,
          {},
        );
      }

      return c.json({
        message: "Room details",
        data: { _id: roomData._id },
        err: false,
      });
    },
  )

  .post("/", zValidator("json", hotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const uniqueOrderId = nanoid(5);
      // Check if room already exists
      const roomExists = await HotelRoom.exists({
        businessId: requestData.businessId,
        name: requestData.name,
      });

      if (roomExists) {
        return respond(c, "Room already exists", true, 409, {});
      }

      const business = await Business.findById(requestData.businessId)
        .select("customLink")
        .lean();

      if (!business) {
        return respond(c, "Business not found", true, 404, {});
      }

      const [room] = await HotelRoom.create(
        [{ ...requestData, slug: uniqueOrderId }],
        { session },
      );

      if (!room) {
        throw new Error("Error creating room");
      }

      const longUrl = `https://hipal-test.hipalz.com/${business.customLink}/hotel/checkin?room=${room.name}`;

      const urlAlreadyExists = await UrlModel.exists({
        longUrl,
        businessId: requestData.businessId,
      });

      if (!urlAlreadyExists) {
        const shortUrl = await UrlModel.create({
          longUrl,
          businessId: requestData.businessId,
          shortUrl: `https://api.test.hipalz.com/surl/r/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
          shortUrlType: "ROOM",
        });

        if (!shortUrl) {
          throw new Error("Error creating short url");
        }

        room.downLoadLink = shortUrl.shortUrl;
        await room.save();
      }

      // Add room to its assigned zone
      const updatedZone = await HotelZone.findByIdAndUpdate(
        requestData.zoneId,
        { $addToSet: { roomIds: room._id } },
        { session, new: true },
      );

      if (!updatedZone) {
        throw new Error("Error updating zone");
      }

      const updatedRoomType = await HotelRoomType.findByIdAndUpdate(
        requestData.roomTypeId,
        { $addToSet: { roomIds: room._id } },
        { session, new: true },
      );

      if (!updatedRoomType) {
        throw new Error("Error updating room type");
      }

      return respond(c, "Room created", false, 201, { _id: room._id });
    });
  })

  .put("/", zValidator("json", updateHotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { roomId, zoneId, roomTypeId } = requestData;

      const nameAlreadyExists = await HotelRoom.exists({
        businessId: requestData.businessId,
        name: requestData.name,
        _id: { $ne: roomId },
      });

      if (nameAlreadyExists) {
        return respond(c, "Room name already exists", true, 409, {});
      }

      // Check if the room is booked before updating
      const room = await HotelRoom.findOne({ _id: roomId });

      if (!room) {
        return respond(c, "Room not found", true, 404, {});
      }

      if (room.availability && room.roomStatus !== "AVAILABLE") {
        return respond(c, "Room is already booked", true, 400, {});
      }

      const updatedRoom = await HotelRoom.findByIdAndUpdate(
        roomId,
        requestData,
        { new: true, session },
      );

      if (!updatedRoom) {
        throw new Error("Error updating room");
      }

      // If zoneId is provided, update the zone
      if (zoneId) {
        const updatedZone = await HotelZone.findByIdAndUpdate(
          zoneId,
          { $addToSet: { roomIds: updatedRoom._id } },
          { new: true, session },
        );

        if (!updatedZone) {
          throw new Error("Error updating zone");
        }
      }

      if (roomTypeId) {
        const updatedRoomType = await HotelRoomType.findByIdAndUpdate(
          roomTypeId,
          { $addToSet: { roomIds: updatedRoom._id } },
          { new: true, session },
        );

        if (!updatedRoomType) {
          throw new Error("Error updating  room type");
        }
      }

      return respond(c, "Room updated", false, 200, { _id: updatedRoom._id });
    });
  })
  .post("/bulk", zValidator("json", bulkHotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      // Regex to extract name pattern
      const rangePattern = /^(.*?)(\d+)-(\d+)$/;
      const match = requestData.name.match(rangePattern);

      if (!match) {
        return respond(c, "Invalid room name", true, 400, {});
      }

      const [, prefix, start, end] = match;

      const roomNames = [];

      for (let i = Number(start); i <= Number(end); i++) {
        roomNames.push(`${prefix}${i}`);
      }

      const existingRooms = await HotelRoom.find({
        businessId: requestData.businessId,
        availability: true,
        name: { $in: roomNames },
      })
        .select("name")
        .lean();

      const existingRoomNames = new Set(existingRooms.map((room) => room.name));

      const newRooms = roomNames
        .filter((name) => !existingRoomNames.has(name))
        .map((name) => ({
          ...requestData,
          name,
        }));

      if (newRooms.length === 0) {
        return respond(c, "All rooms already exist", true, 409, {});
      }

      const createdRooms = await HotelRoom.insertMany(newRooms, { session });

      if (!createdRooms || createdRooms.length === 0) {
        throw new Error("Error creating new rooms");
      }

      for (const room of createdRooms) {
        const business = await Business.findById(requestData.businessId)
          .select("customLink")
          .lean();

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }
        const longUrl = `https://hipal-test.hipalz.com/${business.customLink}/hotel/checkin?room=${room.name}`;

        const urlAlreadyExists = await UrlModel.exists({
          longUrl,
          businessId: requestData.businessId,
        });

        if (!urlAlreadyExists) {
          const uniqueOrderId = nanoid(5);
          const shortUrl = await UrlModel.create({
            longUrl,
            businessId: requestData.businessId,
            shortUrl: `https://api.test.hipalz.com/surl/r/${uniqueOrderId}`,
            urlCode: uniqueOrderId,
            shortUrlType: "ROOM",
          });

          if (!shortUrl) {
            throw new Error("Error creating short url");
          }

          room.downLoadLink = shortUrl.shortUrl;
          room.slug = uniqueOrderId;
          await room.save({ session });
        }
      }

      // Add only newly created rooms to their assigned zone
      const updateZone = await HotelZone.findByIdAndUpdate(
        requestData.zoneId,
        { $addToSet: { roomIds: { $each: createdRooms.map((r) => r._id) } } },
        { session, new: true },
      );

      if (!updateZone) {
        throw new Error("Error updating zone");
      }

      const updateRoomType = await HotelRoomType.findByIdAndUpdate(
        requestData.roomTypeId,
        { $addToSet: { roomIds: { $each: createdRooms.map((r) => r._id) } } },
        { session, new: true },
      );

      if (!updateRoomType) {
        throw new Error("Error updating room type");
      }

      return respond(c, "Rooms created", false, 201, {
        success: true,
      });
    });
  })

  .post("/check_in", zValidator("json", hotelRoomCheckIn), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { roomId, name, phone } = requestData;

      const roomExists = await HotelRoom.findOne({ _id: roomId });
      if (!roomExists) {
        return respond(c, "Room not found", true, 404, {});
      }
      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId: roomExists.businessId,
      });

      const roomAlreadyBooked = await HotelRoom.exists({
        _id: roomId,
        roomStatus: "OCCUPIED",
      });

      if (roomAlreadyBooked) {
        return respond(c, "Room already booked", true, 400, {});
      }

      const user = await User.findOneAndUpdate(
        { phone },
        { name, phone },
        { upsert: true, new: true, session },
      );

      if (!user) {
        throw new Error("Error creating user");
      }

      const authCode = nanoid(4).toUpperCase();

      const updatedRoom = await HotelRoom.findByIdAndUpdate(
        roomId,
        {
          roomStatus: "OCCUPIED",
          userIds: [user._id],
          authCode,
          source: requestData.source,
        },
        { new: true, session },
      );

      if (!updatedRoom) {
        throw new Error("Error checking in");
      }

      const roomSession = await HotelRoomSession.create(
        [
          {
            roomId,
            name: updatedRoom.name,
            userIds: [user._id],
            date: Date.now(),
            checkIn: Date.now(),
            authCode,
            source: requestData.source,
          },
        ],
        { session },
      );

      if (!roomSession) {
        throw new Error("Error creating room session");
      }

      if (whatsAppConfig) {
        const res = await axios.post(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
          {
            messaging_product: "whatsapp",
            to: user?.phone?.toString(),
            type: "template",
            template: {
              name: "authcode_template",
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: user?.name,
                    },

                    {
                      type: "text",
                      text: authCode,
                    },

                    {
                      type: "text",
                      text: roomExists?.name,
                    },
                  ],
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        if (res.status !== 200) {
          throw new Error("Error sending message");
        }
      }

      return respond(c, "Checked in successfully", false, 200, {
        _id: updatedRoom._id,
      });
    });
  })

  .post("/check_out", zValidator("json", hotelRoomCheckOut), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { roomId } = requestData;

      const roomExists = await HotelRoom.findOne({ _id: roomId });
      if (!roomExists) {
        return respond(c, "Room not found", true, 404, {});
      }
      const userData = await User.findById(roomExists?.userIds[0])
        .select("phone name")
        .lean();

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId: roomExists.businessId,
      }).populate("businessId");

      if (whatsAppConfig) {
        const res = await axios.post(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
          {
            messaging_product: "whatsapp",
            to: userData?.phone?.toString(),
            type: "template",
            template: {
              name: "checkout_template",
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: userData?.name,
                    },

                    {
                      type: "text",
                      text: whatsAppConfig?.businessId?.name,
                    },

                    {
                      type: "text",
                      text: "https:google.com",
                    },
                  ],
                },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        if (res.status !== 200) {
          throw new Error("Error sending message");
        }
      }

      const updatedRoom = await HotelRoom.findByIdAndUpdate(
        roomId,
        {
          roomStatus: "AVAILABLE",
          userIds: [],
          authCode: "",
          source: "",
        },
        { new: true, session },
      );

      if (!updatedRoom) {
        throw new Error("Error checking out");
      }

      const removeSession = await HotelRoomSession.deleteOne(
        { roomId },
        { session },
      );

      if (!removeSession) {
        throw new Error("Error removing room session");
      }

      const registrationToken = await DeviceToken.find({
        businessId: requestData.businessId,
      });

      // send push notification to all devices
      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            await sendPushNotification(obj.token, updatedRoom.name);
          }
        }
      }

      return respond(c, "Checked out successfully", false, 200, {
        _id: updatedRoom._id,
      });
    });
  })

  .post(
    "/check_out_request",
    zValidator("json", hotelRoomCheckOutRequest),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { roomId, userId } = requestData;

        const roomExists = await HotelRoom.findOne({ _id: roomId });
        if (!roomExists) {
          return respond(c, "Room not found", true, 404, {});
        }
        const userData = await User.findById(userId)
          .select("phone name")
          .lean();

        if (!userData) {
          return respond(c, "User not found", true, 404, {});
        }

        const alert = new HotelAlert({
          businessId: roomExists.businessId,
          userId: userData._id,
          roomId: roomExists._id,
          message: `Customer ${userData.name} has requested to check out of room ${roomExists.name}`,
          createdAt: Date.now(),
          createdBy: userId,
        });

        await alert.save({ session });

        if (!alert) {
          throw new Error("Error creating alert");
        }

        return respond(c, "request send successfully", false, 200, {
          _id: alert._id,
        });
      });
    },
  )

  .post(
    "/verify_authcode",
    zValidator(
      "json",
      z.object({
        authCode: z.string().min(4).max(4),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { authCode, userId } = requestData;

        const roomSession = await HotelRoomSession.findOne({ authCode });

        if (!roomSession) {
          return respond(c, "Invalid auth code", true, 400, {});
        }

        await HotelRoom.findOneAndUpdate(
          {
            _id: roomSession.roomId,
          },
          {
            $addToSet: {
              userIds: userId,
            },
          },
          { session },
        );

        return respond(c, "Auth code verified", false, 200, {
          _id: roomSession._id,
          authCode,
        });
      });
    },
  )

  .post(
    "/reviews",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
        reviewRating: z.coerce
          .number({
            message: "Review rating must be a number",
          })
          .min(1, {
            message: "Review rating must be greater than 0",
          })
          .max(5, {
            message: "Review rating must be less than 6",
          })
          .optional(),
        roomChatReplyId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { businessId, userId, reviewRating } = requestData;

        const roomChatReply = await HotelRoomChatReply.findOneAndUpdate(
          {
            _id: requestData.roomChatReplyId,
          },
          {
            action: false,
            status: "NORMAL",
          },
        );

        if (!roomChatReply) {
          return respond(c, "Room chat reply not found", true, 404, {});
        }
        const roomChat = await HotelRoomChat.findOne({
          _id: roomChatReply.roomChatId,
        });

        if (!roomChat) {
          return respond(c, "Room chat not found", true, 404, {});
        }

        const newChatReply = new HotelRoomChatReply({
          action: false,
          description: "thank you for your feedback 😃 ",
          roomChatId: roomChat._id,
          userId: roomChatReply.userId,
          status: "NORMAL",
          date: Date.now(),
        });
        await newChatReply.save({ session });

        if (!newChatReply) {
          throw new Error("Failed to create new room chat reply");
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          { $addToSet: { roomChatReplyIds: newChatReply._id } },
          { session },
        );

        const createReview = await Reviews.create({
          businessId,
          userId,
          reviewRating,
          staffs: [userId],
          date: Date.now(),
        });

        if (!createReview) {
          throw new Error("Failed to create review");
        }

        return respond(c, "Review created successfully", false, 201, {
          _id: createReview._id,
        });
      });
    },
  )

  .post(
    "/update_room_source",
    zValidator(
      "json",
      z.object({
        roomId: z.string().min(2).max(50),
        source: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { roomId, source } = requestData;

        const roomSource = await HotelRoom.findOneAndUpdate(
          {
            _id: roomId,
          },
          {
            source,
          },
        );

        if (!roomSource) {
          return respond(c, "Room session not found", true, 404, {});
        }

        return respond(c, "update ", false, 200, {
          _id: roomSource._id,
        });
      });
    },
  );

export default roomRouter;
