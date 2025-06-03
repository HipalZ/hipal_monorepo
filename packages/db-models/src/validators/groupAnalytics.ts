import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const groupAnalyticsSchema = z.object({
  groupId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  duration: z.number(),
  visitCount: z.number().optional(),
  visitType: z.enum(["ABOVE", "BELOW"]).optional(),
  spendAmount: z.number(),
  spendType: z.enum(["ABOVE", "BELOW"]).optional(),
  userCount: z.number().optional(),
  userPercentage: z.number().optional(),
  groupColor: z.string().optional(),
  groupName: z.string().optional(),
  date: z.number().optional(),
  isDefault: z.boolean().optional().default(false),
  morning: z.boolean().optional().default(false),
  afternoon: z.boolean().optional().default(false),
  evening: z.boolean().optional().default(false),
  night: z.boolean().optional().default(false),
});

export type groupAnalyticsType = z.infer<typeof groupAnalyticsSchema>;
