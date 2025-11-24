import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const MenuTempChangesSchema = z.object({
  businessId: ObjectIdSchema,
  baseMenuId: ObjectIdSchema,
  changedCategoryIds: z.array(ObjectIdSchema).default([]),
  changedAddOnIds: z.array(ObjectIdSchema).default([]),
  changedTaxIds: z.array(ObjectIdSchema).default([]),
  changedKitchenIds: z.array(ObjectIdSchema).default([]),
  changedDishIds: z.array(ObjectIdSchema).default([]),
  isBaseMenuChanged: z.boolean().default(false),
});

export type MenuTempChangesTypeValidator = z.infer<
  typeof MenuTempChangesSchema
>;
