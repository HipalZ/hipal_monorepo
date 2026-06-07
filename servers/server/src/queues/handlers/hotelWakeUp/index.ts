import { DeviceToken, HotelAlert, User } from "@hi/db-models";
import type { Job } from "bullmq";
import { enqueueHotelWakeUpJob } from "../../enqueue";
import { sendPushToTokens } from "../../../services/notifications";

const WAKE_UP_ACK_REMINDER_MS = 2 * 60 * 1000;
const MAX_WAKE_UP_ACK_REMINDERS = 2;
const WAKE_UP_REMINDER_REPEAT_MS = 60 * 1000;
const WAKE_UP_NOTIFICATION_CHANNEL_ID = "wake_up_call_channel_v1";
const WAKE_UP_NOTIFICATION_SOUND = "order";

type LeanWakeUpAlert = {
  _id: { toString: () => string };
  alertProgress: string;
  businessId: { toString: () => string };
  message?: string;
  wakeUpAt?: number;
  createdBy?: unknown;
  roomId?: unknown;
};

async function findWakeUpAlert(alertId: string) {
  const alert = await HotelAlert.findById(alertId)
    .populate({ path: "roomId", select: "name staffIds businessId" })
    .populate({ path: "createdBy", select: "name phone" })
    .lean();

  if (!alert?.message?.startsWith("WAKE_UP_CALL::")) return null;
  return alert as unknown as LeanWakeUpAlert;
}

async function getFrontOfficePushContext(alert: LeanWakeUpAlert) {
  const room = alert.roomId as {
    _id: { toString: () => string };
    name: string;
    staffIds?: unknown[];
    businessId: unknown;
  };

  if (!room?.staffIds?.length) return null;

  const frontOfficeStaff = await User.find({
    _id: { $in: room.staffIds },
    customRole: {
      $elemMatch: {
        businessId: { $eq: alert.businessId },
        role: "FRONT_OFFICE",
      },
    },
  })
    .select("_id")
    .lean();

  const frontOfficeIds = frontOfficeStaff.map((staff) => staff._id.toString());
  if (!frontOfficeIds.length) return null;

  const registrationTokens = await DeviceToken.find({
    businessId: alert.businessId,
    userId: { $in: frontOfficeIds },
    notification: true,
  }).lean();

  return {
    room,
    registrationTokens,
    guest: alert.createdBy as { name?: string; phone?: string },
  };
}

async function wakeUpCallAckReminder(job: Job) {
  const { alertId, attempt } = job.data as { alertId: string; attempt: number };
  const alert = await findWakeUpAlert(alertId);

  if (!alert || alert.alertProgress !== "MESSAGE") return { skipped: true };
  if ("acceptedBy" in alert && alert.acceptedBy) return { skipped: true };
  if (alert.wakeUpAt && alert.wakeUpAt <= Date.now()) return { skipped: true };

  const context = await getFrontOfficePushContext(alert);
  if (!context) return { skipped: true };

  const { room, registrationTokens, guest } = context;

  await sendPushToTokens(registrationTokens, {
    title: "Wake-up Call Awaiting Acknowledgement",
    body: `Please acknowledge room ${room.name}${guest?.name ? ` for ${guest.name}` : ""}.`,
    sound: WAKE_UP_NOTIFICATION_SOUND,
    channelId: WAKE_UP_NOTIFICATION_CHANNEL_ID,
    data: {
      type: "HOTEL_WAKEUP_ACK_REMINDER",
      businessId: alert.businessId.toString(),
      roomId: room._id.toString(),
      roomName: room.name,
      alertId: alert._id.toString(),
      guestName: guest?.name || "Guest",
      guestPhone: guest?.phone || "",
    },
  });

  if (attempt < MAX_WAKE_UP_ACK_REMINDERS) {
    await enqueueHotelWakeUpJob(
      "wakeUpCallAckReminder",
      { alertId, attempt: attempt + 1 },
      {
        delay: WAKE_UP_ACK_REMINDER_MS,
        jobId: `hotel-wakeup-ack-${alertId}-${attempt + 1}`,
      },
    );
  }

  return { sent: registrationTokens.length, attempt };
}

async function wakeUpCallDue(job: Job) {
  const { alertId } = job.data as { alertId: string };
  const alert = await findWakeUpAlert(alertId);

  if (!alert || !["MESSAGE", "NOT_DELIVERED"].includes(alert.alertProgress)) {
    return { skipped: true };
  }

  const resolveWakeUpAlert = () =>
    HotelAlert.findByIdAndUpdate(alertId, {
      alertProgress: "RESOLVED",
      deliveredAt: Date.now(),
    });

  const context = await getFrontOfficePushContext(alert);
  if (!context) {
    await resolveWakeUpAlert();
    return { skipped: true, resolved: true };
  }

  const { room, registrationTokens, guest } = context;

  console.log("[hotelWakeUp] sending due notification", {
    alertId,
    roomName: room.name,
    tokenCount: registrationTokens.length,
    channelId: WAKE_UP_NOTIFICATION_CHANNEL_ID,
    sound: WAKE_UP_NOTIFICATION_SOUND,
  });

  await sendPushToTokens(registrationTokens, {
    title: "Wake-up Call Due Now",
    body: `Call room ${room.name}${guest?.name ? ` for ${guest.name}` : ""} now.`,
    sound: WAKE_UP_NOTIFICATION_SOUND,
    channelId: WAKE_UP_NOTIFICATION_CHANNEL_ID,
    data: {
      type: "HOTEL_WAKEUP_DUE",
      businessId: alert.businessId.toString(),
      roomId: room._id.toString(),
      roomName: room.name,
      alertId: alert._id.toString(),
      guestName: guest?.name || "Guest",
      guestPhone: guest?.phone || "",
    },
  });

  await HotelAlert.findByIdAndUpdate(alertId, {
    alertProgress: "NOT_DELIVERED",
  });

  await enqueueHotelWakeUpJob(
    "wakeUpCallDue",
    { alertId },
    {
      delay: WAKE_UP_REMINDER_REPEAT_MS,
      jobId: `hotel-wakeup-repeat-${alertId}-${Date.now()}`,
    },
  );

  return { sent: registrationTokens.length, repeated: true };
}

export const hotelWakeUpHandlers = {
  wakeUpCallAckReminder,
  wakeUpCallDue,
};
