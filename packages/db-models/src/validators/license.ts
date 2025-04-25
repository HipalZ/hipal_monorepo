import { z } from 'zod';
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const licenseSchema = z.object({
  businessId: ObjectIdSchema,
  withPopcorn: z.boolean().default(false),
});

export type LicenseType = z.infer<typeof licenseSchema>;
