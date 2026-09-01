import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelNotificationJobStatusEnum = [
  "PENDING",
  "PROCESSING",
  "RETRY",
  "SENT",
  "FAILED",
  "NO_TARGET",
] as const;

const HOTEL_NOTIFICATION_JOB_TTL_MS = 36 * 60 * 60 * 1000;

export const hotelNotificationJob = z.object({
  businessId: ObjectIdSchema,
  alertId: ObjectIdSchema.optional(),
  targetUserIds: z.array(ObjectIdSchema).default([]),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  data: z.record(z.string(), z.string()).default({}),
  status: z.enum(hotelNotificationJobStatusEnum).default("PENDING"),
  attempts: z.number().int().min(0).default(0),
  maxAttempts: z.number().int().min(1).default(8),
  nextAttemptAt: z.number(),
  lockedUntil: z.number().optional(),
  lastError: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  expiresAt: z.date().default(() => new Date(Date.now() + HOTEL_NOTIFICATION_JOB_TTL_MS)),
  sentAt: z.number().optional(),
});

export type HotelNotificationJobType = z.infer<typeof hotelNotificationJob>;
