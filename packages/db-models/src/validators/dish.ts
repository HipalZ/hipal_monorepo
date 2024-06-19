import { z } from 'zod';

const portionSchema = z.object({
  name: z.string(),
  price: z.coerce.number(),
  discount: z.coerce.number().optional(),
  default: z.boolean(),
  portionType: z.string().optional(),
  id: z.string(),
});

const filtersSchema = z.object({
  dishes: z.array(z.string()).optional(),
  timeToConsume: z.coerce.number().optional(),
  portionBestSuited: z.string().optional(),
  bestWeather: z.string().optional(),
  levelOfSpice: z.string().optional(),
  bestOccasion: z.string().optional(),
  texture: z.string().optional(),
  time: z.coerce.number().optional(),
  metaTags: z.array(z.string()).optional(),
});

const tagSchema = z.object({
  name: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  fontColor: z.string().optional(),
});

export const dishSchema = z.object({
  businessId: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  swiggy: z.coerce.number().optional(),
  visibility: z.boolean().default(true),
  discount: z.coerce.number().optional(),
  avgTime: z.coerce.number().optional(),
  dishType: z.string(),
  categories: z.array(z.string()).optional(),
  portions: z.array(portionSchema).optional(),
  extras: z.array(z.string()).optional(),
  kitchenId: z.string(),
  filters: filtersSchema
    .default({
      timeToConsume: 0,
      portionBestSuited: '',
      bestWeather: '',
      levelOfSpice: '',
      bestOccasion: '',
      texture: '',
      time: 0,
      dishes: [],
      metaTags: [], // added this line
    })
    .optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  tags: z.array(tagSchema).optional(),
  links: z.array(z.string()).optional(),
  delayTime: z.coerce.number().optional().default(0),
  availability: z.boolean().default(true),
});

export type DishType = z.infer<typeof dishSchema>;
export type PortionType = z.infer<typeof portionSchema>;

export type FiltersType = z.infer<typeof filtersSchema>;
// export type CategoryType = z.infer<typeof categorySchema>;
export type TagType = z.infer<typeof tagSchema>;
