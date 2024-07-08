import { z } from 'zod';

const UserBillAttrs = z.object({
  businessId: z.string(),
  zoneId: z.string(),
  bill: z.array(z.unknown()),
  tableId: z.string(),
  time: z.string(),
  date: z.string(),
});

export type UserBillType = z.infer<typeof UserBillAttrs>;
