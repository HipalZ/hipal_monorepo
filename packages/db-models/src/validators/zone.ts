import { z } from 'zod';

export const ZoneSchema = z.object({
  businessId: z.string(),
  zoneName: z.string(),
  zoneType: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  staff: z.array(z.string()),
  tables: z.array(z.string()),
  Occupied: z.number(),
  charges: z.array(z.record(z.any())),
});

export type Zone = z.infer<typeof ZoneSchema>;
