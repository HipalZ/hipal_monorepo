import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const UserTagSchema = z.object({
  userId: ObjectIdSchema,
  tagId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  date: z.number().optional(),
  reminderDate: z.number().optional(),
  noteDescription: z.string().optional(),
  noteTitle: z.string().optional(),
  noteUrl: z.string().optional(),
  isDeleted: z.boolean().default(false).optional(),
});

export type UserTag = z.infer<typeof UserTagSchema>;
