import { z } from "zod";

export const TagTypeSchema = z.object({
  tagType: z
    .string({
      message: "tagType is required",
    })
    .min(3, {
      message: "tagType must be atleast 3 characters long",
    })
    .max(100, {
      message: "tagType must be atmost 100 characters long",
    }),
  description: z
    .string({
      message: "description is required",
    })
    .min(3, {
      message: "description must be atleast 3 characters long",
    })
    .max(100, {
      message: "description must be atmost 100 characters long",
    })
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
});

export type TagTypes = z.infer<typeof TagTypeSchema>;
