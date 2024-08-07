import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string({
      message: "Invalid ObjectId",
    })
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
export const TagSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  description: z.string().optional(),
  createdBy: ObjectIdSchema,
  businessId: ObjectIdSchema,
  displayForCaptains: z.boolean().default(true).optional(),
  repeat: z.number().optional(),
  remainderInDuration: z.string().optional(),
  noteTitle: z.string().optional(),
  noteDescription: z.string().optional(),
  noteUrl: z.string().optional(),

  isDeleted: z.boolean().default(false).optional(),
  duration: z.number().optional(),
  time: z.number().optional(),
});

export type TagType = z.infer<typeof TagSchema>;
