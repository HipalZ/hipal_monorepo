import mongoose, { type Model } from "mongoose";
import type { MergeTableType } from "../../validators";
const ObjectId = mongoose.Types.ObjectId;

const mergeTableSchema = new mongoose.Schema<MergeTableType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  parentTableId: {
    type: ObjectId,
    required: true,
    ref: "table",
  },
  childTableIds: {
    type: [ObjectId],
    required: true,
    ref: "table",
  },
});

const MergeTable: Model<MergeTableType> = mongoose.model<MergeTableType>(
  "mergeTable",
  mergeTableSchema,
);
export { MergeTable };
