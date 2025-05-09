import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const termsAndConditionSchema = z.object({
  businessId: ObjectIdSchema,
  termsAndConditions: z.string().min(10).max(1000),
});

export type TermsAndConditionsValidator = z.infer<
  typeof termsAndConditionSchema
>;
