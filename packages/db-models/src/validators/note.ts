import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const noteSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  noteUrl: z.string().min(4).max(255),
  noteTitle: z.string().min(4).max(255),
  noteDescription: z.string().min(4).max(255),
});

export type NoteType = z.infer<typeof noteSchema>;
