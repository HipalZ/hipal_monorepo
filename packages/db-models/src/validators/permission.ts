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
export const permissionSchema = z.object({
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
});

export type StaffPermissionType = z.infer<typeof permissionSchema>;
