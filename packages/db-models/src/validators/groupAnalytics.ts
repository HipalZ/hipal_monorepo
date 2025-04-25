import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
});

export type groupAnalyticsType = z.infer<typeof groupAnalyticsSchema>;
