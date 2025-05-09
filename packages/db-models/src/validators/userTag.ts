import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const UserTagSchema = z.object({
  userId: ObjectIdSchema,
  tagId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  date: z.number().optional(),
  reminderDate: z.number().optional(),

  isDeleted: z.boolean().default(false).optional(),
});

export type UserTag = z.infer<typeof UserTagSchema>;
