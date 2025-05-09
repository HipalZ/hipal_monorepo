import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const TaxTypeSchema = z
  .object({
    name: z.string().min(2).max(50),
    businessId: ObjectIdSchema,
    value: z.coerce.number(),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    isActive: z.boolean().default(true).optional(),
    isDeleted: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Value cannot be greater than 100 when type is PERCENTAGE",
      path: ["value"], // Specify the path to the value field
    },
  );

export type TaxTypes = z.infer<typeof TaxTypeSchema>;
