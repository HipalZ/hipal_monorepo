import mongoose from "mongoose";
import { z } from "zod";
import { DishTypeEnum } from "../validators/dish";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const DishTypeUnique = ["VEG", "NON_VEG", "EGG", "VEGAN"] as const;
export const uniquelyYoursSchema = z.object({
  name: z.string().min(3).max(255),
  businessId: ObjectIdSchema,
  dishId: ObjectIdSchema,
  dishTypes: z.array(z.enum(DishTypeEnum)),
  images: z.array(z.string().url().min(10).max(100)),
  isDeleted: z.boolean().default(false).optional(),
});

export type UniquelyYoursType = z.infer<typeof uniquelyYoursSchema>;
