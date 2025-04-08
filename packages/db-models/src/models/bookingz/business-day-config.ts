import { Schema, model, Types, HydratedDocument } from 'mongoose';
import { z } from 'zod';
import {
  requiredObjectIdString,
  dateSchema,
} from './utils/common-schemas';
import { parseTimeToMinutes, timeInRangeValidator } from './utils';

const businessDayConfigZod = z.object({
  businessId: requiredObjectIdString('businessId'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: timeInRangeValidator('startTime', 240, 1650), // 04:00 - 27:30
  endTime: timeInRangeValidator('endTime', 270, 1680), // 04:30 - 28:00
  archived_at: z.union([dateSchema, z.null()]).optional(),
});

type BusinessDayConfigType = z.infer<typeof businessDayConfigZod>;

interface BusinessDayConfigDoc extends Omit<BusinessDayConfigType, 'businessId'> {
  businessId: Types.ObjectId;
  archived_at?: Date | null;
}

const BusinessDayConfigSchema = new Schema<BusinessDayConfigDoc>(
  {
    businessId: { type: Schema.Types.ObjectId, required: true, ref: 'Business' },
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

BusinessDayConfigSchema.pre('save', function (next) {
  const doc = this as HydratedDocument<BusinessDayConfigDoc>;

  try {
    businessDayConfigZod.parse({
      businessId: doc.businessId.toString(),
      dayOfWeek: doc.dayOfWeek,
      startTime: doc.startTime,
      endTime: doc.endTime,
      archived_at: doc.archived_at ?? null,
    });

    const start = parseTimeToMinutes(doc.startTime);
    const end = parseTimeToMinutes(doc.endTime);
    if (start >= end) return next(new Error('startTime must be less than endTime'));

    next();
  } catch (err: any) {
    next(err);
  }
});

export const BusinessDayConfigModel = model<BusinessDayConfigDoc>(
  'BusinessDayConfig',
  BusinessDayConfigSchema
);
