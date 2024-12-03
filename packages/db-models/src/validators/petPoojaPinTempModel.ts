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
export const petPoojaPinTempModelSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  pin: z.string().min(10).max(10),
  tableName: z.string().min(1).max(20),
});

export type PetPoojaPinTempModelType = z.infer<
  typeof petPoojaPinTempModelSchema
>;
