import { z } from "zod";
import { DishTypeEnum } from "../validators/dish";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const DishTypeUnique = ["VEG", "NON_VEG", "EGG", "VEGAN"] as const;
export const uniquelyYoursSchema = z.object({
  name: z.string().min(3).max(255),
  businessId: ObjectIdSchema,
  dishId: z.string().min(3).max(255),
  dishTypes: z.array(z.enum(DishTypeEnum)),
  images: z.array(z.string().url().min(10).max(100)),
  isDeleted: z.boolean().default(false).optional(),
});

export type UniquelyYoursType = z.infer<typeof uniquelyYoursSchema>;
