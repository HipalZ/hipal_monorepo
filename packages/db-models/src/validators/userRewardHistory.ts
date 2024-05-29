import { z } from "zod";

const UserRewardHistoryAttrs = z.object({
  userPhone: z.string(),
  day: z.string(),
  userName: z.string().optional(),
  businessName: z.string().optional(),
  waiterName: z.string().optional(),
  rewards: z.number().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  items: z.array(z.unknown()).default([]),
  total: z.number().default(0),
  subTotal: z.number().default(0),
  sgst: z.number().default(0),
  cgst: z.number().default(0),
  currentBalance: z.number().optional(),
  tableName: z.string().optional(),
  loyaltyId: z.string().optional(),
  reward_date: z.number().default(Date.now),
});

export type UserRewardHistoryType = z.infer<typeof UserRewardHistoryAttrs>;
