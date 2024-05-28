import { z } from 'zod';

export const SwiggySchema = z.object({
  businessId: z.string(),
  zoneName: z.string(),
  zoneType: z.string(),
  password: z.string(),
  addCharges: z.array(z.record(z.any())).optional(),
  commisions: z.array(z.record(z.any())).optional(),
  tables: z.array(z.any()),
  Occupied: z.number(),
});

export type Swiggy = z.infer<typeof SwiggySchema>;