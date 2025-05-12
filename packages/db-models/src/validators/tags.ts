import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const TagSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(3, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),
  description: z.string().optional(),
  createdBy: ObjectIdSchema,
  businessId: ObjectIdSchema,
  displayForCaptains: z.boolean().default(true).optional(),
  repeat: z.number().optional(),
  remainderInDuration: z.string().optional(),
  note: z.string().min(2).max(100).optional(),

  isDeleted: z.boolean().default(false).optional(),
  duration: z.number().optional(),
  time: z.number().optional(),
});

export type TagType = z.infer<typeof TagSchema>;
