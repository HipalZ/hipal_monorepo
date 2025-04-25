import z from 'zod';
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const WaiterPaymentAlertSchema = z.object({
  businessId: ObjectIdSchema,

  tableName: z.string().optional(),
  message: z.string().optional(),

  alertType: z.enum(['ONLINE', 'OFFLINE', 'CALLING']),

  order_id: ObjectIdSchema,
  payment_id: ObjectIdSchema.optional(),
  isAccepted: z.boolean().default(false),

  date: z.number().default(Date.now()),
});

export type WaiterPaymentAlertType = z.infer<typeof WaiterPaymentAlertSchema>;
