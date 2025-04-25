import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });
export const hotelRoomChat = z.object({
  userId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  alertId: ObjectIdSchema,
  roomChatReplyIds: z.array(ObjectIdSchema).optional(),
  date: z.number().optional(),
  description: z.string().min(1).max(200).optional(),
  isDeleted: z.boolean().default(false),
  cart: z.array(z.object({})).optional(),
});

export const hotelRoomChatReply = z.object({
  userId: ObjectIdSchema,
  action: z.boolean().default(false),
  status: z.enum(["NORMAL", "WARNING"]).default("NORMAL"),
  date: z.number().optional(),
  description: z.string().min(1).max(200),
  roomChatId: ObjectIdSchema,
});

export const updateRoomChat = z.object({
  roomChatReplyId: ObjectIdSchema,
});

export const hotelRoomChatComplain = z.object({
  userId: ObjectIdSchema,
  roomChatReplyId: ObjectIdSchema,
  date: z.number().optional(),
  alertId: ObjectIdSchema,
  description: z.string().min(1).max(200),
  roomChatComplainReplyIds: z.array(ObjectIdSchema).optional(),
});

export type HotelRoomChatType = z.infer<typeof hotelRoomChat>;
export type HotelRoomChatReplyType = z.infer<typeof hotelRoomChatReply>;
export type HotelRoomChatComplainType = z.infer<typeof hotelRoomChatComplain>;
