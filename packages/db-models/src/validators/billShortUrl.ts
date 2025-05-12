import { z } from "zod";

const BillUrlModelSchema = z.object({
  longUrl: z.string(),
  shortUrl: z.string(),
  urlCode: z.string(),
  createdAt: z.date(),
});

export type BillUrlModelType = z.infer<typeof BillUrlModelSchema>;
