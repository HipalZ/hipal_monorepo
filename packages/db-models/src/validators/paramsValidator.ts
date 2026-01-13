import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const paramsSchema = z.object({
  id: objectIdSchema.optional(),
  businessId: objectIdSchema.optional(),
  tableId: objectIdSchema.optional(),
  zoneId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  alertId: z.string().optional(),
  pageNumber: z.string().optional(),
  alertType: z.enum(["ONLINE", "OFFLINE", "WAITER", "ALL"]).optional(),
  appliedFilter: z.preprocess(
    (arg) => {
      if (typeof arg === "string") {
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
        }),
      )
      .optional(),
  ),
  from: z.string().optional(),
  to: z.string().optional(),
  customLink: z.string().optional(),
  UniquelyYours: z.string().optional(),
  download: z.string().optional(),
});
