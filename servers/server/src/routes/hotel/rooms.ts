import {
  Business,
  DeviceToken,
  HotelAlert,
  HotelAnalytics,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatReply,
  HotelRoomSession,
  HotelRoomType,
  HotelZone,
  OutLetInfo,
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
import type { FilterQuery } from "mongoose";
import { Types } from "mongoose";
import { nanoid } from "nanoid";
import { z } from "zod";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
import { startOfToday,endOfToday } from "../payments/index.js";
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

type RatingKey = "GOOD" | "AVG" | "BAD";
type NumCmp = Partial<{ $gte: number; $lte: number; $eq: number }>;

interface ReviewDoc {
  reviewRating: number;
  roomId: Types.ObjectId;
  // ...other fields; dotted paths will still work in FilterQuery
}

// 2) No-`any` rating map
const ratingMap: Record<RatingKey, NumCmp> = {
  GOOD: { $gte: 4 }, // 4–5
  AVG: { $eq: 3 }, // 3
  BAD: { $lte: 2 }, // 1–2
};

interface FilterInput {
  rating?: RatingKey;
  roomIds?: string[];
  serviceIds?: string[];
  staffIds?: string[];
  isRead?: boolean;
}

// 3) Build criteria with correct typing
export function buildCriteria(filter: FilterInput): FilterQuery<ReviewDoc> {
  const criteria: FilterQuery<ReviewDoc> = {};

  // rating
  if (filter.rating) {
    criteria.reviewRating = ratingMap[filter.rating];
  }

  if (filter.isRead !== undefined && filter.isRead !== null ) {
    criteria.isRead = filter.isRead;
  }

  // roomIds
  if (filter.roomIds?.length) {
    criteria.roomId = {
      $in: filter.roomIds.map((id) => new Types.ObjectId(id)),
    };
  }

  // serviceIds (dotted path)
  if (filter.serviceIds?.length) {
    criteria.serviceIds = {
      $in: filter.serviceIds.map((id) => new Types.ObjectId(id)),
    };
  }

  // staffIds (dotted paths + $or)
  if (filter.staffIds?.length) {
    const staffObjIds = filter.staffIds.map((id) => new Types.ObjectId(id));

    // criteria is FilterQuery<ReviewDoc>
    criteria.$or = [
      { acceptedBy: { $in: staffObjIds } },
      { deliveredBy: { $in: staffObjIds } },
    ] as FilterQuery<ReviewDoc>["$or"];
  }

  return criteria;
}
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
      }).populate({
        path: "userIds",
        select: "name phone",
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
      if (
        roomData?.userIds?.length > 0 &&
        !roomData.userIds.some((user) => user._id.toString() === userId)
      ) {
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
  .get(
    "/fetch_room_session",
    zValidator(
      "query",
      z.object({
        sessionId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { sessionId } = c.req.query();

      const roomSession = await HotelRoomSession.findById(sessionId);
      if (!roomSession) {
        return c.json(
          {
            message: "Session not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Room session fetched successfully",
          err: false,
          data: { _id: roomSession._id },
        },
        200,
      );
    },
  )

  .get(
    "/hotel_user_analytics",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(24).max(24),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);

      if (fromDate > toDate) {
        return respond(c, "Invalid date range", true, 400, {});
      }

      const analytics = await HotelAnalytics.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .populate({
          path: "roomId",
          select: "name",
        })
        .populate({
          path: "userId",
          select: "name phone",
        })
        .lean();

      return respond(
        c,
        "Hotel analytics fetched successfully",
        false,
        200,
        analytics,
      );
    },
  )

  .post(
    "/hotel_user_reviews",
    zValidator(
      "json",
      z.object({
        businessId: z.string().length(24),
        from: z.number().optional(),
        to: z.number().optional(),
        filter: z
          .object({
            rating: z.enum(["GOOD", "AVG", "BAD"]).optional(),
            serviceIds: z.array(z.string().length(24)).optional(),
            roomIds: z.array(z.string().length(24)).optional(),
            staffIds: z.array(z.string().length(24)).optional(),
            isRead: z.boolean().optional(),
          })
          .default({}),
      }),
    ),

    async (c) => {
      const { businessId, from, to, filter } = await c.req.json();
       const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return respond(c, "Invalid date range", true, 400, {});
      }

      const criteria = buildCriteria(filter);

      const reviews = await Reviews.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
        ...criteria,
      })
        .select(
          "userId roomId alertId reviewRating description date staffs improvementAreas isRead readAt readBy note",
        )
        .sort({ date: -1 })
        .populate({
          path: "roomId",
          select: "name",
        })
        .populate({
          path: "userId",
          select: "name phone",
        })
        .populate({
          path: "alertId",
          select: "serviceIds acceptedBy deliveredBy -_id",
          populate: [
            { path: "serviceIds", select: "name" },
            { path: "acceptedBy", select: "name phone" },
            { path: "deliveredBy", select: "name phone" },
          ],
        })
        .populate({
          path: "readBy",
          select: "name phone",
        });

      return respond(
        c,
        "Hotel reviews fetched successfully",
        false,
        200,
        reviews,
      );
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

      // if (room.availability && room.roomStatus !== "AVAILABLE") {
      //   return respond(c, "Room is already booked", true, 400, {});
      // }

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

      await HotelAnalytics.findOneAndUpdate(
        {
          businessId: roomExists?.businessId,
          roomId: roomId,
          userId: user._id,
        },
        {
          $setOnInsert: {
            userId: user._id,
            source: requestData.source,
            date: Date.now(),
          },
        },
        { upsert: true },
      );

      if (whatsAppConfig) {
        const business = await Business.findById(roomExists.businessId).select(
          "name",
        );

        const shortUrlObj = await UrlModel.findOne({
          urlCode: updatedRoom.slug,
        });

        const updateLongUrl = `${
          shortUrlObj?.longUrl
        }&id=${user?._id.toString()}`;

        const response = await axios.post(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
          {
            messaging_product: "whatsapp",
            to: user?.phone?.toString(),
            type: "template",
            template: {
              name: "fi_welcoming_template",
              language: { code: "en" },
              components: [
                {
                  type: "header",
                  parameters: [
                    {
                      type: "image",
                      image: {
                        link: "https://t-static.blr1.digitaloceanspaces.com/e3039890-ede4-4fec-bcc4-ad12c2aa87ac.jpeg",
                      },
                    },
                  ],
                },
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: business?.name,
                    },

                    {
                      type: "text",
                      text: `${updateLongUrl}&sessionId=${roomSession[0]._id.toString()}`,
                    },
                    {
                      type: "text",
                      text: authCode,
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
        if (response.status !== 200) {
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

      const isHotelAlertExist = await HotelAlert.findOne({
        roomId,
        alertProgress: {
          $nin: [
            "REJECTED",
            "NOT_DELIVERED",
            "MESSAGE",
            "DELIVERED",
            "RESOLVED",
          ],
        },
      });

      if (isHotelAlertExist) {
        return respond(
          c,
          "Cannot check out. There are pending alerts for this room.",
          true,
          400,
          {},
        );
      }

      if (roomExists.roomStatus === "AVAILABLE") {
        return respond(c, "Room is already available", true, 400, {});
      }

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId: roomExists.businessId,
      }).populate("businessId");

      if (whatsAppConfig) {
        const outletInfo = await OutLetInfo.findOne({
          businessId: roomExists.businessId,
        });
        for (const userId of requestData.userIds) {
          const userData = await User.findById(userId)
            .select("phone name")
            .lean();
          const res = await axios.post(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: userData?.phone?.toString(),
              type: "template",
              template: {
                name: "fi_thankyou_template",
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
                        text: "hotel",
                      },
                      {
                        type: "text",
                        text: `${outletInfo?.placeUrl}`,
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

      const deleteRoomChat = await HotelRoomChat.updateMany(
        { roomId },
        { $set: { isDeleted: true } },
        { session },
      );
      if (!deleteRoomChat) {
        throw new Error("Error deleting room chat");
      }

      const deleteRoomAlert = await HotelAlert.deleteMany(
        { roomId: roomId },
        { session },
      );

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

        const business = await Business.findById(roomExists.businessId);

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId: roomExists.businessId,
        });
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
          alertProgress: "MESSAGE",
          createdBy: userId,
        });

        await alert.save({ session });

        if (!alert) {
          throw new Error("Error creating alert");
        }

        if (whatsAppConfig) {
          const res = await axios.post(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: userData?.phone?.toString(),
              type: "template",
              template: {
                name: "fi_checkout_template",
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
                        text: roomExists?.name,
                      },

                      {
                        type: "text",
                        text: business?.name,
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

        const alertOnfo = await HotelAlert.findById(roomChat.alertId);

        const createReview = await Reviews.create({
          businessId,
          userId,
          reviewRating,
          staffs: [userId],
          date: Date.now(),
          roomId: roomChat.roomId,
          alertId: roomChat.alertId,
          serviceIds: alertOnfo?.serviceIds || [],
          acceptedBy: alertOnfo?.acceptedBy || [],
          deliveredBy: alertOnfo?.deliveredBy || [],
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

  .put(
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

        await HotelAnalytics.findOneAndUpdate(
          {
            businessId: roomSource?.businessId,
            roomId: roomId,
            userId: { $in: roomSource.userIds },
          },
          {
            $setOnInsert: {
              source,
              date: Date.now(),
            },
          },
          { upsert: true },
        );

        return respond(c, "update ", false, 200, {
          _id: roomSource._id,
        });
      });
    },
  )

  .put(
    "/bulk",
    zValidator(
      "json",
      z.object({
        rooms: z.array(
          z.object({
            roomIds: z.array(z.string().min(24).max(24)).default([]),
            staffIds: z.array(z.string().min(24).max(24)).default([]),
            removeRoomIds: z.array(z.string().min(24).max(24)).default([]),
            removeStaffIds: z.array(z.string().min(24).max(24)).default([]),
          }),
        ),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { rooms } = await c.req.json();

        for (const part of rooms) {
          const {
            roomIds = [],
            staffIds = [],
            removeRoomIds = [],
            removeStaffIds = [],
          } = part;

          if (roomIds.length && staffIds.length) {
            await HotelRoom.updateMany(
              { _id: { $in: roomIds } },
              { $addToSet: { staffIds: { $each: staffIds } } },
              { session },
            );
          }

          if (removeRoomIds.length && removeStaffIds.length) {
            await HotelRoom.updateMany(
              { _id: { $in: removeRoomIds } },
              { $pull: { staffIds: { $in: removeStaffIds } } },
              { session },
            );
          }
        }

        return respond(c, "Bulk update successful", false, 200, {});
      });
    },
  )

  .put(
    "/review/read_by",
    zValidator(
      "json",
      z.object({
        readBy: z.string().min(24).max(24),
        reviewId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { reviewId, readBy } = requestData;

        const checkIsRead = await Reviews.findOne({
          _id: reviewId,
          readBy: {
            $exists: true,
            $ne: null,
          },
        });

        if (checkIsRead) {
          return respond(c, "Review already read ", true, 409, {});
        }

        const review = await Reviews.findByIdAndUpdate(
          reviewId,
          {
            readBy: readBy,
            readAt: Date.now(),
            isRead: true,
          },
          { new: true, session },
        );

        if (!review) {
          return respond(c, "Review not found", true, 404, {});
        }

        return respond(c, "Review updated", false, 200, { _id: review._id });
      });
    },
  )

  .put(
    "/review/note",
    zValidator(
      "json",
      z.object({
        note: z.string().min(1).max(200),
        reviewId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { reviewId, note } = requestData;

        const review = await Reviews.findByIdAndUpdate(
          reviewId,
          {
            note,
          },
          { new: true, session },
        );

        if (!review) {
          return respond(c, "Review not found", true, 404, {});
        }

        return respond(c, "Review updated", false, 200, { _id: review._id });
      });
    },
  );

export default roomRouter;
