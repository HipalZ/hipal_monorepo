import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
  //TODO: ADD MULTIPLE
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
  //no need to add in model
  subCategoryIds: z
    .array(ObjectIdSchema, {
      message: "subCategoryIds is required",
    })
    .optional()
    .default([]),
  isDeleted: z.boolean().default(false).optional(),

  availability: z.boolean().default(true).optional(),
  sequence: z.number().optional(),
  menuId: ObjectIdSchema,
  posCategoryId: z.string().min(3).max(100).optional(),
  rank: z.number().min(1).max(100).optional(),
  categoryTimings: z.string().min(3).max(200).optional(),
  pos: z.boolean().default(false).optional(),
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
  isDeleted: z.boolean().default(false).optional(),

  removeSubCategoryIds: z.array(ObjectIdSchema).optional().default([]),
  removeDishIds: z.array(ObjectIdSchema).optional().default([]),
  removeParentCategoryIds: z.array(ObjectIdSchema).optional().default([]),
  sequence: z.number().optional(),
});

export type CategoryType = z.infer<typeof categorySchema>;
