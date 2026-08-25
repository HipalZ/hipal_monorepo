import { DeviceToken, HotelAlert, HotelRoom, HotelRoomSession, User } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { sendPushToTokens } from "../../services/notifications";
import { respond } from "../../utils/response";
import { enqueueHotelWakeUpJob } from "../../queues/enqueue";

const alarmPayload = z.object({
  businessId: z.string().min(1),
  userId: z.string().min(1),
  guestName: z.string().min(2),
  guestPhone: z.string().min(6),
  roomName: z.string().min(1),
  triggerAt: z.string().datetime(),
  note: z.string().max(120).optional().default("Wake-up call"),
  notifyFrontOffice: z.boolean().optional().default(true),
});

function formatReminderTime(triggerAt: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(triggerAt));
}

function parseWakeUpMessage(message?: string) {
  const cleanMessage = message?.replace("WAKE_UP_CALL::", "") || "";
  const timeMatch = cleanMessage.match(/wake-up call for (.*?)\. Note:/);
  const noteMatch = cleanMessage.match(/\. Note: (.*)$/);

  return {
    displayTime: timeMatch?.[1] || "",
    note: noteMatch?.[1] || cleanMessage || "Wake-up call",
  };
}

function getWakeUpStatus(alert: {
  alertProgress?: string;
  acceptedBy?: unknown;
  deliveredAt?: number;
  rejectedAt?: number;
}) {
  if (alert.alertProgress === "NOT_DELIVERED") return "DUE";
  if (alert.alertProgress === "DELIVERED" && alert.deliveredAt) return "INFORMED";
  if (alert.alertProgress === "RESOLVED" && alert.deliveredAt) return "INFORMED";
  if (alert.alertProgress === "REJECTED" || alert.rejectedAt) return "CANCELLED";
  if (alert.acceptedBy) return "ACKNOWLEDGED";
  return "REQUESTED";
}

async function notifyFrontOffice(payload: z.infer<typeof alarmPayload>) {
  const room = await HotelRoom.findOne({
    businessId: payload.businessId,
    name: payload.roomName,
  })
    .select("_id name businessId staffIds")
    .lean();

  if (!room?.staffIds?.length) return;

  const frontOfficeStaff = await User.find({
    _id: { $in: room.staffIds },
    customRole: {
      $elemMatch: {
        businessId: { $eq: payload.businessId },
        role: "FRONT_OFFICE",
      },
    },
  })
    .select("_id")
    .lean();

  const frontOfficeIds = frontOfficeStaff.map((staff) => staff._id.toString());
  if (!frontOfficeIds.length) return;

  const registrationTokens = await DeviceToken.find({
    businessId: payload.businessId,
    userId: { $in: frontOfficeIds },
    notification: true,
  }).lean();

  await sendPushToTokens(registrationTokens, {
    title: "Wake-up Call Backup",
    body: `Guest ${payload.guestName} in room ${payload.roomName} requested ${payload.note || "a wake-up call"} at ${formatReminderTime(payload.triggerAt)}.`,
    channelGroup: "wakeUp",
    data: {
      type: "HOTEL_WAKEUP_BACKUP",
      businessId: payload.businessId,
      roomId: room._id.toString(),
      roomName: payload.roomName,
      guestName: payload.guestName || "Guest",
      guestPhone: payload.guestPhone,
      triggerAt: payload.triggerAt,
    },
  });
}

async function createWakeUpCallAlert(payload: z.infer<typeof alarmPayload>) {
  const room = await HotelRoom.findOne({
    businessId: payload.businessId,
    name: payload.roomName,
  })
    .select("_id name businessId")
    .lean();

  if (!room) return null;

  return HotelAlert.create({
    alertProgress: "MESSAGE",
    serviceIds: [],
    businessId: payload.businessId,
    userId: payload.userId,
    roomId: room._id,
    createdAt: Date.now(),
    wakeUpAt: new Date(payload.triggerAt).getTime(),
    createdBy: payload.userId,
    message: `WAKE_UP_CALL::${payload.guestName} (${payload.guestPhone}) requested a wake-up call for ${formatReminderTime(payload.triggerAt)}. Note: ${payload.note || "Wake-up call"}`,
  });
}

