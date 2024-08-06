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
export const GroupTypeEnum = ["DYNAMIC", "MANUAL"] as const;
export const groupFilter = z.object({
  duration: z.coerce
    .number({
      message: "days is required",
    })
    .optional(),
  visit: z.coerce
    .number({
      message: "visit is required",
    })
    .optional(),
  visitType: z
    .enum(VisitEnum, {
      message: "visitType is required",
    })
    .optional(),
  spend: z.coerce
    .number({
      message: "price is required",
    })
    .optional(),
  spendType: z
    .enum(VisitEnum, {
      message: "priceType is required",
    })
    .optional(),
  cardBalance: z.coerce
    .number({
      message: "cardBalance is required",
    })
    .optional(),
  cardBalanceType: z
    .enum(VisitEnum, {
      message: "cardBalanceType is required",
    })
    .optional(),
  coinzIssued: z.coerce
    .number({
      message: "coinzIssued is required",
    })
    .optional(),
  coinzIssuedType: z
    .enum(VisitEnum, {
      message: "coinzIssuedType is required",
    })
    .optional(),
  coinzUsed: z.coerce
    .number({
      message: "coinzUsed is required",
    })
    .optional(),
  coinzUsedType: z
    .enum(VisitEnum, {
      message: "coinzUsedType is required",
    })
    .optional(),
  tags: z
    .array(
      z.object({
        tagId: ObjectIdSchema,
        count: z.number(),
      }),
    )
    .optional(),
});

export type VisitEnumType = (typeof VisitEnum)[number];
export type GroupTypeEnumType = (typeof GroupTypeEnum)[number];
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
  groupType: z.enum(GroupTypeEnum, {
    message: "groupType is required",
  }),

  isDeleted: z.boolean().default(false).optional(),

  userIds: z.array(ObjectIdSchema).optional(),
});

export type Group = z.infer<typeof groupSchema>;
export type FilterGroupType = z.infer<typeof groupFilter>;
