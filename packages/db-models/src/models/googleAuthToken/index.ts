import mongoose, { Schema, type Model, model } from "mongoose";

export interface GoogleAuthTokenType {
  businessId: string;
  sessionKey: string;
  googleEmail: string;

  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const GoogleAuthTokenSchema = new Schema<GoogleAuthTokenType>(
  {
    businessId: { type: String, required: true },
    sessionKey: { type: String, required: true },
    googleEmail: { type: String, required: false },

    access_token: { type: String },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String },
    expiry_date: { type: Number },
  },
  { timestamps: true },
);

// UNIQUE: One business + one builder session + one Google account
GoogleAuthTokenSchema.index({ businessId: 1, sessionKey: 1 }, { unique: true });

export const GoogleAuthTokens: Model<GoogleAuthTokenType> =
  mongoose.models.GoogleAuthTokens ||
  model<GoogleAuthTokenType>("GoogleAuthTokens", GoogleAuthTokenSchema);
