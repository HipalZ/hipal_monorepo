import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdValidation = (value: string) => mongoose.Types.ObjectId.isValid(value);

export const paramsSchema = z
  .object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    businessId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    tableId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
    zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  })
  .refine(
    (value: { id: string; businessId: string; tableId: string; zoneId: string }) =>
      (Object.keys(value) as (keyof typeof value)[]).every((key) => objectIdValidation(value[key])),
    {
      message: 'Invalid ID format',
      path: [], // Path is left empty to indicate the error can be for any of the fields
    },
  );
