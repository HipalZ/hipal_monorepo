import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const HierarchyEnum = ["PARENT", "CHILD"] as const;

export const timingSchema = z.object({
  day: z
    .number()
    .int()
    .min(-1, { message: "Day must be between -1 (All) and 6 (Sat)" })
    .max(6, { message: "Day must be between -1 (All) and 6 (Sat)" }),
  start: z
    .number()
    .int()
    .min(0, { message: "Start time must be at least 0" })
    .max(1440, { message: "Start time cannot exceed 1440" }),
  end: z
    .number()
    .int()
    .min(0, { message: "End time must be at least 0" })
    .max(1440, { message: "End time cannot exceed 1440" }),
});
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
  baseMenuCategoryId: ObjectIdSchema.optional(),
  baseMenuId: ObjectIdSchema.optional(),
  posCategoryId: z.string().min(3).max(100).optional(),
  rank: z.number().min(1).max(100).optional(),
  categoryTimings: z.string().min(3).max(200).optional(),
  pos: z.boolean().default(false).optional(),
  active: z.boolean().default(true).optional(),
  timings: z.array(timingSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const catalogueSchema = z.object({
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
  rank: z.number().min(1).max(100).optional(),
  categoryTimings: z.string().min(3).max(200).optional(),
  active: z.boolean().default(true).optional(),
  timings: z.array(timingSchema).optional(),
});

export const timingsArraySchema = z
  .array(timingSchema)
  .max(7, { message: "You can define timings for at most 7 days" })
  .refine(
    (arr) => {
      // If "all days" (-1) exists, it must be the ONLY entry
      const hasAllDay = arr.some((t) => t.day === -1);
      return !hasAllDay || arr.length === 1;
    },
    {
      message: "If 'day = -1 (All)', only one object is allowed",
    },
  );

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
  timings: timingsArraySchema.optional(),
});

export const updateCatalogueSchema = z.object({
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
export type TimingType = z.infer<typeof timingSchema>;
