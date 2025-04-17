import { Types } from "mongoose";
import { z } from "zod";
import { parseTimeToMinutes } from "./time-validators";

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

const coerceToHHMM = (val: string): string => {
  const [hours, minutes] = val.split(":").map((part) => part.trim());
  // Zero-pad hours and minutes to 2 digits
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

export const startTimeValidator = z
  .preprocess(
    (arg) => {
      if (typeof arg === "string") {
        // First, trim and normalize the string.
        return coerceToHHMM(arg);
      }
      return arg;
    },
    z.string().nonempty({ message: "Field is required" }),
  )
  .refine(
    (val) => {
      const minutes = parseTimeToMinutes(val);
      // Allowed range: from 04:00 (240) to 27:30 (1650) and in half-hour increments
      return minutes >= 240 && minutes <= 1650 && minutes % 30 === 0;
    },
    {
      message: 'Field must be in half-hour format between "04:00" and "27:30"',
    },
  )
  .transform((val) => coerceToHHMM(val)); // ensures the returned value is padded

export const endTimeValidator = z
  .preprocess(
    (arg) => {
      if (typeof arg === "string") {
        return coerceToHHMM(arg);
      }
      return arg;
    },
    z.string().nonempty({ message: "Field is required" }),
  )
  .refine(
    (val) => {
      const minutes = parseTimeToMinutes(val);
      // Allowed range for end time: from 04:30 (270) to 28:00 (1680)
      return minutes >= 270 && minutes <= 1680 && minutes % 30 === 0;
    },
    {
      message: 'Field must be in half-hour format between "04:30" and "28:00"',
    },
  )
  .transform((val) => coerceToHHMM(val));

const zDigitRange = (min: number, max: number) =>
  z
    .string()
    .regex(
      new RegExp(`^[${min}-${max}]$`),
      `must be a digit between ${min} and ${max}`,
    );

export const zDayRange = zDigitRange(0, 6);
export const zPeriodRange = zDigitRange(0, 3);
