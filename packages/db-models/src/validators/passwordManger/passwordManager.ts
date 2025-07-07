import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const PasswordTypeEnum = [
  "DISCOUNT",
  "DELETE_KOT",
  "SERVICE_CHARGE",
] as const;

export type PasswordType = (typeof PasswordTypeEnum)[number];

export const passWordManager = z.object({
  name: z.enum(PasswordTypeEnum, {
    message: "type is required",
  }),
  businessId: ObjectIdSchema,
  password: z.string().min(4).max(15),
  isActive: z
    .boolean({
      message: "isActive is required",
    })
    .default(true),
});

export type PasswordManagerValidator = z.infer<typeof passWordManager>;
