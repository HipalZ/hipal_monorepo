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

export const schedularManagerSchema = z.object({
  businessId: ObjectIdSchema,
  schedularJobs: z.object({}),
});

export type SchedularManagerType = z.infer<typeof schedularManagerSchema>;
