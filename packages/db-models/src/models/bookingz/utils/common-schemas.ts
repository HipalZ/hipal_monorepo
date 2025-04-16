import { Types } from "mongoose";
import { z } from "zod";

export const mongoIdZod = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ID format" });
export const zodIdSchema = z.object({
  _id: mongoIdZod,
});

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string") {
    // Check if the string is in YYYY-MM-DD format (HTML date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      // Append a time portion to create a valid ISO string
      return new Date(arg + "T00:00:00");
    }
    // Otherwise, assume it's an ISO string
    return new Date(arg);
  }
  if (typeof arg === "number" || arg instanceof Date) {
    return new Date(arg);
  }
  return arg;
}, z.date());

export const objectIdString = (fieldName: string) =>
  z.preprocess(
    (val) => (val === undefined ? null : val),
    z
      .string()
      .nullable()
      .refine((val) => val === null || Types.ObjectId.isValid(val), {
        message: `Invalid ${fieldName}`,
      }),
  );

export const requiredObjectIdString = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `Invalid ${fieldName}`,
    });

export const halfHourTimeRegex = /^(0\d|1\d|2[0-3]):(00|30)$/;

export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const startTimeValidator = z
  .string()
  .nonempty({ message: "Field is required" })
  .refine(
    (val) => {
      const match = /^(\d{1,2}):([0-5]\d)$/.exec(val);
      if (!match) return false;
      const minutes = parseTimeToMinutes(val);
      return minutes >= 240 && minutes <= 1650 && minutes % 30 === 0;
    },
    {
      message: 'Field in half-hour format between "04:00" and "27:30"',
    },
  );

export const endTimeValidator = z
  .string()
  .nonempty({ message: "Field is required" })
  .refine(
    (val) => {
      const match = /^(\d{1,2}):([0-5]\d)$/.exec(val);
      if (!match) return false;
      const minutes = parseTimeToMinutes(val);
      return minutes >= 270 && minutes <= 1680 && minutes % 30 === 0;
    },
    {
      message: 'Field must be in half-hour format between "04:30" and "28:00"',
    },
  );
