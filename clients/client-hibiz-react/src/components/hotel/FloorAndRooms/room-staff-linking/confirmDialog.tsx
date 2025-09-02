import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { GroupedPreview } from "./types";
import { Badge } from "@/components/ui/badge";

export function ConfirmDialog({
  open,
  onOpenChange,
  onExecute,
  preview,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onExecute: () => void;
  preview: GroupedPreview;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" /> Confirm Bulk Add
          </DialogTitle>
          <DialogDescription>
            <div className="max-h-[60vh] overflow-auto space-y-4">
              {preview.length === 0 ? (
                <p className="text-sm text-slate-600">No items to display.</p>
              ) : (
                preview.map((f) => (
                  <div
                    key={f.floorId}
                    className="rounded-xl ring-1 ring-slate-200 overflow-hidden"
                  >
                    <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
                      <div className="font-semibold text-slate-800">
                        {f.floorName}
                      </div>
                      <Badge variant="outline">{f.rooms.length} rooms</Badge>
                    </div>
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                      {f.rooms.map((r) => (
                        <div
                          key={r.roomId}
                          className="p-3 rounded-lg ring-1 ring-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-slate-800">
                              Room {r.roomName}
                            </div>
                            <Badge variant="outline">
                              {r.staff.length} staff
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {r.staff.map((s) => (
                              <span
                                key={s._id}
                                className="px-2 py-1 text-xs rounded-full bg-slate-50 ring-1 ring-slate-200"
                              >
                                {s.name}{" "}
                                {s.role ? `• ${s.role.replace("_", " ")}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onExecute}
            className={"bg-emerald-600 hover:bg-emerald-700 text-white"}
          >
            Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
