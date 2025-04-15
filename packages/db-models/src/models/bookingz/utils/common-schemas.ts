import { Types } from 'mongoose';
import { z } from 'zod';


export const mongoIdZod = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ID format' });
export const zodIdSchema = z.object({
  _id: mongoIdZod,
});

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'string') {
    // Check if the string is in YYYY-MM-DD format (HTML date input)
    if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
      // Append a time portion to create a valid ISO string
      return new Date(arg + 'T00:00:00');
    }
    // Otherwise, assume it's an ISO string
    return new Date(arg);
  }
  if (typeof arg === 'number' || arg instanceof Date) {
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
      })
  );

export const requiredObjectIdString = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `Invalid ${fieldName}`,
    });

export const halfHourTimeRegex = /^(0\d|1\d|2[0-3]):(00|30)$/;
