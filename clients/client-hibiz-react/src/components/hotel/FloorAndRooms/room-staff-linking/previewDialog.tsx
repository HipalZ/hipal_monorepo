import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GroupedPreview } from "./types";

export function PreviewDialog({
  open,
  onOpenChange,
  preview,
  onProceed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  preview: GroupedPreview;
  onProceed: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            Floor → Rooms → Staff that will be ADD these rooms.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto space-y-4">
          {preview.map((f) => (
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
                      <Badge variant="outline">{r.staff.length} staff</Badge>
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
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={onProceed}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
