import { z } from 'zod';

export const TableSchema = z.object({
  businessId: z.string(),
  zoneId: z.string(),
  name: z.string(),
  capacity: z.number(),
  staff: z.array(z.string()),
  status: z.enum(['Occupied', 'Settled', 'Clean', 'Empty', 'Reserved', 'Need assistance', 'Active']),
  activeUser: z.number(),
  time: z.string(),
  totalDishQuantity: z.number(),
  deliverdDish: z.number(),
  role: z.record(z.any()),
  hiCode: z.string(),
  isMerge: z.boolean(),
  hierarchy: z.string(),
  parentTableId: z.string(),
  parentZoneId: z.string(),
  mergeTables: z.array(z.record(z.any())),
  mergedBy: z.string().optional(),
  reservedBy: z.string().optional(),
});

export type TableTypes = z.infer<typeof TableSchema>;
