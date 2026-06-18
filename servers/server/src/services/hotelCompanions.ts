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

type SyncHotelCompanionReadModelArgs = {
  businessId: string;
  userId?: string;
  from?: number;
  to?: number;
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

export const syncHotelCompanionReadModel = async ({
  businessId,
  userId,
  from,
  to,
}: SyncHotelCompanionReadModelArgs) => {
  const roomQuery: Record<string, unknown> = {
    businessId,
    userIds: userId ? userId : { $exists: true, $ne: [] },
  };

  const activeRooms = await HotelRoom.find(roomQuery)
    .select("_id")
    .lean();

  await Promise.all(
    activeRooms.map((room) =>
      syncHotelStayCompanions({
        businessId,
        roomId: room._id,
        userIds: userId ? [userId] : [],
      }),
    ),
  );

  const analyticsQuery: Record<string, unknown> = {
    businessId,
    roomSessionId: { $ne: null },
  };

  if (userId) {
    analyticsQuery.$or = [{ userId }, { guestUserIds: userId }];
  }

  if (typeof from === "number" || typeof to === "number") {
    const range: Record<string, number> = {};
    if (typeof from === "number") range.$gte = from;
    if (typeof to === "number") range.$lte = to;
    analyticsQuery.checkIn = range;
  }

  const analyticsRows = await HotelAnalytics.find(analyticsQuery)
    .select("_id userId guestUserIds roomSessionId")
    .lean();

  const companionsBySession = new Map<string, Set<string>>();
  for (const row of analyticsRows) {
    const sessionId = asIdString(row.roomSessionId);
    if (!sessionId) continue;

    const ids = companionsBySession.get(sessionId) || new Set<string>();
    const primaryUserId = asIdString(row.userId);
    if (primaryUserId) ids.add(primaryUserId);
    for (const guestId of row.guestUserIds || []) {
      const id = asIdString(guestId);
      if (id) ids.add(id);
    }
    companionsBySession.set(sessionId, ids);
  }

  await Promise.all(
    Array.from(companionsBySession.entries()).map(([roomSessionId, ids]) =>
      HotelAnalytics.updateMany(
        { businessId, roomSessionId },
        {
          $addToSet: {
            guestUserIds: { $each: Array.from(ids) },
          },
        },
      ),
    ),
  );
};
