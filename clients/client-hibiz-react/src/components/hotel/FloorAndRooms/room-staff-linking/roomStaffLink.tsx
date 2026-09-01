import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import { useFloorStore } from '@/components/store/hotel/useFloorStore';
import { useStaffDataStore } from '@/components/store/hotel/useHotelStaff';
import { useRoomStore } from '@/components/store/hotel/useRoomStore';
import useBusinessData from '@/components/store/useBusinessData';
import { Input } from '@/components/ui/input';
import { findBusinessRole } from '@/components/utils/helper';
import { useStaffLinking } from '@/hooks/hotel/useStaffLinking';
import { defaultDropAnimationSideEffects, DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, type DropAnimation } from '@dnd-kit/core';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DraggableStaff from './draggableStaff';
import { DroppableFloor } from './droppableFloor';
import { DroppableRoom } from './droppableRoom';
import { ScreenDisclaimer } from './screenDisclaimer';
import { StaffAssignmentsDialog } from './staffAssignmentDialog';
import type { FloorDoc, RoomDoc, StaffDoc } from './types';

const formatRoleName = (role = 'Uncategorized') => {
  return role.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export function RoomStaffLink() {
  const { mutateAsync, isPending } = useStaffLinking();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId || s.businessData?._id);
  const [infoStaff, setInfoStaff] = useState<StaffDoc | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // search input

  const staffListRaw = useStaffDataStore((s) => s.staffData);
  const roomRawData = useRoomStore((s) => s.roomData);
  const floorDataRaw = useFloorStore((s) => s.floorData);

  const staff = (Array.isArray(staffListRaw) ? staffListRaw : []) as StaffDoc[];
  const rooms = (Array.isArray(roomRawData) ? roomRawData : []) as unknown as RoomDoc[];
  const floors = (Array.isArray(floorDataRaw) ? floorDataRaw : []) as FloorDoc[];

  const [assignments, setAssignments] = useState<Record<string, Set<string>>>({});
  const [activeStaff, setActiveStaff] = useState<StaffDoc | null>(null);

  const [initialAssignments, setInitialAssignments] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    const mapping: Record<string, Set<string>> = {};
    for (const room of rooms) {
      if (Array.isArray(room?.staffIds) && room?.staffIds.length > 0) {
        mapping[room._id] = new Set(room?.staffIds);
      }
    }
    setAssignments(mapping);
    setInitialAssignments(mapping);
  }, [rooms]);

  // 🔍 Optimized staff filtering
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staff;

    const lower = searchTerm.toLowerCase();
    return staff.filter((s) => s.name.toLowerCase().includes(lower) || (s.phone ?? '').toLowerCase().includes(lower));
  }, [staff, searchTerm]);

  const groupedStaff = useMemo(() => {
    return filteredStaff.reduce(
      (acc, staffMember) => {
        const role = findBusinessRole(staffMember.customRole, businessId)?.role ?? 'Uncategorized';
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push(staffMember);
        return acc;
      },
      {} as Record<string, StaffDoc[]>,
    );
  }, [businessId, filteredStaff]);

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

    if (dropType === 'room') {
      const roomId = over?.data?.current?.roomId as string;
      setAssignments((prev) => {
        const next = { ...prev };
        const set = new Set(next[roomId] || []);
        set.add(staffId);
        next[roomId] = set;
        return next;
      });
    }

    if (dropType === 'floor') {
      const floorId = over?.data?.current?.floorId as string;
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
    })
      .map((roomId) => {
        const initial = initialAssignments[roomId] || new Set();
        const current = assignments[roomId] || new Set();

        const added = [...current].filter((id) => !initial.has(id));
        const removed = [...initial].filter((id) => !current.has(id));

        if (added.length === 0 && removed.length === 0) {
          return null;
        }

        return {
          roomId,
          staffIds: added,
          removeStaffIds: removed,
        };
      })
      .filter(Boolean);

    if (roomsPayload.length === 0) {
      return;
    }

    const payload = { rooms: roomsPayload };
    console.log('Payload:', payload);

    await mutateAsync(payload);

    // ✅ update baseline only for changed rooms
    setInitialAssignments((prev) => {
      const next = { ...prev };
      for (const r of roomsPayload) {
        if (!r) continue;
        next[r.roomId] = new Set([...(assignments[r.roomId] || [])]);
      }
      return next;
    });
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } },
    }),
  };

  return (
    <>
      <div className="flex h-[90vh] flex-col bg-slate-50 p-4">
        <h1 className="my-2 text-3xl font-semibold">Staff Assignment</h1>
        <ScreenDisclaimer />
        {/* 🔍 Search Box */}
        <Input
          type="text"
          placeholder="Search staff by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 rounded-md border p-2 text-sm focus:ring-2 focus:ring-purple-400"
        />

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid flex-grow grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
            <aside className="col-span-1 flex flex-col overflow-y-auto rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 flex-shrink-0 text-xl font-bold text-slate-800">Staff</h2>
              <div className="-mr-4 overflow-y-auto pr-4">
                {Object.entries(groupedStaff).map(([role, staffInRole]) => (
                  <div key={role} className="mb-4">
                    <h3 className="sticky top-0 mb-2 bg-white py-1 text-xs font-bold uppercase text-slate-500">{formatRoleName(role)}</h3>
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

            <main className="col-span-1 overflow-y-auto rounded-lg bg-white p-4 shadow-sm lg:col-span-2">
              <h2 className="mb-4 text-xl font-bold text-slate-800">Floors & Rooms</h2>
              {floors.map((f) => {
                const floorRooms = rooms.filter((r) => r.zoneId === f._id);
                const staffCount = new Set(floorRooms.flatMap((r) => Array.from(assignments[r._id] || []))).size;

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
                        assigned={staff.filter((s) => (assignments[r._id] || new Set()).has(s._id))}
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
              <div className="flex items-center gap-3 rounded-lg border bg-white p-2 shadow-xl">
                {assignedStaffIds.has(activeStaff._id) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-slate-200" />
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
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
            text: 'Save Assignments',
            onClick: handleSave,
            className: 'w-full pl-3 rounded-md',
            isLoading: isPending,
          },
        ]}
      />
    </>
  );
}
