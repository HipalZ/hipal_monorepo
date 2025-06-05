import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const checkInQrUserValidator = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  date: z.number().optional(),
  qrId: ObjectIdSchema,
  code: z.string().min(4).max(4).optional(),
});

export type CheckInQrUserValidator = z.infer<typeof checkInQrUserValidator>;
