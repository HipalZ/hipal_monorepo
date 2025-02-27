import mongoose from 'mongoose';
import { z } from 'zod';
import { UniquelyYours } from '../models';

const objectIdValidation = (value: string) => mongoose.Schema.Types.ObjectId;

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const paramsSchema = z
  .object({
    id: objectIdSchema.optional(),
    businessId: objectIdSchema.optional(),
    tableId: objectIdSchema.optional(),
    zoneId: objectIdSchema.optional(),
    orderId: objectIdSchema.optional(),
    alertId: z.string().optional(),
    pageNumber: z.string().optional(),
    alertType: z.enum(['ONLINE', 'OFFLINE', 'WAITER', 'ALL']).optional(),
    appliedFilter: z.preprocess(
      (arg) => {
        if (typeof arg === 'string') {
          try {
            return JSON.parse(arg);
          } catch (err) {
            return undefined;
          }
        }
        return arg;
      },
      z
        .array(
          z.object({
            key: z.string(),
            value: z.array(z.string()),
          })
        )
        .optional()
    ),
    from: z.string().optional(),
    to: z.string().optional(),
    customLink: z.string().optional(),
    UniquelyYours: z.string().optional(),
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
