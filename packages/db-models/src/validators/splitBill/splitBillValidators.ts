import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const splitBillPortionAndPercentageSchema = z
  .object({
    businessId: ObjectIdSchema,
    tableName: z.string().min(1).max(50),
    variantCount: z.number().int().min(2).max(50).positive(),
    variants: z
      .array(
        z.object({
          percentage: z.number().min(1).max(100).positive(),
        }),
      )
      .min(2)
      .max(50),
  })
  .superRefine((data, ctx) => {
    if (data.variants.length !== data.variantCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "variantCount must match the length of variants array",
        path: ["variantCount"],
      });
    }

    const totalPercentage = data.variants.reduce(
      (sum, variant) => sum + variant.percentage,
      0,
    );

    if (totalPercentage !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sum of all percentages must equal 100",
        path: ["variants"],
      });
    }
  });

export type SplitBillPortionAndPercentageValidator = z.infer<
  typeof splitBillPortionAndPercentageSchema
>;
