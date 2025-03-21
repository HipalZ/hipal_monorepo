import {
  DeviceToken,
  HotelAlert,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatComplain,
  HotelRoomChatComplainReply,
  HotelRoomChatReply,
  HotelService,
  User,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import {
  type AcceptHotelAlertType,
  acceptHotelAlert,
  hotelAlert,
  updateRoomChat,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { schedule } from "node-cron";
import { z } from "zod";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
const admin = require("firebase-admin");

const sendPushNotification = async (token: string, hotelNo: string) => {
  const pushMessage = {
    token: token, // or use 'topic' if you're sending to a topic
    notification: {
      title: "Room Attention Required",
      body: `Room ${hotelNo} requires your attention. Please check and address any necessary tasks as soon as possible. Thank you for your prompt action!`,
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

const scheduleAlertUpdate = (
  alertId: string,
  avgTime: number,
  checkStatus: string,
  newProgress: string,
) => {
  console.log("avgTime", avgTime);
  if (avgTime > 0) {
    // Calculate the run time: current time + avgTime minutes
    const runTime = new Date(Date.now() + avgTime * 60 * 1000);
    const cronExpression = `${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${
      runTime.getMonth() + 1
    } *`;

    const data = schedule(
      cronExpression,
      async () => {
        const alertData = await HotelAlert.findById(alertId);

        if (alertData && alertData.alertProgress !== checkStatus) {
          const alertData = await HotelAlert.findByIdAndUpdate(alertId, {
            alertProgress: newProgress,
          });
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      },
    );

    console.log("Scheduled job:", data);
  }
};

const hotelAlertRouter = new Hono()
  .get(
    "/fetch_room_alerts",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 }, // Fetch only required fields
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );
      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role, serviceIds } = customRole;

      const alertQuery = {
        businessId,
        alertProgress: {
          $in: [
            "CREATED",
            "ACCEPTED",
            "ESCALATION",
            "WARNING",
            "NOT_DELIVERED",
          ],
        },
        staffIds: { $in: [userId] },
      };

      if (role !== "HELP_DESK") {
        if (!serviceIds || serviceIds.length === 0) {
          return respond(
            c,
            "No assigned services found for this staff",
            true,
            403,
            {},
          );
        }
        alertQuery.serviceIds = { $in: serviceIds };
      }

      const alerts = await HotelAlert.find(alertQuery)
        .populate({ path: "serviceIds", select: "name" })
        .populate({ path: "createdBy", select: "name phone" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .lean();

      return respond(c, "Alerts fetched successfully", false, 200, alerts);
    },
  )

  .get(
    "/fetch_escalation_alerts",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 }, // Fetch only required fields
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );
      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role } = customRole;

      if (role === "MANAGER") {
        const alerts = await HotelAlert.find({
          businessId,
          alertProgress: { $in: ["ESCALATION"] },
        })
          .populate({ path: "serviceIds", select: "name" })
          .populate({ path: "createdBy", select: "name phone" })
          .populate({ path: "acceptedBy", select: "name phone" })
          .populate({ path: "roomId", select: "name" })
          .lean();
        return respond(c, "Alerts fetched successfully", false, 200, alerts);
      }

      return respond(c, "fetch successfully", false, 200, {});
    },
  )

  .get(
    "/fetch_alert_history",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 },
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );
      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role, serviceIds } = customRole;

      const alertQuery = {
        businessId,
        alertProgress: "DELIVERED",
        staffIds: { $in: [userId] },
      };

      if (role !== "HELP_DESK") {
        if (!serviceIds || serviceIds.length === 0) {
          return respond(
            c,
            "No assigned services found for this staff",
            true,
            403,
            {},
          );
        }
        alertQuery.serviceIds = { $in: serviceIds };
      }

      const alerts = await HotelAlert.find(alertQuery)
        .populate({ path: "serviceIds", select: "name" })
        .populate({ path: "createdBy", select: "name phone" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "deliveredBy", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .lean();

      return respond(
        c,
        "Alerts history fetched successfully",
        false,
        200,
        alerts,
      );
    },
  )

  .get(
    "/room_chat",
    zValidator(
      "query",
      z.object({
        roomId: z.string().min(4).max(30),
      }),
    ),
    async (c) => {
      const { roomId } = c.req.query();

      const roomChat = await HotelRoomChat.find({
        roomId: roomId,
        isDeleted: false,
      })
        .populate({
          path: "userId",
          select: "name",
        })
        .populate({
          path: "alertId",
          select: "alertProgress",
          populate: {
            path: "serviceIds",
            select: "name",
          },
        })
        .populate({
          path: "roomChatReplyIds",
          select:
            "description userId date action status roomChatId complainIds",
          populate: {
            path: "userId",
            select: "name",
          },
        });

      return respond(c, "Room chat fetched successfully", false, 200, roomChat);
    },
  )

  .post(
    "/fetch_room_complain",
    zValidator(
      "json",
      z.object({
        complainIds: z.array(z.string().min(1).max(50)),
      }),
    ),
    async (c) => {
      const { complainIds } = await c.req.json();

      const roomChatComplain = await HotelRoomChatComplain.find({
        _id: { $in: complainIds },
      }).populate({
        path: "roomChatComplainReplyIds",
        select: "description date userId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

      return respond(
        c,
        "Room chat complain fetched successfully",
        false,
        200,
        roomChatComplain,
      );
    },
  )

  .post("/create_alert", zValidator("json", hotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const roomData = await HotelRoom.findById(requestData.roomId);
      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      const serviceIds = requestData.serviceIds || [];

      for (const serviceId of serviceIds) {
        const alert = new HotelAlert({
          ...requestData,
          serviceIds: [serviceId],
          createdAt: Date.now(),
          createdBy: requestData.userId,
        });

        await alert.save({ session });
        if (!alert) {
          throw new Error("Failed to create alert");
        }

        const create = new HotelRoomChat({
          alertId: alert._id,
          userId: requestData.userId,
          authCode: roomData.authCode,
          roomId: roomData._id,
          date: Date.now(),
          description: "Alert created",
        });
        await create.save({ session });

        if (!create) {
          throw new Error("Failed to create room chat");
        }

        const serviceData = await HotelService.findById(serviceId);
        const avgCompletionTime = serviceData?.avgCompletionTime;
        const avgAcceptanceTime = serviceData?.avgAcceptanceTime;
        const avgDeliveryTime = serviceData?.avgDeliveryTime;

        // Schedule updates based on average times
        scheduleAlertUpdate(
          alert._id.toString(),
          15,
          "DELIVERED",
          "ESCALATION",
        );
        scheduleAlertUpdate(alert._id.toString(), 5, "ACCEPTED", "WARNING");
        scheduleAlertUpdate(alert._id.toString(), 7, "DELIVERED", "WARNING");
      }

      const registrationTokens = await DeviceToken.find({
        businessId: requestData.businessId,
      });
      await Promise.all(
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotification(obj.token, roomData.name);
          }
        }),
      );

      return respond(c, "Alert created successfully", false, 201, {});
    });
  })

  .post("/accept_alert", zValidator("json", acceptHotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, userId, action } = requestData as AcceptHotelAlertType;

      const alert = await HotelAlert.findById(alertId).populate({
        path: "serviceIds",
        select: "name",
      });

      if (!alert) {
        return respond(c, "Alert not found", true, 404, {});
      }

      const captainData = await User.findById(userId);

      if (!captainData) {
        return respond(c, "User not found", true, 404, {});
      }

      const userData = await User.findById(alert.userId);
      if (!userData) {
        return respond(c, "User not found", true, 404, {});
      }

      const roomData = await HotelRoom.findById(alert.roomId);

      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      const validTransitions: Record<string, string> = {
        ACCEPTED: "CREATED",
        DELIVERED: "ACCEPTED",
        REJECTED: "CREATED",
        RESOLVED: "NOT_DELIVERED",
        WARNING: "ACCEPTED",
        ESCALATION: "ACCEPTED",
      };

      const updateFields: Record<string, object> = {
        ACCEPTED: {
          alertProgress: "ACCEPTED",
          acceptedAt: Date.now(),
          acceptedBy: userId,
        },
        DELIVERED: {
          alertProgress: "DELIVERED",
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
        REJECTED: {
          alertProgress: "REJECTED",
          rejectedAt: Date.now(),
          rejectedBy: userId,
        },
        RESOLVED: {
          alertProgress: "DELIVERED",
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
      };

      if (!validTransitions[action]) {
        return respond(c, "Invalid action", true, 400, {});
      }

      if (alert.alertProgress !== validTransitions[action]) {
        return respond(
          c,
          `Cannot mark alert as ${action} because it is in ${alert.alertProgress} state.`,
          true,
          400,
          {},
        );
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        updateFields[action],
        { session, new: true },
      );

      if (!updatedAlert) {
        throw new Error("Failed to update alert");
      }

      if (action === "ACCEPTED") {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error("Room chat not found");
        }

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: "In Progress",
          roomChatId: roomChat._id,
          userId: userId,
          status: "NORMAL",
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
        }

        console.log("roomChatReply", roomChatReply);

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );
      }
      if (action === "DELIVERED") {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });
        if (!roomChat) {
          throw new Error("Room chat not found");
        }

        const roomChatReply = new HotelRoomChatReply({
          action: true,
          description: "Delivered",
          roomChatId: roomChat._id,
          userId: userId,
          status: "NORMAL",
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );

        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId: alert.businessId,
        });

        if (whatsAppConfig) {
          const res = await axios.post(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: userData?.phone?.toString(),
              type: "template",
              template: {
                name: "chat_delivered_template",
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
                        text: alert?.serviceIds[0]?.name || "other",
                      },

                      {
                        type: "text",
                        text: roomData?.name,
                      },
                      {
                        type: "text",
                        text: captainData?.name,
                      },
                      {
                        type: "text",
                        text: "https://www.google.com",
                      },
                      {
                        type: "text",
                        text: "https://www.google.com",
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

      if (action === "RESOLVED") {
        const roomChatComplainId = alert.roomChatComplainId;

        const roomChatReply =
          await HotelRoomChatComplain.findById(roomChatComplainId);

        if (!roomChatReply) {
          throw new Error("Room chat reply not found");
        }

        const createComplainReply = new HotelRoomChatComplainReply({
          userId: userId,
          date: Date.now(),
          description: "Resolved successfully",
          roomChatComplainId: roomChatReply._id,
        });

        await createComplainReply.save({ session });

        if (!createComplainReply) {
          throw new Error("Failed to create room chat reply");
        }
        await HotelRoomChatComplain.findByIdAndUpdate(
          roomChatComplainId,
          {
            $addToSet: { roomChatComplainReplyIds: createComplainReply._id },
          },
          { session },
        );

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
        }
      }

      return respond(c, `Alert ${action} successfully`, false, 200, {
        _id: updatedAlert._id,
      });
    });
  })

  .post("/chat_complain", zValidator("json", updateRoomChat), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { roomChatReplyId } = await c.req.json();

      // Retrieve the existing chat reply and its parent room chat
      const roomChatReply = await HotelRoomChatReply.findById(roomChatReplyId);
      if (!roomChatReply) {
        return respond(c, "Room chat reply not found", true, 404, {});
      }

      const roomChat = await HotelRoomChat.findById(roomChatReply.roomChatId);
      if (!roomChat) {
        return respond(c, "Room chat not found", true, 404, {});
      }

      const updatedChatReply = await HotelRoomChatReply.findByIdAndUpdate(
        roomChatReplyId,
        { status: "WARNING" },
        { session, new: true },
      );
      if (!updatedChatReply) {
        throw new Error("Failed to update room chat reply");
      }

      // Create a new chat reply as a response
      const newChatReply = new HotelRoomChatReply({
        action: false,
        description: "we got your complain and we are working on it",
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

      // Create a new chat complaint for the existing chat reply
      const newChatComplaint = new HotelRoomChatComplain({
        userId: roomChatReply.userId,
        roomChatReplyId: roomChatReply._id,
        date: Date.now(),
        alertId: roomChat.alertId,
        description: "Room chat complain",
      });
      await newChatComplaint.save({ session });

      // Link the new complaint to the original chat reply
      await HotelRoomChatReply.findByIdAndUpdate(
        roomChatReply._id,
        { $set: { complainIds: newChatComplaint._id } },
        { session },
      );

      const updateAlert = await HotelAlert.findByIdAndUpdate(
        roomChat.alertId,
        {
          alertProgress: "NOT_DELIVERED",
          roomChatComplainId: newChatComplaint._id,
        },
        { session },
      );

      if (!updateAlert) {
        throw new Error("Failed to update alert");
      }

      return respond(c, "Room chat complain created successfully", false, 200, {
        _id: newChatComplaint._id,
      });
    });
  });

export default hotelAlertRouter;
