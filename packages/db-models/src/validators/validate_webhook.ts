import { number, z } from 'zod';

export const RazorpayWebhookHeadersSchema = z.object({
  'x-razorpay-signature': z.string(),
  'x-razorpay-event-id': z.string(),
});

// name: 'datta landage',
// phone: '9588413799',
// address: 'Paltribe solutions',
// businessId: '665ee8043cd15d770f104f99',
// total: '2950',
// claimedAmount: '600',
// tips: '50',
// dayAndDate: '17-06-2024',
// indianTime: '17:02'
// name: 'datta landage',
//     phone: '9588413799',
//     address: 'Paltribe solutions',
//     businessId: '665ee8043cd15d770f104f99',
//     total: '1',
//     claimedAmount: '0',
//     tips: '0',
//     dayAndDate: '17-06-2024',
//     indianTime: '17:17'
export const RazorpayWebhookBodySchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        notes: z.object({
          businessId: z.string(),
          tableName: z.string().optional(),
          address: z.string().optional(),
          tableId: z.string().optional(),
          zoneId: z.string().optional(),
          staffId: z.string().optional(),
          total: z.string(),
          subTotal: number().positive().optional(),
          cgst: number().positive().optional(),
          dayAndDate: z.string().optional(),
          hiCode: z.string().optional(),
          name: z.string(),
          phone: z.string(),
          discount: number().positive().optional(),
          serviceCharge: number().positive().optional(),
          tips: z.string().optional(),
          indianTime: z.string().optional(),
          claimedAmount: z.string().optional(),
        }),
        created_at: number().positive().optional(),
        id: z.string().optional(),
        order_id: z.string(),
        acquirer_data: z.any(), // Define more specifically if possible
        method: z.string(),
      }),
    }),
  }),
});
