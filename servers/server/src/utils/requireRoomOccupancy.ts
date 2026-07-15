import { HotelRoom, HotelRoomChat, HotelRoomChatReply } from "@hi/db-models";
import type { Context, Next } from "hono";
import { respond } from "./response";

/**
 * Full hotel-room document loaded by requireRoomOccupancy and reused by the
 * downstream handler (create_alert / check_out_request) so the same room is not
 * queried twice. Global augmentation is harmless to other flows (restaurant
 * handlers simply never read it).
 */
type HotelRoomDoc = NonNullable<Awaited<ReturnType<typeof HotelRoom.findById>>>;

declare module "hono" {
  interface ContextVariableMap {
    hotelRoom: HotelRoomDoc;
  }
}

/**
 * Occupancy gate for guest-triggered hotel actions.
 *
 * Blocks any request whose acting user is not a CURRENT occupant of the room.
 * This is the authoritative server-side check — client guards (the checkin/chat
 * page redirects) are bypassable and must never be the security boundary.
 *
 * Source of truth is `HotelRoom.userIds`: it holds the primary guest + all
 * companions (see syncHotelStayCompanions) and is emptied at checkout
 * (roomStatus -> AVAILABLE, userIds -> []). So a stale / session-less link
 * (e.g. an old WhatsApp chat link `?room=X&id=<userId>`) is rejected here after
 * checkout, while a legitimate checked-in guest or companion passes untouched.
 *
 * Hono caches the parsed JSON body, so reading it here does not stop the
 * downstream handler / zValidator from reading it again.
 */
export const isCurrentOccupant = (
  room: { roomStatus?: string; userIds?: unknown[] } | null,
  userId: unknown,
): boolean =>
  !!room &&
  room.roomStatus === "OCCUPIED" &&
  (room.userIds || []).some((id) => String(id) === String(userId));

/** For endpoints whose body carries `roomId` + `userId` (create_alert, check_out_request). */
export const requireRoomOccupancy = async (c: Context, next: Next) => {
  let body: { roomId?: string; userId?: string };
  try {
    body = await c.req.json();
  } catch {
    return respond(c, "Invalid request body", true, 400, {});
  }

  const { roomId, userId } = body;
  if (!roomId || !userId) {
    return respond(c, "roomId and userId are required", true, 400, {});
  }

  // Full doc (not projected/lean) so the handler can reuse it via c.get.
  const room = await HotelRoom.findById(roomId);
  if (!room) {
    return respond(c, "Room not found", true, 404, {});
  }

  if (!isCurrentOccupant(room, userId)) {
    return respond(c, "Guest is not checked in to this room", true, 403, {});
  }

  c.set("hotelRoom", room);
  await next();
};

/**
 * For endpoints whose body carries `roomChatReplyId` (chat_complain, reviews).
 * Resolves the room through reply -> roomChat -> room, then checks the acting
 * user (body.userId when present, else the reply's own userId) is a current
 * occupant. After checkout the room's userIds is empty, so replays are blocked.
 */
export const requireRoomOccupancyByChatReply = async (
  c: Context,
  next: Next,
) => {
  let body: { roomChatReplyId?: string; userId?: string };
  try {
    body = await c.req.json();
  } catch {
    return respond(c, "Invalid request body", true, 400, {});
  }

  const { roomChatReplyId } = body;
  if (!roomChatReplyId) {
    return respond(c, "roomChatReplyId is required", true, 400, {});
  }

  const reply = await HotelRoomChatReply.findById(roomChatReplyId)
    .select("roomChatId userId")
    .lean();
  if (!reply) {
    return respond(c, "Room chat reply not found", true, 404, {});
  }

  const chat = await HotelRoomChat.findById(reply.roomChatId)
    .select("roomId userId")
    .lean();
  if (!chat) {
    return respond(c, "Room chat not found", true, 404, {});
  }

  const actorId = body.userId || reply.userId || chat.userId;
  const room = await HotelRoom.findById(chat.roomId)
    .select("roomStatus userIds")
    .lean();
  if (!room) {
    return respond(c, "Room not found", true, 404, {});
  }

  if (!isCurrentOccupant(room, actorId)) {
    return respond(c, "Guest is not checked in to this room", true, 403, {});
  }

  await next();
};
