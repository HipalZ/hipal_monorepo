import { z } from "zod";

const Dish = z.object({
  id: z.string(),
  name: z.string(),
});

export const categorySchema = z.object({
  businessId: z.string(),
  name: z.string(),
  visibility: z.boolean(),
  timerOn: z.boolean(),
  timerStart: z.string().optional(),
  timerEnd: z.string().optional(),
  availableDays: z.array(z.number()),
  hierarchy: z.string(),
  parentCategory: z.string().optional(),
  parentCategoryId: z.string().optional(),
  coverImage: z.string().optional(),
  links: z.array(z.string()),
  dishes: z.array(Dish),
  version: z.number(),
  availability: z.boolean().default(true),
  charges: z.array(z.unknown()),
});

export type CategoryType = z.infer<typeof categorySchema>;
