import mongoose from "mongoose";

const billQueueSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: false,
    },

    date: {
      type: Number,
      required: false,
    },
    jobId: {
      type: String,
      required: false,
    },
    tableName: {
      type: String,
      required: false,
    },
    log: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const BillQueue = mongoose.model("billqueue", billQueueSchema);

export { BillQueue };
