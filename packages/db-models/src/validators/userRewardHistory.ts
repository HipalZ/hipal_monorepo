import mongoose from 'mongoose';
import { z } from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
const UserRewardHistoryAttrs = z.object({
  userId: ObjectIdSchema,
  rewards: z.coerce.number(),
  status: z.enum(['MINUS', 'PLUS']),
  date: z.coerce.number(),
  tableName: z.string(),
  loyaltyId: ObjectIdSchema,
  order_id: ObjectIdSchema.optional(),

});

export type UserRewardHistoryType = z.infer<typeof UserRewardHistoryAttrs>;
