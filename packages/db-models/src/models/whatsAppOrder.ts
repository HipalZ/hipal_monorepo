import mongoose, { type Model } from "mongoose";
import type { WhatAppOrderType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const whatsAppOrderSchema = new mongoose.Schema<WhatAppOrderType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      index: true,
    },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    billValue: { type: Number, required: true },
    receipt: { type: String, required: true, unique: true },
    userId: { type: ObjectId, required: true, ref: "User" },
    discount: { type: Number, default: 0 },
    order_id: { type: String, required: true, unique: true },
    date: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const WhatAppOrder: Model<WhatAppOrderType> = mongoose.model<WhatAppOrderType>(
  "whatsAppOrder",
  whatsAppOrderSchema,
);

export { WhatAppOrder };
