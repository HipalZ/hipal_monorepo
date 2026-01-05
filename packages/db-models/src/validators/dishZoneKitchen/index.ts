import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const dishZoneKitchenSchema = z.object({
  businessId: ObjectIdSchema,
  dishId: ObjectIdSchema,
  kitchenId: ObjectIdSchema,
  zoneId: ObjectIdSchema,
});

export type DishZoneKitchenType = z.infer<typeof dishZoneKitchenSchema>;
