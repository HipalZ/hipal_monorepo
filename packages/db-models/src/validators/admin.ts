import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
