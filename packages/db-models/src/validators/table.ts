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
export const tableSchema = z.object({
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
  zoneId: z.string().min(4).max(100),
  staffIds: z.array(ObjectIdSchema).optional(),
  capacity: z.number().optional(),
  displayForCaptains: z.boolean().default(true).optional(),

  tableId: z.string().min(3).max(100).optional(),

  active: z.string().min(1).max(30).optional(),
  rank: z.string().min(1).max(30).optional(),

  isDeleted: z.boolean().default(false).optional(),
});

export type TableType = z.infer<typeof tableSchema>;
