import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const licenseSchema = z.object({
  businessId: ObjectIdSchema,
  withPopcorn: z.boolean().default(false),
});

export type LicenseType = z.infer<typeof licenseSchema>;