const hotelAlarmRouter = new Hono()
  .get(
    "/active",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1),
        userId: z.string().min(1),
        roomName: z.string().min(1),
      }),
    ),
    async (c) => {
      const { businessId, userId, roomName } = c.req.valid("query");

      const room = await HotelRoom.findOne({
        businessId,
        name: roomName,
      })
        .select("_id userIds")
        .lean();

      if (!room) {
        return respond(c, "Room not found", true, 404, []);
      }

      const isCheckedInUser = room.userIds?.some(
        (id) => id.toString() === userId,
      );

      if (!isCheckedInUser) {
        return respond(
          c,
          "No active room session found for this guest",
          false,
          200,
          [],
        );
      }

      const roomSession = await HotelRoomSession.findOne({
        roomId: room._id,
        userIds: userId,
      })
        .select("checkIn")
        .lean();

      if (!roomSession?.checkIn) {
        return respond(
          c,
          "No active room session found for this guest",
          false,
          200,
          [],
        );
      }

      const alerts = await HotelAlert.find({
        businessId,
        roomId: room._id,
        userId,
        message: { $regex: "^WAKE_UP_CALL::" },
        createdAt: { $gte: roomSession.checkIn },
      })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "deliveredBy", select: "name phone" })
        .sort({ createdAt: -1 })
        .lean();

      return respond(
        c,
        "Active wake-up calls fetched successfully",
        false,
        200,
        alerts.map((alert) => {
          const wakeUpMessage = parseWakeUpMessage(alert.message);

          return {
            id: alert._id.toString(),
            note: wakeUpMessage.note,
            displayTime: wakeUpMessage.displayTime,
            createdAt: alert.createdAt,
            wakeUpAt: alert.wakeUpAt,
            status: getWakeUpStatus(alert),
            alertProgress: alert.alertProgress,
            acceptedAt: alert.acceptedAt,
            acceptedBy: alert.acceptedBy,
            deliveredAt: alert.deliveredAt,
            deliveredBy: alert.deliveredBy,
          };
        }),
      );
    },
  )
  .post(
    "/create_alarm",
    zValidator("json", alarmPayload),
    async (c) => {
    const payload = await c.req.valid("json");
    const triggerAt = new Date(payload.triggerAt).getTime();

    if (triggerAt <= Date.now()) {
      return respond(c, "Please select a future wake-up call time", true, 400, {});
    }

    const room = await HotelRoom.findOne({
      businessId: payload.businessId,
      name: payload.roomName,
    })
      .select("_id")
      .lean();

    if (!room) {
      return respond(c, "Room not found", true, 404, {});
    }

    await HotelAlert.updateMany(
      {
        businessId: payload.businessId,
        roomId: room._id,
        userId: payload.userId,
        alertProgress: "MESSAGE",
        message: { $regex: "^WAKE_UP_CALL::" },
        wakeUpAt: { $lte: Date.now() },
      },
      {
        $set: {
          alertProgress: "RESOLVED",
          deliveredAt: Date.now(),
        },
      },
    );

    const activeWakeUpCount = await HotelAlert.countDocuments({
      businessId: payload.businessId,
      roomId: room._id,
      userId: payload.userId,
      message: { $regex: "^WAKE_UP_CALL::" },
      $or: [
        {
          alertProgress: "MESSAGE",
          wakeUpAt: { $gt: Date.now() },
        },
        {
          alertProgress: "NOT_DELIVERED",
        },
      ],
    });

    if (activeWakeUpCount >= 1) {
      return respond(c, "Only one active wake-up call is allowed at a time.", true, 400, {});
    }

    const wakeUpAlert = payload.notifyFrontOffice
      ? await createWakeUpCallAlert(payload)
      : null;

    if (payload.notifyFrontOffice) {
      notifyFrontOffice(payload)
        .then(() => {
          console.log("[hotelAlarm] front-office wake-up request push sent", {
            businessId: payload.businessId,
            roomName: payload.roomName,
            userId: payload.userId,
          });
        })
        .catch((error) => {
          console.error("[hotelAlarm] front-office wake-up request push failed", {
            businessId: payload.businessId,
            roomName: payload.roomName,
            userId: payload.userId,
            error: error instanceof Error ? error.message : String(error),
          });
        });
    }

    if (wakeUpAlert?._id) {
      const alertId = wakeUpAlert._id.toString();
      console.log("[hotelAlarm] queueing wake-up jobs", {
        queueName: "hotelWakeUpQueue",
        redisKeyPrefix: "bull:hotelWakeUpQueue",
        businessId: payload.businessId,
        roomName: payload.roomName,
        alertId,
        triggerAt: payload.triggerAt,
      });

      try {
        await enqueueHotelWakeUpJob(
          "wakeUpCallAckReminder",
          { alertId, attempt: 1 },
          {
            delay: 2 * 60 * 1000,
            jobId: `hotel-wakeup-ack-${alertId}-1`,
          },
        );

        await enqueueHotelWakeUpJob(
          "wakeUpCallDue",
          { alertId },
          {
            delay: triggerAt - Date.now(),
            jobId: `hotel-wakeup-${alertId}`,
          },
        );
      } catch (error) {
        console.error("[hotelAlarm] wake-up job enqueue failed", {
          queueName: "hotelWakeUpQueue",
          redisKeyPrefix: "bull:hotelWakeUpQueue",
          alertId,
          error: error instanceof Error ? error.message : String(error),
        });

        return respond(
          c,
          "Wake-up call was created, but reminder queueing failed. Please check Redis connection/logs.",
          true,
          503,
          { alertId },
        );
      }

      console.log("[hotelAlarm] wake-up jobs queued", {
        queueName: "hotelWakeUpQueue",
        redisKeyPrefix: "bull:hotelWakeUpQueue",
        alertId,
      });
    }

    return respond(c, "Wake-up call scheduled successfully", false, 201, {
      alarmId: wakeUpAlert?._id,
      alertId: wakeUpAlert?._id,
    });
    },
  );

export default hotelAlarmRouter;
