import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { TermsAndConditionsValidator } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const termAndConditionSchema = new mongoose.Schema<TermsAndConditionsValidator>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    termsAndConditions: {
      type: String,
      required: true,
    },
  },
);

const TermAndCondition: Model<TermsAndConditionsValidator> =
  mongoose.model<TermsAndConditionsValidator>(
    "analytic",
    termAndConditionSchema,
  );
export { TermAndCondition };
