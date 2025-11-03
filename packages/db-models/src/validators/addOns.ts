import { z } from "zod";

import { ObjectIdSchema } from "./common";
import { DishTypeEnum } from "./dish";

export const ChoiceTypeEnum = ["CHECKBOX", "NUMBER"] as const;
const Choices = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(2, {
      message: "name must be atleast 3 characters long",
    })
    .max(200, {
      message: "name must be atmost 100 characters long",
    }),
  price: z.coerce.number({
    message: "price is required",
  }),

  visibility: z.boolean().default(true).optional(),
  availability: z.boolean().default(true).optional(),
  choiceMaxQuantity: z.coerce.number().optional().default(1),
  choiceDishType: z.array(z.enum(DishTypeEnum)),
  uuid: z.string().optional(),
});

export const AddOnsAttrs = z.object({
  _id: z.string().optional(),
  businessId: ObjectIdSchema,
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
  compulsory: z.coerce
    .number({
      message: "compulsory is required",
    })
    .default(0)
    .optional(),
  addOnMaxQuantity: z.coerce
    .number({
      message: "maxQuantity is required",
    })
    .default(1)
    .optional(),
  choiceType: z.enum(ChoiceTypeEnum, {
    message: "choiceType is required",
  }),
  dishIds: z.array(ObjectIdSchema).optional().default([]),
  choices: z.array(Choices, {
    message: "choices is required",
  }),
  availability: z.boolean().default(true),
  visibility: z.boolean().default(true),
  isDeleted: z.boolean().default(true).optional(),
  removeDishIds: z.array(ObjectIdSchema).optional().default([]),
  menuId: ObjectIdSchema,
  baseMenuAddOnId: ObjectIdSchema.optional(),
  baseMenuId: ObjectIdSchema.optional(),
  posAddOnId: z.string().min(3).max(100).optional(),
  pos: z.boolean().default(false).optional(),
  active: z.boolean().default(true).optional(),
});

const UpdateChoices = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    })
    .optional(),
  price: z.coerce
    .number({
      message: "price is required",
    })
    .optional(),
  visibility: z.boolean().default(true).optional(),
  availability: z.boolean().default(true).optional(),
  choiceMaxQuantity: z.coerce.number().optional().default(1),
  choiceDishType: z.array(z.enum(DishTypeEnum)).optional(),
  removeDishIds: z.array(ObjectIdSchema).optional().default([]),
  uuid: z.string().optional(),
});

export const updateAddOnSchema = z.object({
  _id: z.string().optional(),
  businessId: ObjectIdSchema.optional(),
  name: z
    .string({
      message: "name is required",
    })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    })
    .optional(),
  compulsory: z.coerce
    .number({
      message: "compulsory is required",
    })
    .default(0)
    .optional(),
  addOnMaxQuantity: z.coerce
    .number({
      message: "maxQuantity is required",
    })
    .default(1)
    .optional(),
  choiceType: z
    .enum(ChoiceTypeEnum, {
      message: "choiceType is required",
    })
    .optional(),
  dishIds: z.array(ObjectIdSchema).optional().default([]),
  choices: z
    .array(UpdateChoices, {
      message: "choices is required",
    })
    .optional(),
  availability: z.boolean().default(true).optional(),
  visibility: z.boolean().default(true).optional(),
  isDeleted: z.boolean().default(true).optional(),
  removeDishIds: z.array(ObjectIdSchema).optional().default([]),
});

export type AddOnType = z.infer<typeof AddOnsAttrs>;
export type ChoiceType = z.infer<typeof Choices>;
