import mongoose from 'mongoose';
import { z } from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
const portionSchema = z
  .object({
    name: z.string(),
    price: z.coerce.number().positive(),
    default: z.boolean().optional(),
    portionType: z.string().optional(),
    id: z.string(),
  })
  .optional();

const filtersSchema = z.object({
  dishes: z.array(ObjectIdSchema).optional(),
  timeToConsume: z.coerce.number().optional(),
  portionBestSuited: z.string().min(3).max(100).optional(),
  bestWeather: z.string().min(3).max(100).optional(),
  levelOfSpice: z.string().min(3).max(100).optional(),
  bestOccasion: z.string().min(3).max(100).optional(),
  texture: z.string().min(3).max(100).optional(),
  time: z.coerce.number().optional(),
  metaTags: z.array(z.string().min(3).max(50)).optional(),
});

const tagSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  color: z.string().min(3).max(50).optional(),
  icon: z.string().min(3).max(50).optional(),
  fontColor: z.string().min(3).max(50).optional(),
});

export const dishSchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  name: z.string().min(3).max(100),
  price: z.coerce.number().positive(),
  visibility: z.boolean().default(true),
  avgTime: z.coerce.number().optional(),
  dishType: z.string().min(3).max(100).optional(),
  categories: z.array(ObjectIdSchema).optional(),
  portions: z.array(portionSchema).optional(),
  extras: z.array(ObjectIdSchema).optional(),
  kitchenId: ObjectIdSchema,
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
  images: z.array(z.string().min(6).max(100)).optional(),
  description: z.string().min(10).max(150).optional(),
  tags: z.array(tagSchema).optional(),
  delayTime: z.coerce.number().optional().default(0),
  availability: z.boolean().default(true),
});

export type DishType = z.infer<typeof dishSchema>;
export type PortionType = z.infer<typeof portionSchema>;

export type FiltersType = z.infer<typeof filtersSchema>;
// export type CategoryType = z.infer<typeof categorySchema>;
export type TagType = z.infer<typeof tagSchema>;
