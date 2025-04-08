import mongoose, { Schema, model, Types, HydratedDocument } from 'mongoose';
import { z } from 'zod';
import {
  dateSchema,
  objectIdString,
  requiredObjectIdString,
} from './utils/common-schemas';

const bookingStatus = ['pending', 'booking-paid', 'cancelled', 'check-in', 'billed', 'expired'] as const
const bookingZod = z.object({
  userId: objectIdString('userId'),
  createdByUserId: requiredObjectIdString('createdByUserId'),
  businessId: requiredObjectIdString('businessId'),
  bookingDate: dateSchema,
  slot: z.string().regex(/^([0-2]?\d):([0-5]\d)$/, { message: 'Invalid slot format' }), // eg. "27:45"
  period: z.number().min(0).max(3),
  numberOfGuests: z.number().min(1),
  couponId: objectIdString('couponId').optional(),
  coverChargeTotal: z.number().min(0),
  status: z.enum(bookingStatus),
  holdExpiresAt: dateSchema.optional(),
  walkInName: z.string().optional().nullable(),
  walkInPhone: z.string().optional().nullable(),
  walkInEmail: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  checkInCount: z.number().optional().default(0),
  archived_at: z.union([dateSchema, z.null()]).optional(),
});

type BookingType = z.infer<typeof bookingZod>;

interface BookingDoc extends Omit<BookingType, 'userId' | 'createdByUserId' | 'businessId' | 'couponId'> {
  userId?: Types.ObjectId | null;
  createdByUserId: Types.ObjectId;
  businessId: Types.ObjectId;
  couponId?: Types.ObjectId;
  bookingDate: Date;
  holdExpiresAt?: Date;
  archived_at?: Date | null;
}

const BookingSchema = new Schema<BookingDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    bookingDate: { type: Date, required: true },
    slot: { type: String, required: true },
    period: { type: Number, required: true },
    numberOfGuests: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    coverChargeTotal: { type: Number, required: true },
    status: { type: String, enum: bookingStatus, required: true },
    holdExpiresAt: { type: Date },
    walkInName: { type: String, default: null },
    walkInPhone: { type: String, default: null },
    walkInEmail: { type: String, default: null },
    qrCode: { type: String, default: null },
    checkInCount: { type: Number, default: 0 },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

BookingSchema.pre('save', function (next) {
  const doc = this as HydratedDocument<BookingDoc>;
  try {
    bookingZod.parse({
      userId: doc.userId?.toString() ?? null,
      createdByUserId: doc.createdByUserId.toString(),
      businessId: doc.businessId.toString(),
      bookingDate: doc.bookingDate,
      slot: doc.slot,
      period: doc.period,
      numberOfGuests: doc.numberOfGuests,
      couponId: doc.couponId?.toString() ?? null,
      coverChargeTotal: doc.coverChargeTotal,
      status: doc.status,
      holdExpiresAt: doc.holdExpiresAt,
      walkInName: doc.walkInName,
      walkInPhone: doc.walkInPhone,
      walkInEmail: doc.walkInEmail,
      qrCode: doc.qrCode,
      checkInCount: doc.checkInCount,
      archived_at: doc.archived_at ?? null,
    });
    next();
  } catch (err: any) {
    next(err);
  }
});

export const BookingModel = model<BookingDoc>('Booking', BookingSchema);
