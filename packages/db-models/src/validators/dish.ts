import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const DishTypeEnum = [
  "VEG",
  "NON_VEG",
  "EGG",
  "VEGAN",
  "ALCOHOL",
  "NON_ALCOHOL",
  "alcohol",
  "non_alcohol",
  "GLUTEN_FREE",
  "MIX",
  "veg",
  "non_veg",
  "egg",
  "vegan",
  "gluten_free",
  "mix",
  "nonVeg",
  "nonveg",
  "non-veg",
  "glutenfree",
  "non veg",
  "NON VEG",
] as const;

export type DishTypeEnumType = (typeof DishTypeEnum)[number];
export const portionSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  price: z.coerce
    .number({
      message: "price is required",
    })
    .positive({
      message: "price must be positive",
    })
    .refine(
      (val) => Number.isFinite(val) && /^\d+(\.\d{1,2})?$/.test(val.toString()),
      { message: "price must have at most 2 decimal places" },
    ),
  default: z.boolean({
    message: "default is required",
  }),
  portionTypes: z.array(
    z.enum(DishTypeEnum, {
      message: "portionType is required",
    }),
    {
      message:
        "portionType must be one of VEG, NON_VEG, EGG, VEGAN, GLUTEN_FREE",
    },
  ),
});

export const dishSchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  name: z
    .string({ message: "name is required " })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  price: z.coerce
    .number({
      message: "price is required",
    })
    .positive({
      message: "price must be positive",
    })
    .refine(
      (val) => Number.isFinite(val) && /^\d+(\.\d{1,2})?$/.test(val.toString()),
      { message: "price must have at most 2 decimal places" },
    ),
  visibility: z.boolean().default(true),
  avgTime: z.coerce
    .number({
      message: "avgTime is required",
    })
    .optional(),
  dishTypes: z.array(
    z.enum(DishTypeEnum, {
      message: "dishType is required",
    }),
    {
      message: "dishType must be one of VEG, NON_VEG, EGG, VEGAN, GLUTEN_FREE",
    },
  ),
  categoryIds: z
    .array(ObjectIdSchema, {
      message: "categoryIds is required",
    })
    .optional(),
  portions: z
    .array(portionSchema, {
      message: "portions is required",
    })
    .optional(),
  addOnIds: z
    .array(ObjectIdSchema, {
      message: "addOnIds is required",
    })
    .optional(),
  kitchenId: ObjectIdSchema.optional(),

  images: z
    .array(
      z
        .string({
          message: "images is required",
        })
        .url({
          message: "images must be a valid url",
        })
        .min(6, {
          message: "images must be atleast 6 characters long",
        })
        .max(100, {
          message: "images must be atmost 100 characters long",
        }),
    )
    .optional(),
  description: z
    .string({
      message: "description is required",
    })
    .min(10, {
      message: "description must be atleast 10 characters long",
    })
    .max(400, {
      message: "description must be atmost 400 characters long",
    })
    .optional(),
  calories: z
    .string({
      message: "calories is required",
    })
    .min(3, {
      message: "calories must be atleast 3 characters long",
    })
    .max(100, {
      message: "calories must be atmost 100 characters long",
    })
    .optional(),
  tags: z
    .array(
      z
        .string({
          message: "tags is required",
        })
        .min(3, {
          message: "tags must be atleast 3 characters long",
        })
        .max(60, {
          message: "tags must be atmost 60 characters long",
        }),
    )
    .optional(),

  recommendationIds: z
    .array(ObjectIdSchema, {
      message: "recommendationids is required",
    })
    .default([])
    .optional(),
  delayTime: z.coerce.number().optional().default(0),
  availability: z.boolean().default(true).optional(),
  isDeleted: z.boolean().default(false).optional(),
  menuId: ObjectIdSchema,

  posDishId: z.string().min(3).max(100).optional(),
  rank: z.number().min(1).max(100).optional(),
  posTax: z.string().min(3).max(100).optional(),
  ignoreTax: z.string().min(3).max(100).optional(),
  ignoreDiscount: z.string().min(3).max(100).optional(),
  pos: z.boolean().default(false).optional(),
  active: z.boolean().default(true).optional(),
});

export const updateDishSchema = z
  .object({
    _id: ObjectIdSchema.optional(),
    name: z.string().min(2).max(100).optional(),
    businessId: ObjectIdSchema.optional(),
    price: z.coerce
      .number()
      .positive()
      .refine(
        (val) =>
          Number.isFinite(val) && /^\d+(\.\d{1,2})?$/.test(val.toString()),
        { message: "price must have at most 2 decimal places" },
      )
      .optional(),
    visibility: z.boolean().optional(),
    dishTypes: z.array(z.enum(DishTypeEnum)).optional(),
    categoryIds: z.array(ObjectIdSchema).optional(),
    portions: z.array(portionSchema).optional(),
    addOnIds: z.array(ObjectIdSchema).optional(),
    kitchenId: ObjectIdSchema.optional(),
    images: z.array(z.string().url().min(6).max(100)).optional(),
    description: z.string().min(10).max(400).optional(),
    calories: z.string().min(3).max(100).optional(),
    tags: z.array(z.string().min(3).max(60)).optional(),
    recommendationIds: z.array(ObjectIdSchema).optional(),
    availability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    removeCategoryIds: z.array(ObjectIdSchema).optional(),
    removeAddOnIds: z.array(ObjectIdSchema).optional(),
    removeRecommendationIds: z.array(ObjectIdSchema).optional(),
    removeKitchenId: ObjectIdSchema.optional(),
  })
  .strict();
export type DishType = z.infer<typeof dishSchema>;
export type PortionType = z.infer<typeof portionSchema>;
