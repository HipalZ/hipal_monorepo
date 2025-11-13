import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { TableSessionCounterType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const tableSessionCounterSchema = new mongoose.Schema<TableSessionCounterType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
    index: true,
  },
  tableSessionId: {
    type: String,
    required: true,
  },
});

const TableSessionCounter: Model<TableSessionCounterType> =
  mongoose.model<TableSessionCounterType>(
    "tableSessionCounter",
    tableSessionCounterSchema,
  );
export { TableSessionCounter };
