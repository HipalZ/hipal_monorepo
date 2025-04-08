import mongoose, { Schema, model, Types, HydratedDocument } from 'mongoose';
import { z } from 'zod';
import {
  dateSchema,
  requiredObjectIdString,
} from './utils/common-schemas';

const couponRemainingZod = z.object({
  couponId: requiredObjectIdString('couponId'),
  remaining: z.number().int().nonnegative(),
});

const bookingBusinessZod = z.object({
  businessId: requiredObjectIdString('businessId'),
  date: dateSchema,
  period: z.number().int().min(0).max(3),
  slot: z.string().regex(/^([0-2]?\d):([0-5]\d)$/, { message: 'Invalid slot format' }),
  remainingCapacity: z.number().int().nonnegative(),
  couponsRemaining: z.array(couponRemainingZod).optional().default([]),
  bookingsInThisSlot: z.array(requiredObjectIdString('bookingId')).optional().default([]),
  archived_at: z.union([dateSchema, z.null()]).optional(),
});

type BookingBusinessType = z.infer<typeof bookingBusinessZod>;

interface BookingBusinessDoc extends Omit<BookingBusinessType, 'businessId' | 'couponsRemaining' | 'bookingsInThisSlot'> {
  businessId: Types.ObjectId;
  couponsRemaining?: { couponId: Types.ObjectId; remaining: number }[];
  bookingsInThisSlot?: Types.ObjectId[];
  archived_at?: Date | null;
}

const BookingBusinessSchema = new Schema<BookingBusinessDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, required: true },
    period: { type: Number, required: true },
    slot: { type: String, required: true },
    remainingCapacity: { type: Number, required: true },
    couponsRemaining: [{
      couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
      remaining: { type: Number, required: true },
    }],
    bookingsInThisSlot: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

BookingBusinessSchema.pre('save', function (next) {
  const doc = this as HydratedDocument<BookingBusinessDoc>;
  try {
    bookingBusinessZod.parse({
      businessId: doc.businessId.toString(),
      date: doc.date,
      period: doc.period,
      slot: doc.slot,
      remainingCapacity: doc.remainingCapacity,
      couponsRemaining: (doc.couponsRemaining ?? []).map(c => ({
        couponId: c.couponId.toString(),
        remaining: c.remaining,
      })),
      bookingsInThisSlot: (doc.bookingsInThisSlot ?? []).map(id => id.toString()),
      archived_at: doc.archived_at ?? null,
    });
    next();
  } catch (err: any) {
    next(err);
  }
});

export const BookingBusinessModel = model<BookingBusinessDoc>(
  'BookingBusiness',
  BookingBusinessSchema
);
