import { memo, useMemo, useState } from "react";
import { MapPin, Home, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { useFloorStore } from "@/components/store/hotel/useFloorStore";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  BOOKED: "bg-amber-100 text-amber-800 border-amber-200",
  OCCUPIED: "bg-red-100 text-red-800 border-red-200",
  MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CLEANING: "bg-blue-100 text-blue-800 border-blue-200",
  RESERVED: "bg-purple-100 text-purple-800 border-purple-200",
  BLOCKED: "bg-gray-200 text-gray-800 border-gray-300",
};

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
    const m = new Map<string, IHotelRoom[]>();
    for (const r of rooms) {
      const fid = r.zoneId || "unassigned";
      if (!m.has(fid)) m.set(fid, []);
      m.get(fid)!.push(r);
    }
    return m;
  }, [rooms]);

  // Global search across floor/room/staff names
  const [q, setQ] = useState("");
  const qLower = q.trim().toLowerCase();
  const filteredFloors = useMemo(() => {
    if (!qLower) return floors;
    return floors.filter((f) => {
      if (f.name?.toLowerCase().includes(qLower)) return true;
      const floorRooms = roomsByFloor.get(f._id) ?? [];
      const roomHit = floorRooms.some(
        (r) =>
          r.name?.toLowerCase().includes(qLower) ||
          roomTypeNameById[r.roomTypeId ?? ""]?.toLowerCase().includes(qLower),
      );
      const staffHit = floorRooms.some((r) =>
        (r.staffIds ?? []).some((sid) =>
          staffById[sid]?.name?.toLowerCase().includes(qLower),
        ),
      );
      return roomHit || staffHit;
    });
  }, [qLower, floors, roomsByFloor, roomTypeNameById, staffById]);

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
        <div className="rounded-xl border bg-white p-3 flex items-center gap-2 w-full max-w-xl">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search floors, rooms or staff..."
            className="border-0 shadow-none focus-visible:ring-0 p-0"
          />
          {q && (
            <Button variant="ghost" size="sm" onClick={() => setQ("")}>
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
              roomTypeNameById={roomTypeNameById}
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

const StatCard = memo(function StatCard({
  label,
  value,
}: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex items-center justify-between">
      <div className="text-base md:text-xl tracking-wide text-gray-500">
        {label}
      </div>
      <div className="text-base md:text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
});

const FloorCard = memo(function FloorCard({
  floorName,
  rooms,
  staffById,
  roomTypeNameById,
  onEdit,
}: {
  floorName: string;
  rooms: IHotelRoom[];
  staffById: Record<
    string,
    {
      _id: string;
      name: string;
      phone?: string;
      customRole?: { role: string }[];
    }
  >;
  roomTypeNameById: Record<string, string>;
  onEdit?: (floorRooms: IHotelRoom[]) => void;
}) {
  // Unique staff w/ counts of rooms handled on this floor
  const staffCountEntries = useMemo(() => {
    const count = new Map<string, number>();
    for (const r of rooms)
      for (const sid of r.staffIds ?? [])
        count.set(sid, (count.get(sid) ?? 0) + 1);
    return Array.from(count.entries()).sort((a, b) => b[1] - a[1]);
  }, [rooms]);

  const [openRooms, setOpenRooms] = useState(false);
  const maxRoomsPreview = 6;
  const roomsPreview = rooms.slice(0, maxRoomsPreview);
  const hasMoreRooms = rooms.length > maxRoomsPreview;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            {floorName}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{rooms.length} rooms</Badge>
            <Button size="sm" variant="outline" onClick={() => onEdit?.(rooms)}>
              Edit Linking
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 mt-4">
        <div className="space-y-2">
          <div className="text-left text-xs font-semibold text-gray-700 pb-1">
            Staff on this floor
          </div>
          <div className="flex flex-wrap gap-1.5">
            {staffCountEntries.length ? (
              staffCountEntries.slice(0, 12).map(([sid, cnt]) => (
                <span
                  key={sid}
                  className="px-2 py-1 text-xs rounded-full bg-slate-50 ring-1 ring-slate-200"
                >
                  {staffById[sid]?.name || "Unknown"} · {cnt}
                </span>
              ))
            ) : (
              <Badge variant="outline">No staff assigned</Badge>
            )}
            {staffCountEntries.length > 12 && (
              <button
                type="button"
                onClick={() => setOpenRooms(true)}
                className="px-2 py-1 text-[10px] rounded-full bg-slate-100 ring-1 ring-slate-200"
              >
                +{staffCountEntries.length - 12} more
              </button>
            )}
          </div>
        </div>

        {/* Rooms on this floor with per-room staff mapping */}
        <div className="space-y-2">
          <div className="text-left text-xs font-semibold text-gray-700">
            Rooms & assigned staff
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roomsPreview.map((r) => (
              <RoomRow
                key={r._id}
                r={r}
                staffById={staffById}
                typeName={roomTypeNameById[r.roomTypeId ?? ""] || "—"}
              />
            ))}
          </div>
          {hasMoreRooms && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenRooms(true)}
              >
                View all rooms ({rooms.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* All rooms modal */}
      <Dialog open={openRooms} onOpenChange={setOpenRooms}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rooms on {floorName}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
            {rooms.map((r) => (
              <RoomRow
                key={r._id}
                r={r}
                staffById={staffById}
                typeName={roomTypeNameById[r.roomTypeId ?? ""] || "—"}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

const RoomRow = memo(function RoomRow({
  r,
  staffById,
}: {
  r: IHotelRoom;
  staffById: Record<string, { _id: string; name: string; phone?: string }>;
}) {
  const status = r.roomStatus ?? (r.availability ? "AVAILABLE" : "OCCUPIED");
  const staffNames = (r.staffIds ?? [])
    .map((id) => staffById[id]?.name)
    .filter(Boolean) as string[];
  const [openStaff, setOpenStaff] = useState(false);

  return (
    <div className="p-3 rounded-lg ring-1 ring-slate-200 bg-white">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-slate-800 flex items-center gap-2">
          <Home className="h-4 w-4 text-purple-600" />
          {r.name}
        </div>
        <Badge
          className={`${
            statusColors[status] ?? "bg-gray-100 text-gray-800 border-gray-200"
          } border scale-75 -mr-2`}
        >
          {status.replace(/_/g, " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-500">Staff:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setOpenStaff(true)}
            className="px-2 py-1 text-[10px] underline"
          >
            +{staffNames.length} View
          </button>
        </div>
      </div>

      {/* All staff modal for this room */}
      <Dialog open={openStaff} onOpenChange={setOpenStaff}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Staff in {r.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-1.5">
            {staffNames.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="px-2 py-1 text-xs rounded-full bg-slate-50 ring-1 ring-slate-200"
              >
                {n}
              </span>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

function EmptyNotice({ text }: { text: string }) {
  return (
    <div className="col-span-full flex items-center justify-center py-8 text-sm text-gray-500">
      {text}
    </div>
  );
}
