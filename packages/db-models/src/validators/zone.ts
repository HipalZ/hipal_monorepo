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

export const zoneChema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  businessId: ObjectIdSchema,
  staffIds: z.array(ObjectIdSchema).optional(),
  zoneId: z.string().min(3).max(100).optional(),
  isDeleted: z.boolean().default(false).optional(),
  active: z.string().min(1).max(30).optional(),
  rank: z.string().min(1).max(30).optional(),
});

export type ZoneType = z.infer<typeof zoneChema>;
