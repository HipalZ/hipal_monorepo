import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { CheckCircle2 } from "lucide-react";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { useFloorStore } from "@/components/store/hotel/useFloorStore";
import { useStaffLinking } from "@/hooks/hotel/useStaffLinking";
import type { FloorDoc, RoomDoc, StaffDoc } from "./types";
import { DroppableFloor } from "./droppableFloor";
import DraggableStaff from "./draggableStaff";
import { StaffAssignmentsDialog } from "./staffAssignmentDialog";
import { DroppableRoom } from "./droppableRoom";

const formatRoleName = (role = "Uncategorized") => {
  return role
    .replace(/_/g, " ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
};

export function RoomStaffLink() {
  const { mutateAsync, isPending } = useStaffLinking();
  const [infoStaff, setInfoStaff] = useState<StaffDoc | null>(null);
  const staffListRaw = useStaffDataStore((s) => s.staffData);
  const roomRawData = useRoomStore((s) => s.roomData);
  const floorDataRaw = useFloorStore((s) => s.floorData);

  const staff = (Array.isArray(staffListRaw) ? staffListRaw : []) as StaffDoc[];
  const rooms = (Array.isArray(roomRawData) ? roomRawData : []) as RoomDoc[];
  const floors = (
    Array.isArray(floorDataRaw) ? floorDataRaw : []
  ) as FloorDoc[];

  const [assignments, setAssignments] = useState<Record<string, Set<string>>>(
    {},
  );
  const [activeStaff, setActiveStaff] = useState<StaffDoc | null>(null);

  const [initialAssignments, setInitialAssignments] = useState<
    Record<string, Set<string>>
  >({});

  useEffect(() => {
    const mapping: Record<string, Set<string>> = {};
    for (const room of rooms) {
      if (Array.isArray(room.staffIds) && room.staffIds.length > 0) {
        mapping[room._id] = new Set(room.staffIds);
      }
    }
    setAssignments(mapping);
    setInitialAssignments(mapping);
  }, [rooms]);

  const groupedStaff = useMemo(() => {
    return staff.reduce(
      (acc, staffMember) => {
        const role = staffMember.customRole?.[0]?.role || "Uncategorized";
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push(staffMember);
        return acc;
      },
      {} as Record<string, StaffDoc[]>,
    );
  }, [staff]);

  const assignedStaffIds = useMemo(() => {
    const allIds = new Set<string>();
    for (const staffSet of Object.values(assignments)) {
      for (const id of staffSet) {
        allIds.add(id);
      }
    }
    return allIds;
  }, [assignments]);

  function handleDragStart(event: DragStartEvent) {
    const staffData = event.active.data.current?.staff as StaffDoc;
    if (staffData) setActiveStaff(staffData);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveStaff(null);
    const { over, active } = event;
    if (!over || !active.data.current?.staffId) return;

    const staffId = active.data.current.staffId as string;
    const dropType = over.data.current?.type;

    if (dropType === "room") {
      const roomId = over.data.current.roomId as string;
      setAssignments((prev) => {
        const next = { ...prev };
        const set = new Set(next[roomId] || []);
        set.add(staffId);
        next[roomId] = set;
        return next;
      });
    }

    if (dropType === "floor") {
      const floorId = over.data.current.floorId as string;
      const floorRooms = rooms.filter((r) => r.zoneId === floorId);
      setAssignments((prev) => {
        const next = { ...prev };
        for (const r of floorRooms) {
          const set = new Set(next[r._id] || []);
          set.add(staffId);
          next[r._id] = set;
        }
        return next;
      });
    }
  }

  function handleRemove(roomId: string, staffId: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      const set = new Set(next[roomId] || []);
      set.delete(staffId);
      next[roomId] = set;
      return next;
    });
  }

  const floorAssignments = useMemo(() => {
    return floors.reduce(
      (acc, f) => {
        const floorRooms = rooms.filter((r) => r.zoneId === f._id);
        const staffSet = new Set<string>();
        for (const r of floorRooms) {
          for (const sid of assignments[r._id] || new Set()) {
            staffSet.add(sid);
          }
        }
        acc[f._id] = staff.filter((s) => staffSet.has(s._id));
        return acc;
      },
      {} as Record<string, StaffDoc[]>,
    );
  }, [floors, rooms, assignments, staff]);

  function handleRemoveFromFloor(floorId: string, staffId: string) {
    setAssignments((prev) => {
      const next = { ...prev };
      const floorRooms = rooms.filter((r) => r.zoneId === floorId);
      for (const r of floorRooms) {
        if (next[r._id]) {
          const set = new Set(next[r._id]);
          set.delete(staffId);
          next[r._id] = set;
        }
      }
      return next;
    });
  }

  async function handleSave() {
    const roomsPayload = Object.keys({
      ...assignments,
      ...initialAssignments,
    }).map((roomId) => {
      const initial = initialAssignments[roomId] || new Set();
      const current = assignments[roomId] || new Set();

      const added = [...current].filter((id) => !initial.has(id));
      const removed = [...initial].filter((id) => !current.has(id));

      return {
        roomId,
        staffIds: added,
        removeStaffIds: removed,
      };
    });

    const payload = { rooms: roomsPayload };
    console.log("Payload:", payload);
    await mutateAsync(payload);

    // Update baseline after save
    setInitialAssignments(assignments);
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <>
      <div className="h-[90vh] flex flex-col p-4 bg-slate-50">
        <h1 className="font-semibold text-3xl my-2">Staff Assignment</h1>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow overflow-hidden">
            <aside className="col-span-1 flex flex-col bg-white p-4 rounded-lg shadow-sm overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-slate-800 flex-shrink-0">
                Staff
              </h2>
              <div className="overflow-y-auto -mr-4 pr-4">
                {Object.entries(groupedStaff).map(([role, staffInRole]) => (
                  <div key={role} className="mb-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 sticky top-0 bg-white py-1">
                      {formatRoleName(role)}
                    </h3>
                    {staffInRole?.map((s) => (
                      <DraggableStaff
                        key={s._id}
                        staff={s}
                        isAssigned={assignedStaffIds.has(s._id)}
                        isDragging={activeStaff?._id === s._id}
                        onInfoClick={(st) => setInfoStaff(st)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </aside>
            {/* Info Modal */}
            <StaffAssignmentsDialog
              open={!!infoStaff}
              onClose={() => setInfoStaff(null)}
              staff={infoStaff}
              assignments={assignments}
              floors={floors}
              rooms={rooms}
            />

            <main className="col-span-1 lg:col-span-2 overflow-y-auto bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-slate-800">
                Floors & Rooms
              </h2>
              {floors.map((f) => {
                const floorRooms = rooms.filter((r) => r.zoneId === f._id);
                const staffCount = new Set(
                  floorRooms.flatMap((r) =>
                    Array.from(assignments[r._id] || []),
                  ),
                ).size;

                return (
                  <DroppableFloor
                    key={f._id}
                    floor={f}
                    roomCount={floorRooms.length}
                    staffCount={staffCount}
                    assignedStaff={floorAssignments[f._id] || []}
                    onRemoveStaff={(sid) => handleRemoveFromFloor(f._id, sid)}
                  >
                    {floorRooms.map((r) => (
                      <DroppableRoom
                        key={r._id}
                        room={r}
                        assigned={staff.filter((s) =>
                          (assignments[r._id] || new Set()).has(s._id),
                        )}
                        onRemove={(sid) => handleRemove(r._id, sid)}
                      />
                    ))}
                  </DroppableFloor>
                );
              })}
            </main>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeStaff ? (
              <div className="p-2 flex items-center gap-3 rounded-lg border bg-white shadow-xl">
                {assignedStaffIds.has(activeStaff._id) ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 bg-slate-200 rounded-full" />
                )}
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-700">
                  {activeStaff.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{activeStaff.name}</p>
                  <p className="text-xs text-gray-500">{activeStaff.phone}</p>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Save Assignments",
            onClick: handleSave,
            className: "w-full pl-3 rounded-md",
            isLoading: isPending,
          },
        ]}
      />
    </>
  );
}
