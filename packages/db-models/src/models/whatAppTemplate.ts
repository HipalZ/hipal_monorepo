import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { WhatAppTemplateType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const whatAppTemplateSchema = new mongoose.Schema<WhatAppTemplateType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },

    templateId: {
      type: Number,
      required: true,
      max: 30,
      index: true,
      unique: true,
    },

    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    variableSequence: {
      type: [String],
      required: true,
    },

    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const WhatAppTemplate: Model<WhatAppTemplateType> =
  mongoose.model<WhatAppTemplateType>("whatAppTemplate", whatAppTemplateSchema);

export { WhatAppTemplate };
