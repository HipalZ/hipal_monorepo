import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const UserTagSchema = z.object({
  userId: ObjectIdSchema,
  tagId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  date: z.number().optional(),
  reminderDate: z.number().optional(),

  isDeleted: z.boolean().default(false).optional(),
});

export type UserTag = z.infer<typeof UserTagSchema>;
