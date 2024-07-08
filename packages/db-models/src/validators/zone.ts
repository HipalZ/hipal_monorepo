import { z } from 'zod';

export const ZoneSchema = z.object({
  businessId: z.string(),
  zoneName: z.string(),
  zoneType: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  staff: z.array(z.string()).optional(),
  tables: z.array(z.string()).optional(),
  Occupied: z.coerce.number().optional(),
  charges: z.array(z.record(z.any())).optional(),
});

export type Zone = z.infer<typeof ZoneSchema>;
