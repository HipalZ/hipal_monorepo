import mongoose, { Schema, model } from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const ButtonSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["reply", "url"], required: true },
  title: { type: String, required: true },
  url: { type: String },
});

const ListRowSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
});

const ListSectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  rows: { type: [ListRowSchema], default: [] },
});

const HeaderSchema = new Schema({
  type: { type: String, enum: ["none", "image"], default: "none" },
  mediaUrl: { type: String },
  useUpload: { type: Boolean, default: false },
});

const NodeSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "send_message",
      "ask_question",
      "interactive_message",
      "set_condition",
      "trigger",
    ],
    required: true,
  },
  next: { type: String, default: null },
  variable: { type: String, default: null },

  contentType: {
    type: String,
    enum: ["text", "image", "document"],
    default: "text",
  },
  text: { type: String },
  mediaUrl: { type: String },
  fileName: { type: String },
  caption: { type: String },
  selectedVars: { type: [String], default: [] },

  prompt: { type: String },
  inputType: {
    type: String,
    enum: ["text", "number", "phone", "email"],
    default: "text",
  },
  required: { type: Boolean, default: true },

  layout: {
    type: String,
    enum: ["button", "list", "cta_url", "none"],
    default: "button",
  },
  header: { type: HeaderSchema },
  bodyText: { type: String },
  footerText: { type: String },
  buttons: { type: [ButtonSchema], default: [] },
  list: {
    type: new Schema(
      { buttonText: String, sections: [ListSectionSchema] },
      { _id: false },
    ),
  },
  routes: { type: Schema.Types.Mixed, default: {} },

  logic: {
    type: [
      {
        var: String,
        op: {
          type: String,
          enum: ["exists", "eq", "ne", "gt", "lt", "contains"],
        },
        value: String,
      },
    ],
    default: [],
  },
  trueNext: { type: String },
  falseNext: { type: String },
});

const TriggerSchema = new Schema({
  keywords: { type: [String], default: [] },
  start: { type: String, default: null },
});

const WhatsappChatbotSchema = new Schema(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
      required: true,
    },
    chatbotName: { type: String, required: true },
    version: { type: Number, default: 2 },
    triggers: { type: [TriggerSchema], default: [] },
    variables: { type: [String], default: [] },
    nodes: { type: [NodeSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model("WhatsappChatbot", WhatsappChatbotSchema);
