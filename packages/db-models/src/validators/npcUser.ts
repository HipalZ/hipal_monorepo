import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const npcUserSchema = z.object({
  userId: ObjectIdSchema,
  totalNpcAmount: z.coerce.number().default(0),
  businessId: ObjectIdSchema,
});

export type NpcUserType = z.infer<typeof npcUserSchema>;
