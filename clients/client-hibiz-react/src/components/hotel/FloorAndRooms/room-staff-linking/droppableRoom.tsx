import { useDroppable } from "@dnd-kit/core";
import type { RoomDoc, StaffDoc } from "./types";
import { useState } from "react";
import StaffAvatar from "./staffAvatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@headlessui/react";

export function DroppableRoom({
  room,
  assigned,
  onRemove,
}: {
  room: RoomDoc;
  assigned: StaffDoc[];
  onRemove: (staffId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: room._id,
    data: { type: "room", roomId: room._id },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayLimit = 4;

  return (
    <>
      <div
        ref={setNodeRef}
        className={`p-4 rounded-lg border shadow-sm transition ${
          isOver ? "ring-2 ring-purple-500 bg-purple-50" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <strong className="font-semibold text-slate-800">
              {room.name}
            </strong>
            <p className="text-xs text-slate-500">{room.type || "Standard"}</p>
          </div>
        </div>

        {assigned.length > 0 ? (
          <div className="flex items-center">
            {assigned.slice(0, displayLimit).map((s) => (
              <div key={s._id} className="-ml-3 first:ml-0">
                <StaffAvatar staff={s} onRemove={() => onRemove(s._id)} />
              </div>
            ))}
            {assigned.length > displayLimit && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="relative -ml-3 w-9 h-9 rounded-full flex items-center justify-center text-slate-600 font-semibold text-xs border-2 border-white bg-slate-200 hover:bg-slate-300 cursor-pointer"
              >
                +{assigned.length - displayLimit}
              </Button>
            )}
          </div>
        ) : (
          <div className="h-9 flex items-center">
            <p className="text-sm text-slate-400">Drag staff here</p>
          </div>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold text-slate-800">
              Staff Assigned to {room.name}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              Total {assigned.length} staff members assigned.
            </Dialog.Description>

            <div className="mt-4 max-h-80 overflow-y-auto pr-2">
              <ul className="space-y-2">
                {assigned.map((s) => (
                  <li
                    key={s._id}
                    className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-700">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.phone}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onRemove(s._id);
                        if (assigned.length <= 1) setIsModalOpen(false);
                      }}
                      className="text-red-500 hover:text-red-700 !bg-transparent"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
