import {
  HotelAnalytics,
  HotelRoom,
  HotelRoomSession,
} from "@hi/db-models";
import type { ClientSession } from "mongoose";

type SyncHotelStayCompanionsArgs = {
  businessId?: unknown;
  roomId: unknown;
  roomSessionId?: unknown;
  userIds?: unknown[];
  source?: string;
  session?: ClientSession;
};

const asIdString = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id?: unknown })._id || "");
  }
  return String(value);
};

const uniqueIds = (ids: unknown[]) =>
  Array.from(new Set(ids.map(asIdString).filter(Boolean)));

export const syncHotelStayCompanions = async ({
  businessId,
  roomId,
  roomSessionId,
  userIds = [],
  source,
  session,
}: SyncHotelStayCompanionsArgs) => {
  const roomQuery = HotelRoom.findById(roomId).select(
    "businessId userIds source",
  );
  const room = session ? await roomQuery.session(session) : await roomQuery;

  const sessionQuery = roomSessionId
    ? HotelRoomSession.findById(roomSessionId)
    : HotelRoomSession.findOne({ roomId });
  const roomSession = session
    ? await sessionQuery.session(session)
    : await sessionQuery;

  if (!room || !roomSession) return [];

  const companionIds = uniqueIds([
    ...(room.userIds || []),
    ...(roomSession.userIds || []),
    ...userIds,
  ]);

  if (!companionIds.length) return [];

  await HotelRoomSession.updateOne(
    { _id: roomSession._id },
    { $addToSet: { userIds: { $each: companionIds } } },
    { session },
  );

  await HotelRoom.updateOne(
    { _id: room._id },
    { $addToSet: { userIds: { $each: companionIds } } },
    { session },
  );

  const resolvedBusinessId = businessId || room.businessId;
  const resolvedSource =
    source || roomSession.source || room.source || "not-given";
  const checkIn = roomSession.checkIn || roomSession.date || Date.now();

  await Promise.all(
    companionIds.map((userId) =>
      HotelAnalytics.findOneAndUpdate(
        {
          businessId: resolvedBusinessId,
          roomId: room._id,
          userId,
          roomSessionId: roomSession._id,
        },
        {
          $setOnInsert: {
            businessId: resolvedBusinessId,
            roomId: room._id,
            userId,
            roomSessionId: roomSession._id,
            checkIn,
          },
          $set: {
            source: resolvedSource,
          },
          $addToSet: {
            guestUserIds: { $each: companionIds },
          },
        },
        { upsert: true, session },
      ),
    ),
  );

  await HotelAnalytics.updateMany(
    { roomSessionId: roomSession._id },
    {
      $addToSet: {
        guestUserIds: { $each: companionIds },
      },
    },
    { session },
  );

  return companionIds;
};
