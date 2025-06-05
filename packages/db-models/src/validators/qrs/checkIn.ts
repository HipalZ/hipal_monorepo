import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const checkInQrValidator = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(1).max(50),
  downloadLink: z.string().url().optional(),
  date: z.number().optional(),
  isDeleted: z.boolean().default(false),
  userCount: z.number().default(0),
});

export const updateCheckInQrValidator = z.object({
  name: z.string().min(1).max(50).optional(),
});

export type CheckInQrValidator = z.infer<typeof checkInQrValidator>;
