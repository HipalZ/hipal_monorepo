import mongoose, { type Model, Schema, model } from "mongoose";
import type {
  ButtonType,
  HeaderType,
  ListRowType,
  ListSectionType,
  NodeType,
  TriggerType,
  WhatsappChatbotType,
} from "../../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const ButtonSchema = new Schema<ButtonType>({
  id: { type: String, required: false },
  type: { type: String, enum: ["reply", "url"], required: true },
  title: { type: String, required: true },
  url: { type: String },
});

const ListRowSchema = new Schema<ListRowType>({
  id: { type: String, required: false },
  title: { type: String, required: true },
  description: { type: String },
});

const ListSectionSchema = new Schema<ListSectionType>({
  id: { type: String, required: false },
  title: { type: String, required: true },
  rows: { type: [ListRowSchema], default: [] },
});

const HeaderSchema = new Schema<HeaderType>({
  type: { type: String, enum: ["none", "image"], default: "none" },
  mediaUrl: { type: String },
  useUpload: { type: Boolean, default: false },
});

/* 🧩 FINAL Google Sheet Meta Schema — Mongoose */
const GoogleSheetMetaSchema = new Schema(
  {
    spreadsheetId: { type: String },
    sheetName: { type: String },
    cells: {
      type: [
        {
          key: { type: String },
          value: { type: String },
        },
      ],
      default: [],
    },
    mode: {
      type: String,
      enum: ["append", "update"],
      default: "append",
    },
    columns: { type: [String], default: [] },
  },
  { _id: false },
);

const NodeSchema = new Schema<NodeType>({
  id: { type: String, required: false },
  type: {
    type: String,
    enum: [
      "send_message",
      "ask_question",
      "interactive",
      "set_condition",
      "trigger",
      "interactive_button_message",
      "interactive_list_message",
      "google_sheet",
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

  sheet: { type: GoogleSheetMetaSchema, default: null },
});

const TriggerSchema = new Schema<TriggerType>({
  keywords: { type: [String], default: [] },
  start: { type: String, default: null },
});

const WhatsappChatbotSchema = new Schema<WhatsappChatbotType>(
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
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    stats: {
      totalSessions: { type: Number, default: 0 },
      completedSessions: { type: Number, default: 0 },
      dropOffSessions: { type: Number, default: 0 },
      avgCompletionRate: { type: Number, default: 0 },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const WhatsappChatbotModel: Model<WhatsappChatbotType> =
  mongoose.models.whatsappChatbot ||
  model<WhatsappChatbotType>("whatsappChatbot", WhatsappChatbotSchema);

export interface ChatbotSessionType {
  _id?: string;
  chatbotId: mongoose.Types.ObjectId;
  userId: string;
  variables?: Record<string, any>;
  startTime?: number;
  endTime?: number;
  completed?: boolean;
  lastNodeId?: string;
  totalMessages?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatbotSessionSchema = new Schema<ChatbotSessionType>(
  {
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "whatsappChatbot",
      required: true,
    },
    userId: { type: String, required: true },
    variables: { type: Object, default: {} },
    startTime: { type: Number, default: Date.now() },
    endTime: { type: Number, default: Date.now() },
    completed: { type: Boolean, default: false },
    lastNodeId: { type: String },
    totalMessages: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ChatbotSessionModel: Model<ChatbotSessionType> =
  mongoose.models.chatbotSession ||
  model<ChatbotSessionType>("chatbotSession", ChatbotSessionSchema);
