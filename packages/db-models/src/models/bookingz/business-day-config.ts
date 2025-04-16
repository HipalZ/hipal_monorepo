import type { Document, Types } from "mongoose";
import { Schema, model } from "mongoose";
import { z } from "zod";
import {
  endTimeValidator,
  normalizeTime,
  parseTimeToMinutes,
  requiredObjectIdString,
  startTimeValidator,
} from "./utils";

// Zod for closed intervals with half‑hour validation
const closedIntervalZodSchema = z.object({
  startTime: startTimeValidator,
  endTime: endTimeValidator,
});

// Zod schema for BusinessDayConfig with half‑hour validation on time fields
export const businessDayConfigZodSchema = z
  .object({
    businessId: requiredObjectIdString("Business ID"),
    dayOfWeek: z.number({ required_error: "Day of week is required" }),
    startTime: startTimeValidator,
    endTime: endTimeValidator,
    isOpen: z.boolean().default(true),
    closedIntervals: z.array(closedIntervalZodSchema).default([]),
    archived_at: z.date().nullable().default(null),
  })
  .strict();

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
  { _id: false },
);

// Mongoose schema for BusinessDayConfig
const businessDayConfigSchema = new Schema<IBusinessDayConfig>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    closedIntervals: { type: [closedIntervalSchema], default: [] },
    archived_at: { type: Date, default: null },
  },
  { timestamps: true },
);

// Pre-save hook: merge overlapping closed intervals
businessDayConfigSchema.pre("save", function (next) {
  // Normalize day's startTime and endTime.
  if (this.startTime) {
    this.startTime = normalizeTime(this.startTime);
  }
  if (this.endTime) {
    this.endTime = normalizeTime(this.endTime);
  }

  const dayStart = parseTimeToMinutes(this.startTime);
  const dayEnd = parseTimeToMinutes(this.endTime);

  // Check 1: Day's startTime must be less than endTime.
  if (dayStart >= dayEnd) {
    return next(new Error("The day’s startTime must be less than its endTime"));
  }

  // Validate and normalize each closed interval.
  if (this.closedIntervals && this.closedIntervals.length > 0) {
    for (const ci of this.closedIntervals) {
      // Normalize times.
      ci.startTime = normalizeTime(ci.startTime);
      ci.endTime = normalizeTime(ci.endTime);

      const ciStart = parseTimeToMinutes(ci.startTime);
      const ciEnd = parseTimeToMinutes(ci.endTime);

      // Check 2: Closed interval startTime must be within day's boundaries.
      if (ciStart < dayStart || ciStart > dayEnd) {
        return next(
          new Error(
            "Each closed interval’s startTime must be within the day’s startTime and endTime",
          ),
        );
      }
      // Check 3: Closed interval endTime must be within day's boundaries.
      if (ciEnd < dayStart || ciEnd > dayEnd) {
        return next(
          new Error(
            "Each closed interval’s endTime must be within the day’s startTime and endTime",
          ),
        );
      }
      // Check 4: Within each closed interval, startTime must be less than endTime.
      if (ciStart >= ciEnd) {
        return next(
          new Error(
            "Each closed interval must have a startTime that is less than its endTime",
          ),
        );
      }
    }

    // Sort and merge overlapping closed intervals.
    const parseMinutes = (time: string): number => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    this.closedIntervals.sort(
      (a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime),
    );
    this.closedIntervals = this.closedIntervals.reduce(
      (acc: any[], curr: any) => {
        if (acc.length === 0) return [curr];
        const last = acc[acc.length - 1];
        if (parseMinutes(curr.startTime) <= parseMinutes(last.endTime)) {
          if (parseMinutes(curr.endTime) > parseMinutes(last.endTime)) {
            last.endTime = curr.endTime;
          }
        } else {
          acc.push(curr);
        }
        return acc;
      },
      [],
    );
  }
  next();
});

export const BusinessDayConfigModel = model<IBusinessDayConfig>(
  "BusinessDayConfig",
  businessDayConfigSchema,
);
