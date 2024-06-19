import { z } from 'zod';

const TempModel = z.object({
  hiCode: z.string(),
  tableId: z.string(),
  discountAmount: z.coerce.number(),
  claimedAmount: z.coerce.number(),
  tipsAmount: z.coerce.number(),
  serviceChargeApply: z.boolean(),
  mode: z.string(),
  duesPersonId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  discountDescription: z.string(),
  discountPercentage: z.coerce.number(),
  discountMode: z.string(),
  serviceChargeRemovedBy: z.string(),
  serviceChargeAddedBy: z.string(),
  coinsGivenBy: z.string(),
  discountGivenBy: z.string(),
  discountRemovedBy: z.string(),
  tipsGivenBy: z.string(),
});

export type TempModelType = z.infer<typeof TempModel>;
