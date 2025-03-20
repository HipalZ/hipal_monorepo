import mongoose, { Schema, type Model } from "mongoose";
import type {
  HotelRoomChatComplainReplyType,
  HotelRoomChatComplainType,
  HotelRoomChatReplyType,
  HotelRoomChatType,
} from "../../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const hotelRoomChatSchema = new Schema<HotelRoomChatType>({
  authCode: { type: String, required: true },
  userId: { type: ObjectId, required: true, ref: "User" },
  roomId: { type: ObjectId, required: true, ref: "hotelroom" },
  alertId: { type: ObjectId, required: true, ref: "hotelalert" },
  roomChatReplyIds: [{ type: ObjectId, ref: "hotelroomchatreply" }],
  date: { type: Number, default: Date.now() },
  description: { type: String, required: false },
  isDeleted: { type: Boolean, default: false },
});

// Hotel Room Chat Reply Schema
const hotelRoomChatReplySchema = new Schema<HotelRoomChatReplyType>({
  userId: { type: ObjectId, required: true, ref: "User" },
  action: { type: Boolean, default: false },
  status: { type: String, enum: ["NORMAL", "WARNING"], default: "NORMAL" },
  date: { type: Number, default: Date.now() },
  description: { type: String, required: true },
  roomChatId: { type: ObjectId, required: true, ref: "hotelroomchat" },
  complainIds: [{ type: ObjectId, ref: "hotelroomchatcomplain" }],
});

// Hotel Room Chat Complain Schema
const hotelRoomChatComplainSchema = new Schema<HotelRoomChatComplainType>({
  userId: { type: ObjectId, required: true, ref: "User" },
  roomChatReplyId: {
    type: ObjectId,
    required: true,
    ref: "hotelroomchatreply",
  },
  date: { type: Number, default: Date.now },
  alertId: { type: ObjectId, required: true, ref: "hotelalert" },
  description: { type: String, required: true, minlength: 1, maxlength: 200 },
  roomChatComplainReplyIds: [
    { type: ObjectId, ref: "hotelroomchatcomplainreply" },
  ],
});

// Hotel Room Chat Complain Reply Schema
const hotelRoomChatComplainReplySchema =
  new Schema<HotelRoomChatComplainReplyType>({
    userId: { type: ObjectId, required: true, ref: "User" },
    date: { type: Number, default: Date.now },
    description: { type: String, required: true, minlength: 1, maxlength: 200 },
    roomChatComplainId: {
      type: ObjectId,
      required: true,
      ref: "hotelroomchatcomplain",
    },
  });

// Models
const HotelRoomChat: Model<HotelRoomChatType> =
  mongoose.model<HotelRoomChatType>("hotelroomchat", hotelRoomChatSchema);

const HotelRoomChatReply: Model<HotelRoomChatReplyType> =
  mongoose.model<HotelRoomChatReplyType>(
    "hotelroomchatreply",
    hotelRoomChatReplySchema,
  );

const HotelRoomChatComplain: Model<HotelRoomChatComplainType> =
  mongoose.model<HotelRoomChatComplainType>(
    "hotelroomchatcomplain",
    hotelRoomChatComplainSchema,
  );

const HotelRoomChatComplainReply: Model<HotelRoomChatComplainReplyType> =
  mongoose.model<HotelRoomChatComplainReplyType>(
    "hotelroomchatcomplainreply",
    hotelRoomChatComplainReplySchema,
  );

export {
  HotelRoomChat,
  HotelRoomChatComplain,
  HotelRoomChatComplainReply,
  HotelRoomChatReply,
};
