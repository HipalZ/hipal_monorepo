import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const upiModeSchema = z.object({
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
  businessId: ObjectIdSchema,

  active: z.boolean().default(true).optional(),
});

export type UpiModeType = z.infer<typeof upiModeSchema>;
