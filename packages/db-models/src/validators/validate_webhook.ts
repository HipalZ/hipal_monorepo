import { number, z } from "zod";

export const RazorpayWebhookHeadersSchema = z.object({
  "x-razorpay-signature": z.string(),
  "x-razorpay-event-id": z.string(),
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
          tips: z.string().optional(),
          claimedCoins: z.string().optional(),
          billValue: z.string().optional(),
          loyaltyId: z.string().optional(),
          couponId: z.string().optional(),
          channelId: z.string().optional(),
          cashbackAvailable: z.string().optional(),
        }),

        id: z.string().optional(),
        order_id: z.string(),
        acquirer_data: z.any(), // Define more specifically if possible
        method: z.string(),
        error_reason: z.any().optional(),
        error_description: z.any().optional(),
      }),
    }),
  }),
});

export const WhatAppRazorpayWebhookBodySchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        notes: z.object({
          businessId: z.string(),

          total: z.string(),

          billValue: z.string(),
        }),
        created_at: number().positive().optional(),
        id: z.string().optional(),
        order_id: z.string(),
        acquirer_data: z.any(), // Define more specifically if possible
        method: z.string(),
        error_reason: z.any().optional(),
        error_description: z.any().optional(),
      }),
    }),
  }),
});

export type RazorpayWebhookHeaders = z.infer<
  typeof RazorpayWebhookHeadersSchema
>;
export type RazorpayWebhookBody = z.infer<typeof RazorpayWebhookBodySchema>;
