import type { FC } from "react";
import { X, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Screen } from "./types";

export const ScreensPanel: FC<{
  screens: Screen[];
  activeScreenId: string;
  onScreenSelect: (id: string) => void;
  onScreenAdd: () => void;
  onScreenDelete: (id: string) => void;
}> = ({
  screens,
  activeScreenId,
  onScreenSelect,
  onScreenAdd,
  onScreenDelete,
}) => {
  return (
    <div className="border-r bg-white dark:bg-gray-950 dark:border-gray-800 p-4 flex-col hidden md:flex">
      <h2 className="text-sm font-semibold mb-2">Screens</h2>
      <div className="flex-1 space-y-1">
        {screens.map((screen) => (
          <div
            key={screen.id}
            className={cn(
              "w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm cursor-pointer",
              activeScreenId === screen.id
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-800/50",
            )}
            onClick={() => onScreenSelect(screen.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{screen.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                onScreenDelete(screen.id);
              }}
              disabled={screens.length <= 1}
              aria-label={`Delete screen ${screen.name}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        variant="link"
        className="p-0 justify-start"
        onClick={onScreenAdd}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add new
      </Button>
    </div>
  );
};
