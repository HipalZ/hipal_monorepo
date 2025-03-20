import {
  DeviceToken,
  HotelAlert,
  HotelRoom,
  HotelRoomChat,
  HotelService,
  User,
} from "@hi/db-models";
import {
  type AcceptHotelAlertType,
  acceptHotelAlert,
  hotelAlert,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { schedule } from "node-cron";
import { z } from "zod";
import { respond } from "../../utils/response";
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
          $in: ["CREATED", "ACCEPTED", "ESCALATION", "WARNING"],
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
        authCode: z.string().min(4).max(6),
      }),
    ),
    async (c) => {
      const { authCode } = c.req.query();

      const roomChat = await HotelRoomChat.find({
        authCode,
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

      const alert = await HotelAlert.findById(alertId);

      if (!alert) {
        return respond(c, "Alert not found", true, 404, {});
      }

      const validTransitions: Record<string, string> = {
        ACCEPTED: "CREATED",
        DELIVERED: "ACCEPTED",
        REJECTED: "CREATED",
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

      return respond(c, `Alert ${action} successfully`, false, 200, {
        _id: updatedAlert._id,
      });
    });
  });

export default hotelAlertRouter;
