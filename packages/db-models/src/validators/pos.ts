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
export const posSchema = z.object({
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

  secretKey: z.string().min(3).max(200),
  accessKey: z.string().min(3).max(200),
  authToken: z.string().min(3).max(200),
  restId: z.string().min(3).max(200),

  isDeleted: z.boolean().default(false).optional(),
});

export type PosType = z.infer<typeof posSchema>;
