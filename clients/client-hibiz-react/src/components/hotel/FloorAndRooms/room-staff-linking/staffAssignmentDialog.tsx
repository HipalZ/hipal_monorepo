import { Dialog } from "@headlessui/react";
import { FloorDoc, RoomDoc, StaffDoc } from "./types";
import { Button } from "@/components/ui/button";

export function StaffAssignmentsDialog({
  open,
  onClose,
  staff,
  assignments,
  floors,
  rooms,
}: {
  open: boolean;
  onClose: () => void;
  staff: StaffDoc | null;
  assignments: Record<string, Set<string>>;
  floors: FloorDoc[];
  rooms: RoomDoc[];
}) {
  if (!staff) return null;

  // Find rooms where this staff is present
  const staffRooms = rooms.filter((r) =>
    (assignments[r._id] || new Set()).has(staff._id),
  );

  // Group by floor
  const roomsByFloor = floors
    .map((f) => ({
      floor: f,
      rooms: staffRooms.filter((r) => r.zoneId === f._id),
    }))
    .filter((group) => group.rooms.length > 0);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold text-slate-800 mb-2">
            {staff.name}'s Assignments
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-500 mb-4">
            Assigned to {staffRooms.length} room(s) across {roomsByFloor.length}{" "}
            floor(s).
          </Dialog.Description>

          {roomsByFloor.map(({ floor, rooms }) => (
            <div key={floor._id} className="mb-3">
              <p className="font-semibold text-slate-700">{floor.name}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {rooms.map((r) => (
                  <span
                    key={r._id}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
