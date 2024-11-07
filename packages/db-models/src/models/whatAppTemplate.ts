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

      index: true,
      unique: true,
    },

    date: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    bodyVariableSequence: {
      type: [String],
      required: true,
      default: [],
    },
    footerVariableSequence: {
      type: [String],
      required: true,
      default: [],
    },

    headerVariableSequence: {
      type: [String],
      required: true,
      default: [],
    },
    isDeleted: {
      type: Boolean,
      required: true,
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
