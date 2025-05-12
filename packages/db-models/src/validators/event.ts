import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const eventSchema = z.object({
  businessId: ObjectIdSchema,
  title: z.string().min(3).max(50),
  heading: z.string().min(3).max(50).optional(),
  description: z.string().min(3).max(200).optional(),
  image: z.string().min(3).max(100).url().optional(),
  isActive: z.boolean().optional(),
});

export const updatedEventSchema = eventSchema.extend({
  eventId: ObjectIdSchema,
});

export type EventType = z.infer<typeof eventSchema>;
