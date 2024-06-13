import { z } from 'zod';

export const TableSchema = z.object({
  businessId: z.string(),
  zoneId: z.string(),
  name: z.string(),
  capacity: z.number(),
  staff: z.array(z.string()).optional(),
  status: z.enum(['Occupied', 'Settled', 'Clean', 'Empty', 'Reserved', 'Need assistance', 'Active']),
  activeUser: z.number().optional(),
  time: z.string().optional(),
  totalDishQuantity: z.number().optional(),
  deliverdDish: z.number().optional(),
  role: z.record(z.any()).optional(),
  hiCode: z.string().optional(),
  isMerge: z.boolean().optional(),
  hierarchy: z.string().optional(),
  parentTableId: z.string().optional(),
  parentZoneId: z.string().optional(),
  mergeTables: z.array(z.record(z.any())).optional(),
  mergedBy: z.string().optional().optional(),
  reservedBy: z.string().optional().optional(),
});

export type TableTypes = z.infer<typeof TableSchema>;
