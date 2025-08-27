import { useMemo } from "react";
import type { FloorDoc, GroupedPreview, RoomDoc, StaffDoc } from "./types";

export function usePreview(
  selRooms: string[],
  selStaff: string[],
  rooms: RoomDoc[],
  staff: StaffDoc[],
  floors: FloorDoc[],
) {
  const floorNameById = useMemo(
    () => Object.fromEntries(floors.map((f) => [f._id, f.name])),
    [floors],
  );
  const staffById = useMemo(
    () => Object.fromEntries(staff.map((s) => [s._id, s])),
    [staff],
  );
  const roomById = useMemo(
    () => Object.fromEntries(rooms.map((r) => [r._id, r])),
    [rooms],
  );

  const buildPreview = () => {
    const byFloor: Record<
      string,
      {
        floorName: string;
        rooms: Record<
          string,
          {
            name: string;
            staff: Record<string, { _id: string; name: string; role?: string }>;
          }
        >;
      }
    > = {};
    for (const roomId of selRooms) {
      const room = roomById[roomId];
      if (!room) continue;
      const floorId = room.zoneId;
      if (!byFloor[floorId])
        byFloor[floorId] = {
          floorName: floorNameById[floorId] || "Unassigned",
          rooms: {},
        };
      if (!byFloor[floorId].rooms[roomId])
        byFloor[floorId].rooms[roomId] = { name: room.name, staff: {} };
      for (const staffId of selStaff) {
        const s = staffById[staffId];
        if (!s) continue;
        const role = s.customRole?.[0]?.role;
        byFloor[floorId].rooms[roomId].staff[staffId] = {
          _id: staffId,
          name: s.name,
          role,
        };
      }
    }
    const preview: GroupedPreview = Object.entries(byFloor).map(
      ([floorId, f]) => ({
        floorId,
        floorName: f.floorName,
        rooms: Object.entries(f.rooms).map(([roomId, r]) => ({
          roomId,
          roomName: r.name,
          staff: Object.values(r.staff),
        })),
      }),
    );
    return preview;
  };

  const totalPairings = useMemo(
    () => selRooms.length * selStaff.length,
    [selRooms, selStaff],
  );

  return { buildPreview, totalPairings, floorNameById, staffById, roomById };
}
