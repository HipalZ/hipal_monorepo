import { useDroppable } from "@dnd-kit/core";
import { useState } from "react";
import { Building, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { FloorDoc, StaffDoc } from "./types";
import StaffAvatar from "./staffAvatar";

export function DroppableFloor({
  floor,
  children,
  roomCount,
  staffCount,
  assignedStaff,
  onRemoveStaff,
}: {
  floor: FloorDoc;
  children: React.ReactNode;
  roomCount: number;
  staffCount: number;
  assignedStaff: StaffDoc[];
  onRemoveStaff: (staffId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: floor._id,
    data: { type: "floor", floorId: floor._id },
  });

  const [open, setOpen] = useState(true);

  return (
    <div
      ref={setNodeRef}
      className="border border-slate-200 rounded-lg mb-4 transition-shadow hover:shadow-md"
    >
      <div
        className="flex flex-col gap-3 p-4 cursor-pointer hover:bg-slate-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-slate-500" />
            <h3 className="font-bold text-lg text-slate-800">{floor.name}</h3>
            <span className="text-sm text-slate-500 hidden sm:inline">
              ({roomCount} rooms)
            </span>
            <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              {staffCount} assignments
            </span>
          </div>
          {open ? (
            <ChevronDownIcon className="text-slate-500" />
          ) : (
            <ChevronRightIcon className="text-slate-500" />
          )}
        </div>

        {/* Show staff avatars at floor level */}
        {assignedStaff.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-9">
            {assignedStaff.map((s) => (
              <StaffAvatar
                key={s._id}
                staff={s}
                onRemove={() => onRemoveStaff(s._id)}
              />
            ))}
          </div>
        )}
      </div>

      {isOver && (
        <div className="m-4 p-6 text-center border-2 border-dashed border-purple-400 rounded-lg bg-purple-50">
          <p className="font-semibold text-purple-700">
            Drop to assign to all {roomCount} rooms
          </p>
        </div>
      )}

      {open && (
        <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      )}
    </div>
  );
}
