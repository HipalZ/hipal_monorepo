import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import RoomRow from "./roomRow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FloorCard = ({
  floorName,
  rooms,
  staffById,
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
  onEdit?: (floorRooms: IHotelRoom[]) => void;
}) => {
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
              <RoomRow key={r._id} r={r} staffById={staffById} />
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
              <RoomRow key={r._id} r={r} staffById={staffById} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FloorCard;
