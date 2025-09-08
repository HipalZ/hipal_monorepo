import { X } from "lucide-react";
import { StaffDoc } from "./types";

export default function StaffAvatar({
  staff,
  onRemove,
}: {
  staff: StaffDoc;
  onRemove?: () => void;
}) {
  return (
    <div className="relative group">
      <div
        className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-semibold border-2 border-white"
        title={staff.name}
      >
        {staff.name.slice(0, 2).toUpperCase()}
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${staff.name}`}
          onClick={onRemove}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
