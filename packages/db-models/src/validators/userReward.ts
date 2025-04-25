import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
