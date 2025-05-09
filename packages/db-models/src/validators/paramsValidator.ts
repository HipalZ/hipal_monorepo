import { z } from 'zod';



const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

export const paramsSchema = z
  .object({
    id: ObjectIdSchema.optional(),
    businessId: ObjectIdSchema.optional(),
    tableId: ObjectIdSchema.optional(),
    zoneId: ObjectIdSchema.optional(),
    orderId: ObjectIdSchema.optional(),
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
    download: z.string().optional(),
  })

