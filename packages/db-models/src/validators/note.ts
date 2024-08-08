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
export const noteSchema = z.object({
  businessId: ObjectIdSchema,
  noteUrl: z.string().min(4).max(255),
  noteTitle: z.string().min(4).max(255),
  noteDescription: z.string().min(4).max(255),
});

export type NoteType = z.infer<typeof noteSchema>;
