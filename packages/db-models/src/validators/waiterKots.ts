import { z } from 'zod';

const WaiterKotAttrs = z.object({
  businessId: z.string(),
  tableName: z.string(),
  tableId: z.string(),
  zoneId: z.string(),
  date: z.string(),
  time: z.string(),
  items: z.array(z.unknown()),
  isAccept: z.boolean(),
  isReject: z.boolean(),
  isEdit: z.boolean(),
  staffId: z.string(),
  cart: z.record(z.unknown()),
  rejectedBy: z.string(),
  acceptedBy: z.string(),
  editedBy: z.string(),
});

export type WaiterKotType = z.infer<typeof WaiterKotAttrs>;
