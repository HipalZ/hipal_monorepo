import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const adminSchema = z.object({
  _id: ObjectIdSchema.optional(),
  phone: z
    .string({
      message: "Phone number must be a string",
    })
    .min(10, {
      message: "Phone number must be at least 10 characters  long",
    })
    .max(10, {
      message: "Phone number must be at most 10 characters long",
    }),
  password: z
    .string({
      message: "Password must be a string",
    })
    .min(6, {
      message: "Password must be at least 6 characters long",
    })
    .max(25, {
      message: "Password must be at most 25 characters long",
    }),

  role: z
    .enum(["HIPAL_ADMIN"], {
      message: "Role must be ADMIN",
    })
    .optional(),
});

export type AdminType = z.infer<typeof adminSchema>;
