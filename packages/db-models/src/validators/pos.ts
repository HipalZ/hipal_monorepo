import { z } from "zod";

export const posSchema = z.object({
  name: z
    .string({
      message: "name is required",
    })
    .min(1, {
      message: "name must be atleast 3 characters long",
    })
    .max(100, {
      message: "name must be atmost 100 characters long",
    }),

  isDeleted: z.boolean().default(false).optional(),
});

export type PosType = z.infer<typeof posSchema>;
