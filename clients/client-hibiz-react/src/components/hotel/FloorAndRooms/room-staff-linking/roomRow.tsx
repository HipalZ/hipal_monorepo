import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import { Home } from "lucide-react";
import { useState } from "react";
const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  BOOKED: "bg-amber-100 text-amber-800 border-amber-200",
  OCCUPIED: "bg-red-100 text-red-800 border-red-200",
  MAINTENANCE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CLEANING: "bg-blue-100 text-blue-800 border-blue-200",
  RESERVED: "bg-purple-100 text-purple-800 border-purple-200",
  BLOCKED: "bg-gray-200 text-gray-800 border-gray-300",
};
const RoomRow = ({
  r,
  staffById,
}: {
  r: IHotelRoom;
  staffById: Record<string, { _id: string; name: string; phone?: string }>;
}) => {
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
            type="button"
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
            {staffNames.map((staff, i) => (
              <span
                key={`${staff}-${i?.toString()}`}
                className="px-2 py-1 text-xs rounded-full bg-slate-50 ring-1 ring-slate-200"
              >
                {staff}
              </span>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomRow;
