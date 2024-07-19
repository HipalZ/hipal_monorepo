import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const HierarchyEnum = ["PARENT", "CHILD"] as const;
export const categorySchema = z.object({
  _id: ObjectIdSchema.optional(),
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
  visibility: z.boolean().default(true).optional(),

  hierarchy: z.enum(HierarchyEnum, {
    message: "hierarchy is required",
  }),

  parentCategoryIds: z
    .array(ObjectIdSchema, {
      message: "parentCategoryIds is required",
    })
    .optional()
    .default([]),
  coverImage: z
    .string({
      message: "coverImage is required",
    })
    .url({
      message: "coverImage must be a valid url",
    })
    .min(10, {
      message: "coverImage must be atleast 10 characters long",
    })
    .max(100, {
      message: "coverImage must be atmost 100 characters long",
    })
    .optional(),
  dishIds: z
    .array(ObjectIdSchema, {
      message: "dishIds is required",
    })
    .optional()
    .default([]),
  subCategoryIds: z
    .array(ObjectIdSchema, {
      message: "subCategoryIds is required",
    })
    .optional()
    .default([]),

  availability: z.boolean().default(true).optional(),
});

export const updateCategorySchema = z.object({
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
  visibility: z.boolean().default(true).optional(),

  coverImage: z
    .string({
      message: "coverImage is required",
    })
    .url({
      message: "coverImage must be a valid url",
    })
    .min(10, {
      message: "coverImage must be atleast 10 characters long",
    })
    .max(100, {
      message: "coverImage must be atmost 100 characters long",
    })
    .optional(),
  businessId: ObjectIdSchema.optional(),
  dishIds: z
    .array(ObjectIdSchema, {
      message: "dishIds is required",
    })
    .optional()
    .default([]),
  subCategoryIds: z
    .array(ObjectIdSchema, {
      message: "subCategoryIds is required",
    })
    .optional()
    .default([]),
  availability: z.boolean().default(true).optional(),
  parentCategoryIds: z
    .array(ObjectIdSchema, {
      message: "parentCategoryIds is required",
    })
    .optional()
    .default([]),

  removeSubCategoryIds: z.array(ObjectIdSchema).optional().default([]),
  removeDishIds: z.array(ObjectIdSchema).optional().default([]),
  removeParentCategoryIds: z.array(ObjectIdSchema).optional().default([]),
});

export type CategoryType = z.infer<typeof categorySchema>;
