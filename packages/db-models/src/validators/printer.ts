import { z } from 'zod';

const PrinterAttrs = z.object({
  businessId: z.string(),
  printers: z.record(z.unknown()),
  billPrinter: z.string(),
});

export type PrinterType = z.infer<typeof PrinterAttrs>;
