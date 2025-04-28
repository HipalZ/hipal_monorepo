
import type { Document, Types } from "mongoose";
import { Schema, model } from "mongoose";
import { z } from "zod";
import {
  dateSchema,
  requiredObjectIdString,
} from "./utils/common-schemas";              

const couponRemainingZodSchema = z.object({
  couponId: requiredObjectIdString("Coupon ID"),
  remaining: z.number({ required_error: "Remaining is required" }),
  versionId: z.string({ required_error: "Version ID is required" }),
});

export const bookingBusinessZodSchema = z
  .object({
    businessId: requiredObjectIdString("Business ID"),
    date: dateSchema,
    period: z.number({ required_error: "Period is required" }),
    couponsRemaining: z.array(couponRemainingZodSchema).default([]),
    isOpen: z.boolean().default(true),                  
    explicitlyEdited: z.boolean().default(false),
    archived_at: z.date().nullable().default(null),
  })
  .strict();

export interface IBookingBusiness extends Document {
  businessId: Types.ObjectId;
  date: Date;
  period: number;
  couponsRemaining: {
    couponId: Types.ObjectId;
    remaining: number;
    versionId: string;
  }[];
  isOpen: boolean;                                      
  explicitlyEdited: boolean;
  archived_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookingBusinessSchema = new Schema<IBookingBusiness>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    date: { type: Date, required: true },
    period: { type: Number, required: true },
    couponsRemaining: {
      type: [
        {
          couponId: {
            type: Schema.Types.ObjectId,
            ref: "COUPONZ",
            required: true,
          },
          remaining: { type: Number, required: true },
          versionId: { type: String, required: true },
        },
      ],
      default: [],
    },
    isOpen: { type: Boolean, default: true },           
    explicitlyEdited: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true },
);

export const BookingBusinessModel = model<IBookingBusiness>(
  "BookingBusiness",
  bookingBusinessSchema,
);
