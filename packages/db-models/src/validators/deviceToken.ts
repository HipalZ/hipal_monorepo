import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const deviceTokenSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  token: z.string().min(1).max(700),
  notification: z.boolean().default(true),
  v: z.coerce.number().optional(),
  appUrl: z.string().min(10).max(50).optional(),
  updateFeature: z.array(z.string()).optional(),
});

export type DeviceTokenType = z.infer<typeof deviceTokenSchema>;
