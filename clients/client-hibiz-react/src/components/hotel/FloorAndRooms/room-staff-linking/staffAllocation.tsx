import { lazy, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { useFloorStore } from "@/components/store/hotel/useFloorStore";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
const StatCard = lazy(() => import("./statCard"));
const FloorCard = lazy(() => import("./floorCard"));

export default function StaffAllocation({
  toggleTool,
  setOpenTool,
}: { toggleTool: () => void; setOpenTool: (open: boolean) => void }) {
  const { roomData: roomDataRaw, roomType: roomTypes } = useRoomStore((s) => ({
    roomData: s.roomData,
    roomType: s.roomType,
  }));
  const floorsRaw = useFloorStore((s) => s.floorData);
  const staffRaw = useStaffDataStore((s) => s.staffData);
  const setSelectedRooms = useStaffDataStore((s) => s.setSelectedRooms);
  const setSelectedStaff = useStaffDataStore((s) => s.setSelectedStaff);

  const rooms: IHotelRoom[] = Array.isArray(roomDataRaw) ? roomDataRaw : [];
  const floors = Array.isArray(floorsRaw)
    ? floorsRaw
    : ([] as { _id: string; name: string }[]);
  const staff = Array.isArray(staffRaw)
    ? staffRaw
    : ([] as {
        _id: string;
        name: string;
        phone?: string;
        customRole?: { role: string }[];
      }[]);

  const roomTypeNameById = useMemo(
    () =>
      Object.fromEntries(
        (roomTypes ?? []).map((t: any) => [t._id, t.roomType]),
      ),
    [roomTypes],
  );
  const staffById = useMemo(
    () => Object.fromEntries(staff.map((s) => [s._id, s])),
    [staff],
  );

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    const mapping = new Map<string, IHotelRoom[]>();
    for (const room of rooms) {
      const floorId = room.zoneId || "unassigned";
      if (!mapping.has(floorId)) mapping.set(floorId, []);
      mapping.get(floorId)!.push(room);
    }
    return mapping;
  }, [rooms]);

  // Global search across floor/room/staff names
  const [query, setQuery] = useState("");
  const queryLower = query.trim().toLowerCase();
  const filteredFloors = useMemo(() => {
    if (!queryLower) return floors;
    return floors.filter((f) => {
      if (f.name?.toLowerCase().includes(queryLower)) return true;
      const floorRooms = roomsByFloor.get(f._id) ?? [];
      const roomHit = floorRooms.some(
        (room) =>
          room.name?.toLowerCase().includes(queryLower) ||
          roomTypeNameById[room.roomTypeId ?? ""]
            ?.toLowerCase()
            .includes(queryLower),
      );
      const staffHit = floorRooms.some((room) =>
        (room.staffIds ?? []).some((sid) =>
          staffById[sid]?.name?.toLowerCase().includes(queryLower),
        ),
      );
      return roomHit || staffHit;
    });
  }, [queryLower, floors, roomsByFloor, roomTypeNameById, staffById]);

  const openEditForFloor = (floorRooms: IHotelRoom[]) => {
    // unique staff assigned to those rooms
    const staffIds = Array.from(
      new Set(floorRooms.flatMap((r) => r.staffIds ?? [])),
    );

    // only include roomIds that are linked to at least one staff
    const roomIds = floorRooms
      .filter((r) => (r.staffIds ?? []).length > 0)
      .map((r) => r._id);

    // prefill selections
    setSelectedRooms(roomIds);
    setSelectedStaff(staffIds);

    // go to selectors view
    setOpenTool(true);
  };

  return (
    <div className="mx-auto max-w-7xl p-2 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Floors Overview
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Staffs allocated for floors {filteredFloors.length}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 items-stretch">
        <StatCard label="Floors" value={floors.length} />
        <StatCard label="Rooms" value={rooms.length} />
        <StatCard label="Staff" value={staff.length} />
      </div>

      {/* Floors list (only section) */}
      <div className="flex items-center gap-2">
        <div className="rounded-xl border bg-white pl-2 flex items-center gap-2 w-full max-w-xl">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search floors, rooms..."
            className="border-0 shadow-none focus-visible:ring-0 p-0"
          />
          {query && (
            <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[70vh] rounded-xl border bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          {filteredFloors.map((f) => (
            <FloorCard
              key={f._id}
              floorName={f.name}
              rooms={roomsByFloor.get(f._id) ?? []}
              staffById={staffById}
              onEdit={openEditForFloor}
            />
          ))}
          {!filteredFloors.length && <EmptyNotice text="No floors found" />}
        </div>
      </ScrollArea>
      <AdvancedBottomButton
        fixed
        maxWidth="36rem"
        buttons={[
          {
            text: "Staff Linking",
            className: "pl-3 rounded-md w-full",
            onClick: toggleTool,
          },
        ]}
      />
    </div>
  );
}

function EmptyNotice({ text }: { text: string }) {
  return (
    <div className="col-span-full flex items-center justify-center py-8 text-sm text-gray-500">
      {text}
    </div>
  );
}
