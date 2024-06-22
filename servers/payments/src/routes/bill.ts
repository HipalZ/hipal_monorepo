import z from 'zod';

export const TempBillSchema = z.object({
  businessId: z.string(),
  tableName: z.string(),
  billValue: z.coerce.number(),
  total: z.coerce.number(),
  tips: z.coerce.number().default(0),
  claimedCoins: z.coerce.number().default(0),
});

export type TempBillType = z.infer<typeof TempBillSchema>;
