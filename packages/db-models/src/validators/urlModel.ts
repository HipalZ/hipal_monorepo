import { z } from "zod";
import { ObjectIdSchema } from "./common";

const UrlModelSchema = z.object({
  longUrl: z.string(),
  shortUrl: z.string(),
  urlCode: z.string(),
  businessId: ObjectIdSchema.optional(),
  shortUrlType: z.string().optional().default("TABLE"),
  qrId: ObjectIdSchema.optional(),
});

export type UrlModelType = z.infer<typeof UrlModelSchema>;
