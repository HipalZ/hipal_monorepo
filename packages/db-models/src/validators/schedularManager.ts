import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const schedularManagerSchema = z.object({
  businessId: ObjectIdSchema,
  schedularJobs: z.object({}),
});

export type SchedularManagerType = z.infer<typeof schedularManagerSchema>;
