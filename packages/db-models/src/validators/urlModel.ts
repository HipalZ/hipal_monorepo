import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


const UrlModelSchema = z.object({
  longUrl: z.string(),
  shortUrl: z.string(),
  urlCode: z.string(),
  businessId: ObjectIdSchema.optional(),
  shortUrlType: z.string().optional().default("TABLE"),
});

export type UrlModelType = z.infer<typeof UrlModelSchema>;
