// businessId: ObjectIdSchema,
// date: z.number(),
// active: z.boolean().default(true),
// link: z.string().min(1).max(150),

import mongoose, { type Model } from "mongoose";
import type { CouponLinkType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const couponLinkSchema = new mongoose.Schema<CouponLinkType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      ref: "Business",
    },
    active: {
      type: Boolean,
      default: true,
    },

    date: {
      type: Number,
    },
    link: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const CouponLink: Model<CouponLinkType> = mongoose.model<CouponLinkType>(
  "couponLink",
  couponLinkSchema,
);

export { CouponLink };
