import mongoose, { type Model } from "mongoose";

// Append-only-ish visit log: one document per (business, user, IST day).
// Every entry point (WhatsApp QR scan, app open, sign-in, backfill)
// upserts here; repeat events on the same day are absorbed by the
// unique index, so countDocuments == visit-days. This collection is
// the single source of truth for visit analytics.
export type VisitSource =
  | "TABLE_QR"
  | "CHECK_IN_QR"
  | "ROOM_QR"
  | "COUPON_QR"
  | "APP_OPEN"
  | "SIGN_IN"
  | "WHATSAPP"
  | "PAYMENT"
  | "POS"
  | "BACKFILL";

export interface VisitEventType {
  businessId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  day: string; // IST calendar day, "YYYY-MM-DD"
  date: number; // ms timestamp of the first event that day
  source: VisitSource; // first source seen that day
  tableName?: string;
}

const ObjectId = mongoose.Schema.Types.ObjectId;

const visitEventSchema = new mongoose.Schema<VisitEventType>(
  {
    businessId: { type: ObjectId, required: true, ref: "Business" },
    userId: { type: ObjectId, required: true, ref: "User" },
    day: { type: String, required: true },
    date: { type: Number, required: true },
    source: { type: String, required: true },
    tableName: { type: String, required: false },
  },
  { timestamps: true },
);

visitEventSchema.index({ businessId: 1, userId: 1, day: 1 }, { unique: true });
visitEventSchema.index({ businessId: 1, day: 1 });
visitEventSchema.index({ businessId: 1, date: 1 });

const VisitEvent: Model<VisitEventType> = mongoose.model<VisitEventType>(
  "visitevent",
  visitEventSchema,
);

export { VisitEvent };
