import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const ChatbotAnalyticsFilterSchema = z.object({
  chatbotId: ObjectIdSchema,
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z.enum(["all", "completed", "dropped"]).default("all"),
});

export const ChatbotSessionResponseSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  userName: z.string().optional(),
  phone: z.string().optional(),
  completed: z.boolean(),
  startTime: z.string(),
  endTime: z.string().optional(),
  sessionDurationMs: z.number().optional(),
  droppedAtNode: z.string().optional(),
});

export type ChatbotAnalyticsFilterType = z.infer<typeof ChatbotAnalyticsFilterSchema>;
export type ChatbotSessionResponseType = z.infer<typeof ChatbotSessionResponseSchema>;
