import { DeviceToken, HotelNotificationJob } from "@hi/db-models";
import mongoose from "mongoose";
import { sendPushToTokens } from "../services/notifications";

const TICK_MS = 1_000;
const CLAIM_LIMIT = 20;
const LOCK_MS = 120_000;
let timer: ReturnType<typeof setInterval> | null = null;
let sweeping = false;

type NotificationJobDoc = {
  _id: unknown;
  businessId: unknown;
  targetUserIds?: unknown[];
  title: string;
  body: string;
  data?: Map<string, string> | Record<string, string>;
  attempts?: number;
  maxAttempts?: number;
};

const serializeData = (data: NotificationJobDoc["data"]) => {
  if (!data) return {};
  if (data instanceof Map) {
    return Object.fromEntries(data.entries());
  }
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)]),
  );
};

const retryDelayMs = (attempts: number) =>
  Math.min(60_000, Math.max(2_000, 2 ** Math.max(0, attempts - 1) * 2_000));

const markFailedOrRetry = async (
  job: NotificationJobDoc,
  lastError: string,
  terminalStatus: "FAILED" | "NO_TARGET" = "FAILED",
) => {
  const now = Date.now();
  const attempts = Number(job.attempts || 0);
  const maxAttempts = Number(job.maxAttempts || 8);
  const exhausted = attempts >= maxAttempts;

  await HotelNotificationJob.findByIdAndUpdate(job._id, {
    $set: {
      status: exhausted ? terminalStatus : "RETRY",
      lastError,
      nextAttemptAt: exhausted ? now : now + retryDelayMs(attempts),
      updatedAt: now,
    },
    $unset: { lockedUntil: "" },
  });
};

const claimNextJob = async () => {
  const now = Date.now();

  return HotelNotificationJob.findOneAndUpdate(
    {
      $or: [
        {
          status: { $in: ["PENDING", "RETRY"] },
          nextAttemptAt: { $lte: now },
        },
        {
          status: "PROCESSING",
          lockedUntil: { $lte: now },
        },
      ],
    },
    {
      $set: {
        status: "PROCESSING",
        lockedUntil: now + LOCK_MS,
        updatedAt: now,
      },
      $inc: { attempts: 1 },
    },
    { sort: { createdAt: 1 }, new: true },
  ).lean();
};

const processJob = async (job: NotificationJobDoc) => {
  const now = Date.now();
  const targetUserIds = (job.targetUserIds || []).map((id) => String(id));

  if (!targetUserIds.length) {
    await markFailedOrRetry(job, "No target staff ids found", "NO_TARGET");
    return;
  }

  const tokens = await DeviceToken.find({
    businessId: job.businessId,
    userId: { $in: targetUserIds },
    notification: true,
  }).lean();

  if (!tokens.length) {
    await markFailedOrRetry(job, "No active device tokens found", "NO_TARGET");
    return;
  }

  const results = await sendPushToTokens(tokens, {
    title: job.title,
    body: job.body,
    data: serializeData(job.data),
  });

  const successCount = results.filter((result) => result.success).length;
  if (successCount > 0) {
    await HotelNotificationJob.findByIdAndUpdate(job._id, {
      $set: {
        status: "SENT",
        sentAt: now,
        updatedAt: now,
      },
      $unset: { lockedUntil: "", lastError: "" },
    });
    return;
  }

  const error = results.map((result) => result.error).filter(Boolean).join(" | ");
  await markFailedOrRetry(job, error || "Push provider returned no successful sends");
};

export const sweepHotelNotificationJobs = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1 || sweeping) return;

  sweeping = true;
  try {
    for (let i = 0; i < CLAIM_LIMIT; i += 1) {
      const job = (await claimNextJob()) as unknown as NotificationJobDoc | null;
      if (!job) break;

      try {
        await processJob(job);
      } catch (error) {
        await markFailedOrRetry(
          job,
          error instanceof Error ? error.message : String(error),
        ).catch((updateError) =>
          console.error("[hotelNotificationSweeper] failed to record failure", updateError),
        );
      }
    }
  } finally {
    sweeping = false;
  }
};

export const startHotelNotificationSweeper = (): void => {
  if (timer) return;
  timer = setInterval(() => {
    sweepHotelNotificationJobs().catch((error) =>
      console.error("[hotelNotificationSweeper] tick failed", error),
    );
  }, TICK_MS);
  sweepHotelNotificationJobs().catch((error) =>
    console.error("[hotelNotificationSweeper] initial sweep failed", error),
  );
  console.log(`[hotelNotificationSweeper] started (every ${TICK_MS / 1000}s)`);
};

export const stopHotelNotificationSweeper = (): void => {
  if (timer) clearInterval(timer);
  timer = null;
};
