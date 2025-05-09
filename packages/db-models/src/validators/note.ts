import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const noteSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  noteUrl: z.string().min(4).max(255),
  noteTitle: z.string().min(4).max(255),
  noteDescription: z.string().min(4).max(255),
});

export type NoteType = z.infer<typeof noteSchema>;
