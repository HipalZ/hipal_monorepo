import { DeviceToken, HotelAlert, HotelRoom, User } from "@hi/db-models";
import {
  type AcceptHotelAlertType,
  acceptHotelAlert,
  hotelAlert,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
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
        alertProgress: { $in: ["CREATED", "ACCEPTED"] },
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

  .post("/create_alert", zValidator("json", hotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const roomData = await HotelRoom.findById(requestData.roomId);

      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      const alert = new HotelAlert({
        ...requestData,
        createdAt: Date.now(),
        createdBy: requestData.userId,
      });

      await alert.save({ session });

      if (!alert) {
        throw new Error("Failed to create alert");
      }

      const registrationToken = await DeviceToken.find({
        businessId: requestData.businessId,
      });

      // send push notification to all devices
      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            sendPushNotification(obj.token, roomData.name);
          }
        }
      }

      return respond(c, "Alert created successfully", false, 201, {
        _id: alert._id,
      });
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
