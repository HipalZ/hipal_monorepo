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
export const npcUserSchema = z.object({
  userId: ObjectIdSchema,
  totalNpcAmount: z.coerce.number().default(0),
  businessId: ObjectIdSchema,
});

export type NpcUserType = z.infer<typeof npcUserSchema>;
