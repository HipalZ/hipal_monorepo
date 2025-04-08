import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { z } from 'zod';
import { requiredObjectIdString, dateSchema } from './utils/common-schemas';

const couponZod = z.object({
  businessId: requiredObjectIdString('businessId'),
  name: z.string(),
  discountPercentage: z.number().min(1).max(100),
  maxDiscountValue: z.number().positive(),
  archived_at: z.union([dateSchema, z.null()]).optional(),
});

type CouponType = z.infer<typeof couponZod>;

interface CouponDoc extends Omit<CouponType, 'businessId'> {
  businessId: Types.ObjectId;
  archived_at?: Date | null;
}

const CouponSchema = new Schema<CouponDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    maxDiscountValue: { type: Number, required: true },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

CouponSchema.pre('save', function (next) {
  const doc = this as HydratedDocument<CouponDoc>;
  try {
    couponZod.parse({
      businessId: doc.businessId.toString(),
      name: doc.name,
      discountPercentage: doc.discountPercentage,
      maxDiscountValue: doc.maxDiscountValue,
      archived_at: doc.archived_at ?? null,
    });
    next();
  } catch (err: any) {
    next(err);
  }
});

export const CouponModel = model<CouponDoc>('Coupon', CouponSchema);
