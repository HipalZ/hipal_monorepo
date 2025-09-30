import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;
const syncPosMenuConfigSchema = new mongoose.Schema({
  businessId: {
    type: ObjectId,
    required: true,
  },
  resId: {
    type: String,
    required: true,
  },
  tableName: {
    type: String,
    required: true,
  },
});

const PosSyncMenuConfig = mongoose.model(
  "posSyncMenuConfig",
  syncPosMenuConfigSchema,
);
export { PosSyncMenuConfig };
