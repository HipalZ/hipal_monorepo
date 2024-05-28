import { z } from "zod";

const portionSchema = z.object({
  name: z.string(),
  price: z.number(),
  discount: z.number(),
  default: z.boolean(),
  portionType: z.string(),
  id: z.string(),
});

const extraItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  visibility: z.boolean(),
  maxQuantity: z.number(),
  extraType: z.string(),
  id: z.string(),
});

const extraSchema = z.object({
  name: z.string(),
  numOptions: z.number(),
  numSelections: z.number(),
  compulsory: z.number(),
  maxQuantity: z.number(),
  addOnType: z.enum(["single", "multiple"]),
  items: z.array(extraItemSchema),
  id: z.string(),
  businessId: z.string(),
});

const filtersSchema = z.object({
  dishes: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
    })
  ),
  timeToConsume: z.number(),
  portionBestSuited: z.string(),
  bestWeather: z.string(),
  levelOfSpice: z.string(),
  bestOccasion: z.string(),
  texture: z.string(),
  time: z.number(),
  metaTag: z.array(z.string()),
});

const categorySchema = z.object({
  name: z.string(),
  id: z.string(),
});

const tagSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
  fontColor: z.string(),
});

export const dishSchema = z.object({
  businessId: z.string(),
  name: z.string(),
  price: z.number(),
  swiggy: z.number().optional(),
  visibility: z.boolean().default(true),
  discount: z.number().optional(),
  avgTime: z.number().optional(),
  dishType: z.string(),
  categories: z.array(categorySchema).optional(),
  portions: z.array(portionSchema).optional(),
  extras: z.array(extraSchema).default([]),
  kitchenId: z.string(),
  filters: filtersSchema.default({
    timeToConsume: 0,
    portionBestSuited: "",
    bestWeather: "",
    levelOfSpice: "",
    bestOccasion: "",
    texture: "",
    time: 0,
    dishes: [],
    metaTag: [], // added this line
  }),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  links: z.array(z.string()).optional(),
  delayTime: z.number().optional().default(0),
  availability: z.boolean().default(true),
});

export type DishType = z.infer<typeof dishSchema>;
export type PortionType = z.infer<typeof portionSchema>;
export type ExtraItemType = z.infer<typeof extraItemSchema>;
export type ExtraType = z.infer<typeof extraSchema>;
export type FiltersType = z.infer<typeof filtersSchema>;
// export type CategoryType = z.infer<typeof categorySchema>;
export type TagType = z.infer<typeof tagSchema>;
