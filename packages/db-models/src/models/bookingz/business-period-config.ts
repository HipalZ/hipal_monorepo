import type { Document, Types } from "mongoose";
import { Schema, model } from "mongoose";
import { z } from "zod";
import { requiredObjectIdString, zDayRange, zPeriodRange } from "./utils";

// Zod schema for a coupon allocation item
const couponAllocationZodSchema = z.object({
  couponId: requiredObjectIdString("Coupon ID"),
  remaining: z.number({ required_error: "Remaining is required" }),
});
export type CouponAllocInput = z.infer<typeof couponAllocationZodSchema>;

// Zod schema for BusinessPeriodConfig
export const businessPeriodConfigZodSchema = z
  .object({
    businessDayConfigId: requiredObjectIdString("Business Day Config ID"),
    period: z.number({ required_error: "Period is required" }),
    baseCharge: z.number().default(0),
    redeemableCoverCharge: z.number().default(0),
    couponAllocations: z.array(couponAllocationZodSchema).default([]),
    isOpen: z.boolean().default(false),
    archived_at: z.date().nullable().default(null),
  })
  .strict();

function parseList(val: unknown): unknown {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    if (val.startsWith("[")) {
      try {
        return JSON.parse(val);
      } catch {}
    }
    return val.split(",").map((s) => s.trim());
  }
  return val;
}

export const filterQuerySchema = z
  .object({
    days: z.preprocess(
      parseList,
      z
        .array(zDayRange)
        .max(7)
        .refine((a) => new Set(a).size === a.length, {
          message: "no duplicates",
        })
        .optional(),
    ),
    periods: z.preprocess(
      parseList,
      z
        .array(zPeriodRange)
        .max(4)
        .refine((a) => new Set(a).size === a.length, {
          message: "no duplicates",
        })
        .optional(),
    ),
  })
  .strict();

export const bulkUpdatePeriodsBodySchema = z.array(
  z.object({
    dayOfWeek: zDayRange,
    period: zPeriodRange,
    baseCharge: z.number().optional(),
    redeemableCoverCharge: z.number().optional(),
    isOpen: z.boolean().optional(),
    couponAllocations: z.array(couponAllocationZodSchema).optional(),
  }),
);

export type BulkPeriodUpdate = z.infer<typeof bulkUpdatePeriodsBodySchema>;

export const upsertPeriodPayloadSchema = businessPeriodConfigZodSchema
  .pick({
    baseCharge: true,
    redeemableCoverCharge: true,
    isOpen: true,
    couponAllocations: true,
  })
  .partial();

// TypeScript interface for a BusinessPeriodConfig document
export interface IBusinessPeriodConfig extends Document {
  businessDayConfigId: Types.ObjectId;
  period: number;
  baseCharge: number;
  redeemableCoverCharge: number;
  couponAllocations: { couponId: Types.ObjectId; remaining: number }[];
  isOpen: boolean;
  archived_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const businessPeriodConfigSchema = new Schema<IBusinessPeriodConfig>(
  {
    businessDayConfigId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessDayConfig",
      required: true,
    },
    period: { type: Number, required: true },
    baseCharge: { type: Number, default: 0 },
    redeemableCoverCharge: { type: Number, default: 0 },
    couponAllocations: {
      type: [
        {
          couponId: {
            type: Schema.Types.ObjectId,
            ref: "COUPONZ",
            required: true,
          },
          remaining: { type: Number, required: true },
        },
      ],
      default: [],
    },
    isOpen: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true },
);

export const BusinessPeriodConfigModel = model<IBusinessPeriodConfig>(
  "BusinessPeriodConfig",
  businessPeriodConfigSchema,
);
