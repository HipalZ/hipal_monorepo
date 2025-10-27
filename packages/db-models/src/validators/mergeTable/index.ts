import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const mergeTableSchema = z.object({
  businessId: ObjectIdSchema,
  parentTableId: ObjectIdSchema,
  childTableIds: z.array(ObjectIdSchema).min(1),
});

export type MergeTableType = z.infer<typeof mergeTableSchema>;
