import { number, z } from 'zod';

export const RazorpayWebhookHeadersSchema = z.object({
  'x-razorpay-signature': z.string(),
  'x-razorpay-event-id': z.string(),
});

export const RazorpayWebhookBodySchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        notes: z.object({
          businessId: z.string(),
          tableName: z.string(),
          tableId: z.string(),
          zoneId: z.string(),
          staffId: z.string(),
          total: number().positive(),
          subTotal: number().positive(),
          cgst: number().positive(),
          dayAndDate: number().positive(),
          hiCode: z.string(),
          name: z.string(),
          phone: z.string(),
          discount: number().positive(),
          serviceCharge: number().positive(),
          tips: number().positive(),
          indianTime: z.string(),
          claimedAmount: number().positive(),
        }),
        created_at: number().positive(),
        id: z.string(),
        order_id: z.string(),
        acquirer_data: z.any(), // Define more specifically if possible
        method: z.string(),
      }),
    }),
  }),
});
