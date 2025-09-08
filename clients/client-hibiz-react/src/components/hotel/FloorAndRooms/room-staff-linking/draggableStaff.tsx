import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle2, Info } from "lucide-react";
import { StaffDoc } from "./types";

export default function DraggableStaff({
  staff,
  isAssigned,
  isDragging,
  onInfoClick,
}: {
  staff: StaffDoc;
  isAssigned: boolean;
  isDragging: boolean;
  onInfoClick: (staff: StaffDoc) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: staff._id,
    data: { type: "staff", staffId: staff._id, staff },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-2 flex items-center gap-3 rounded-lg border cursor-grab transition-colors my-2
        ${
          isAssigned
            ? "bg-slate-50 text-slate-500"
            : "bg-white hover:bg-purple-50 shadow-sm"
        }
      `}
    >
      {isAssigned ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 bg-slate-200 rounded-full flex-shrink-0" />
      )}

      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-sm text-gray-700">
        {staff.name.slice(0, 2).toUpperCase()}
      </div>

      <div className="overflow-hidden flex-1">
        <p className="font-semibold truncate">{staff.name}</p>
        <p className="text-xs text-gray-500">{staff.phone}</p>
      </div>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onInfoClick(staff)}
        className="p-1 rounded-full hover:bg-slate-100 z-50"
      >
        <Info className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  );
}
