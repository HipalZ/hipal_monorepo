import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdValidation = (value: string) => mongoose.Schema.Types.ObjectId;

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const paramsSchema = z
  .object({
    id: objectIdSchema.optional(),
    businessId: objectIdSchema.optional(),
    tableId: objectIdSchema.optional(),
    zoneId: objectIdSchema.optional(),
    orderId: objectIdSchema.optional(),
    alertId: objectIdSchema.optional(),
  })
  .refine(
    (data) => {
      const keys = Object.keys(data) as (keyof typeof data)[];
      return keys.every((key) => !data[key] || objectIdValidation(data[key] as string));
    },
    {
      message: 'Invalid ID format',
      path: [], // Path is left empty to indicate the error can be for any of the fields
    },
  );
