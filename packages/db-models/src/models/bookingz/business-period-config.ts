import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { z } from 'zod';
import { requiredObjectIdString, dateSchema } from './utils/common-schemas';

const couponAllocationZod = z.object({
  couponId: requiredObjectIdString('couponId'),
  quantity: z.number().int().positive(),
});

const businessPeriodConfigZod = z.object({
  businessDayConfigId: requiredObjectIdString('businessDayConfigId'),
  period: z.number().int().min(0).max(3),
  coverCharge: z.number().min(0),
  couponAllocations: z.array(couponAllocationZod).optional().default([]),
  archived_at: z.union([dateSchema, z.null()]).optional(),
});

type BusinessPeriodConfigType = z.infer<typeof businessPeriodConfigZod>;

interface BusinessPeriodConfigDoc extends Omit<BusinessPeriodConfigType, 'businessDayConfigId' | 'couponAllocations'> {
  businessDayConfigId: Types.ObjectId;
  couponAllocations?: { couponId: Types.ObjectId; quantity: number }[];
  archived_at?: Date | null;
}

const BusinessPeriodConfigSchema = new Schema<BusinessPeriodConfigDoc>(
  {
    businessDayConfigId: { type: Schema.Types.ObjectId, ref: 'BusinessDayConfig', required: true },
    period: { type: Number, required: true },
    coverCharge: { type: Number, required: true },
    couponAllocations: [{
      couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
      quantity: { type: Number, required: true },
    }],
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

BusinessPeriodConfigSchema.pre('save', function (next) {
  const doc = this as HydratedDocument<BusinessPeriodConfigDoc>;
  try {
    businessPeriodConfigZod.parse({
      businessDayConfigId: doc.businessDayConfigId.toString(),
      period: doc.period,
      coverCharge: doc.coverCharge,
      couponAllocations: (doc.couponAllocations ?? []).map(c => ({
        couponId: c.couponId.toString(),
        quantity: c.quantity,
      })),
      archived_at: doc.archived_at ?? null,
    });
    next();
  } catch (err: any) {
    next(err);
  }
});

export const BusinessPeriodConfigModel = model<BusinessPeriodConfigDoc>(
  'BusinessPeriodConfig',
  BusinessPeriodConfigSchema
);
