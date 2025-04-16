import type { Document, Types } from "mongoose";
import { Schema, model } from "mongoose";
import { z } from "zod";
import {
  dateSchema,
  normalizeTime,
  parseTimeToMinutes,
  requiredObjectIdString,
  startTimeValidator,
} from "./utils";

// Zod schema for Booking with half‑hour validation for the "slot" field
export const bookingZodSchema = z
  .object({
    customerId: z.string().nullable(), // Optional; can be further validated as ObjectId if needed
    createdByUserId: requiredObjectIdString("Created By User ID"),
    businessId: requiredObjectIdString("Business ID"),
    bookingDate: dateSchema,
    slot: startTimeValidator,
    period: z.number({ required_error: "Period is required" }),
    numberOfGuests: z.number({
      required_error: "Number of guests is required",
    }),
    coupon: z.any().optional(), // Snapshot of coupon details
    bookingBill: z.number({ required_error: "Booking bill is required" }),
    redeemableCoverCharge: z.number().default(0),
    status: z.enum([
      "pending",
      "paid",
      "cancelled",
      "check-in",
      "check-in-late",
      "billed",
      "expired",
    ]),
    holdExpiresAt: z.date().optional(),
    walkInName: z.string().optional(),
    walkInPhone: z.string().optional(),
    walkInEmail: z.string().optional(),
    qrCode: z.string().optional(),
    uniqueCode: z.string().optional(),
    bookingPaymentId: z.string().optional(),
    checkInCount: z.number().default(0),
    minCheckInTime: z.date(),
    maxCheckInTime: z.date(),
    note: z.string().default(""),
    archived_at: z.date().nullable().default(null),
  })
  .strict();

// TypeScript interface for a Booking document
export interface IBooking extends Document {
  customerId: Types.ObjectId | null;
  createdByUserId: Types.ObjectId;
  businessId: Types.ObjectId;
  bookingDate: Date;
  slot: string;
  period: number;
  numberOfGuests: number;
  coupon?: any;
  bookingBill: number;
  redeemableCoverCharge: number;
  status:
    | "pending"
    | "paid"
    | "cancelled"
    | "check-in"
    | "check-in-late"
    | "billed"
    | "expired";
  holdExpiresAt?: Date;
  walkInName?: string;
  walkInPhone?: string;
  walkInEmail?: string;
  qrCode?: string;
  uniqueCode?: string;
  bookingPaymentId?: string;
  checkInCount: number;
  minCheckInTime: Date;
  maxCheckInTime: Date;
  note: string;
  archived_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Booking
const bookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    bookingDate: { type: Date, required: true },
    slot: { type: String, required: true },
    period: { type: Number, required: true },
    numberOfGuests: { type: Number, required: true },
    coupon: { type: Schema.Types.Mixed },
    bookingBill: { type: Number, required: true },
    redeemableCoverCharge: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "cancelled",
        "check-in",
        "check-in-late",
        "billed",
        "expired",
      ],
      required: true,
    },
    holdExpiresAt: { type: Date },
    walkInName: { type: String },
    walkInPhone: { type: String },
    walkInEmail: { type: String },
    qrCode: { type: String },
    uniqueCode: { type: String },
    bookingPaymentId: { type: String },
    checkInCount: { type: Number, default: 0 },
    minCheckInTime: { type: Date, required: true },
    maxCheckInTime: { type: Date, required: true },
    note: { type: String, default: "" },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true },
);

bookingSchema.pre("save", function (next) {
  if (this.slot && typeof this.slot === "string") {
    const normalizedSlot = normalizeTime(this.slot);
    const minutes = parseTimeToMinutes(normalizedSlot);
    if (minutes < 240 || minutes > 1650 || minutes % 30 !== 0) {
      return next(
        new Error(
          'Slot must be in half-hour format between "04:00" and "27:30"',
        ),
      );
    }
    this.slot = normalizedSlot;
  }
  next();
});

export const BookingModel = model<IBooking>("Booking", bookingSchema);
