import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
