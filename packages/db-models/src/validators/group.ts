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

export const VisitEnum = ["ABOVE", "BELOW", "EQUAL"] as const;
export const groupFilter = z.object({
  duration: z.coerce.number({
    message: "days is required",
  }),
  visit: z.coerce.number({
    message: "visit is required",
  }),
  visitType: z.enum(VisitEnum, {
    message: "visitType is required",
  }),
  spend: z.coerce.number({
    message: "price is required",
  }),
  spendType: z.enum(VisitEnum, {
    message: "priceType is required",
  }),
});

export type VisitEnumType = (typeof VisitEnum)[number];
export const groupSchema = z.object({
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
  businessId: ObjectIdSchema,
  description: z
    .string({
      message: "description is required",
    })
    .min(3, {
      message: "description must be atleast 3 characters long",
    })
    .max(100, {
      message: "description must be atmost 100 characters long",
    })
    .optional(),
  filter: z.array(groupFilter).optional(),
  groupColor: z.string().optional(),

  autoUpdate: z.boolean().optional(),

  isDeleted: z.boolean().default(false).optional(),

  userIds: z.array(ObjectIdSchema).optional(),
  groupType: z.string().optional(),
});

export type Group = z.infer<typeof groupSchema>;
export type FilterGroupType = z.infer<typeof groupFilter>;
