import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
