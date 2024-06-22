import { z } from 'zod';

const UserRewardHistoryAttrs = z.object({
  userPhone: z.string(),
  day: z.string().optional(),
  userName: z.string().optional(),
  businessName: z.string().optional(),
  waiterName: z.string().optional(),
  rewards: z.coerce.number().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  items: z.array(z.unknown()).default([]).optional(),
  total: z.coerce.number().default(0),
  subTotal: z.coerce.number().default(0).optional(),
  sgst: z.coerce.number().default(0).optional(),
  cgst: z.coerce.number().default(0).optional(),
  currentBalance: z.coerce.number().optional(),
  tableName: z.string().optional(),
  loyaltyId: z.string(),
  reward_date: z.coerce.number().default(Date.now()),
});

export type UserRewardHistoryType = z.infer<typeof UserRewardHistoryAttrs>;
