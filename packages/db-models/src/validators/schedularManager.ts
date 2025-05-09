import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const schedularManagerSchema = z.object({
  businessId: ObjectIdSchema,
  schedularJobs: z.object({}),
});

export type SchedularManagerType = z.infer<typeof schedularManagerSchema>;
