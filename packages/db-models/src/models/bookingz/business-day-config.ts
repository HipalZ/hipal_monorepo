import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';
import { halfHourTimeRegex, requiredObjectIdString } from './utils';


// Zod for closed intervals with half‑hour validation
const closedIntervalZodSchema = z.object({
  startTime: z
    .string()
    .nonempty({ message: 'Start time is required' })
    .regex(halfHourTimeRegex, { message: 'Start time must be in half-hour format (e.g. "09:00", "19:30")' }),
  endTime: z
    .string()
    .nonempty({ message: 'End time is required' })
    .regex(halfHourTimeRegex, { message: 'End time must be in half-hour format (e.g. "09:00", "19:30")' }),
});

// Zod schema for BusinessDayConfig with half‑hour validation on time fields
export const businessDayConfigZodSchema = z.object({
  businessId: requiredObjectIdString('Business ID'),
  dayOfWeek: z.number({ required_error: 'Day of week is required' }),
  startTime: z
    .string()
    .nonempty({ message: 'Start time is required' })
    .regex(halfHourTimeRegex, { message: 'Start time must be in half-hour format (e.g. "09:00", "19:30")' }),
  endTime: z
    .string()
    .nonempty({ message: 'End time is required' })
    .regex(halfHourTimeRegex, { message: 'End time must be in half-hour format (e.g. "09:00", "19:30")' }),
  isOpen: z.boolean().default(true),
  closedIntervals: z.array(closedIntervalZodSchema).default([]),
  archived_at: z.date().nullable().default(null),
}).strict();

export const upsertDayConfigBodySchema = businessDayConfigZodSchema.omit({
  businessId: true,
  archived_at: true,
});

// TypeScript interface for a BusinessDayConfig document
export interface IBusinessDayConfig extends Document {
  businessId: Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isOpen: boolean;
  closedIntervals: { startTime: string; endTime: string }[];
  archived_at: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose sub‑schema for closed intervals
const closedIntervalSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

// Mongoose schema for BusinessDayConfig
const businessDayConfigSchema = new Schema<IBusinessDayConfig>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    closedIntervals: { type: [closedIntervalSchema], default: [] },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// Pre-save hook: merge overlapping closed intervals
businessDayConfigSchema.pre('save', function (next) {
  if (this.closedIntervals && this.closedIntervals.length > 0) {
    const parseToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Sort intervals by start time
    this.closedIntervals.sort(
      (a, b) => parseToMinutes(a.startTime) - parseToMinutes(b.startTime)
    );
    // Merge intervals
    this.closedIntervals = this.closedIntervals.reduce((acc: any[], curr: any) => {
      if (acc.length === 0) return [curr];
      const last = acc[acc.length - 1];
      if (parseToMinutes(curr.startTime) <= parseToMinutes(last.endTime)) {
        if (parseToMinutes(curr.endTime) > parseToMinutes(last.endTime)) {
          last.endTime = curr.endTime;
        }
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  }
  next();
});

export const BusinessDayConfigModel = model<IBusinessDayConfig>(
  'BusinessDayConfig',
  businessDayConfigSchema
);
