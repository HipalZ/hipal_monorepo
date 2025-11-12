import mongoose, { Schema, type Model, model } from "mongoose";
import type { Types } from "mongoose";

/* -------------------------
 * ChatbotNodeLogModel
 * ------------------------- */
export interface ChatbotNodeLogType {
  sessionId: Types.ObjectId;
  chatbotId: Types.ObjectId;
  nodeId: string;
  nodeType: string;
  enteredAt: Date;
  exitedAt?: Date;
  durationMs?: number;
  userResponse?: string;
  nextNodeId?: string;
  wasEnd?: boolean;
}

const ChatbotNodeLogSchema = new Schema<ChatbotNodeLogType>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "chatbotSession",
      required: false,
    },
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "whatsappChatbot",
      required: true,
    },
    nodeId: { type: String, required: true },
    nodeType: { type: String, required: true },
    enteredAt: { type: Date, default: Date.now },
    exitedAt: { type: Date },
    durationMs: { type: Number },
    userResponse: { type: String },
    nextNodeId: { type: String },
    wasEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const ChatbotNodeLogModel: Model<ChatbotNodeLogType> =
  mongoose.models.chatbotNodeLog ||
  model<ChatbotNodeLogType>("chatbotNodeLog", ChatbotNodeLogSchema);

/* -------------------------
 * Extend ChatbotSessionModel
 * ------------------------- */
export interface ChatbotSessionType {
  chatbotId: Types.ObjectId;
  userId: string;
  userName?: string;
  phone?: string;
  variables?: Record<string, any>;
  startTime?: Date;
  endTime?: Date;
  completed?: boolean;
  lastNodeId?: string;
  droppedAtNode?: string;
  totalMessages?: number;
  sessionDurationMs?: number;
  nodeLogs?: Types.ObjectId[];
}

const ChatbotSessionSchema = new Schema<ChatbotSessionType>(
  {
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "whatsappChatbot",
      required: true,
    },
    userId: { type: String, required: true },
    userName: { type: String },
    phone: { type: String },
    variables: { type: Object, default: {} },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    completed: { type: Boolean, default: false },
    lastNodeId: { type: String },
    droppedAtNode: { type: String },
    totalMessages: { type: Number, default: 0 },
    sessionDurationMs: { type: Number },
    nodeLogs: [{ type: Schema.Types.ObjectId, ref: "chatbotNodeLog" }],
  },
  { timestamps: true },
);

export const ChatbotSessionModel: Model<ChatbotSessionType> =
  mongoose.models.chatbotSession ||
  model<ChatbotSessionType>("chatbotSession", ChatbotSessionSchema);

/* -------------------------
 * ChatbotAnalyticsModel
 * ------------------------- */
export interface ChatbotAnalyticsType {
  chatbotId: Types.ObjectId;
  totalSessions: number;
  completedSessions: number;
  dropOffSessions: number;
  avgCompletionRate: number;
  nodeStats: {
    nodeId: string;
    type: string;
    totalEntries: number;
    totalDrops: number;
    avgDurationMs: number;
  }[];
}

const ChatbotAnalyticsSchema = new Schema<ChatbotAnalyticsType>(
  {
    chatbotId: {
      type: Schema.Types.ObjectId,
      ref: "whatsappChatbot",
      required: true,
    },
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    dropOffSessions: { type: Number, default: 0 },
    avgCompletionRate: { type: Number, default: 0 },
    nodeStats: [
      {
        nodeId: String,
        type: String,
        totalEntries: Number,
        totalDrops: Number,
        avgDurationMs: Number,
      },
    ],
  },
  { timestamps: true },
);

const ChatbotAnalyticsModel: Model<ChatbotAnalyticsType> =
  mongoose.models.chatbotAnalytics ||
  model<ChatbotAnalyticsType>("chatbotAnalytics", ChatbotAnalyticsSchema);
export { ChatbotAnalyticsModel };
