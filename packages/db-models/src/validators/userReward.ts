import { z } from "zod";
import { ObjectIdSchema } from "./common";

const UserRewardDoc = z.object({
  _id: z.string().optional(),
  userId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  rewards: z.coerce.number(),
  password: z.coerce.number(),
  googleReviewCount: z.coerce.number().default(0).optional(),
  scanCount: z.coerce.number(),
  date: z.number().optional(),
});

export type UserRewardType = z.infer<typeof UserRewardDoc>;
