import { lazy, useMemo, useRef, useState } from "react";
import type { FloorDoc, GroupedPreview, RoomDoc, StaffDoc } from "./types";
import { StaffSelector } from "./staffSelector";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import { useFloorStore } from "@/components/store/hotel/useFloorStore";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import { useStaffLinking } from "@/hooks/hotel/useStaffLinking";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { ConfirmDialog } from "@/components/hotel/FloorAndRooms/room-staff-linking/confirmDialog";
import { PreviewDialog } from "@/components/hotel/FloorAndRooms/room-staff-linking/previewDialog";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import { RoomsSelector } from "@/components/hotel/FloorAndRooms/room-staff-linking/roomsSelector";
import { Button } from "@/components/ui/button";
import { usePreview } from "@/components/hotel/FloorAndRooms/room-staff-linking/usePreview";
import { ArrowLeft, Plus, Minus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

const StaffAllocation = lazy(() => import("./staffAllocation"));

type Mode = "ADD" | "REMOVE";

export function RoomStaffLink() {
  const { mutateAsync, isPending } = useStaffLinking();

  // stores
  const selectedRooms = useStaffDataStore((s) => s.selectedRooms);
  const selectedStaff = useStaffDataStore((s) => s.selectedStaff);
  const setSelectedRoomsStore = useStaffDataStore((s) => s.setSelectedRooms);
  const setSelectedStaffStore = useStaffDataStore((s) => s.setSelectedStaff);
  const toggleRoomSelectionStore = useStaffDataStore(
    (s) => s.toggleRoomSelection,
  );
  const toggleStaffSelectionStore = useStaffDataStore(
    (s) => s.toggleStaffSelection,
  );
  const clearSelections = useStaffDataStore((s) => s.clearSelections);
  const getStaffByRoom = useStaffDataStore((s) => s.getStaffByRoom);
  const getRoomsByStaff = useStaffDataStore((s) => s.getRoomsByStaff);
  const staffListRaw = useStaffDataStore((s) => s.staffData);

  const [openTool, setOpenTool] = useState(false);
  const { roomData: roomDataRaw, roomType: roomTypes } = useRoomStore();
  const floorDataRaw = useFloorStore((s) => s.floorData);

  // Safe arrays
  const rooms = (Array.isArray(roomDataRaw) ? roomDataRaw : []) as RoomDoc[];
  const staff = (Array.isArray(staffListRaw) ? staffListRaw : []) as StaffDoc[];
  const floors = (
    Array.isArray(floorDataRaw) ? floorDataRaw : []
  ) as FloorDoc[];
  const selRooms = Array.isArray(selectedRooms) ? selectedRooms : [];
  const selStaff = Array.isArray(selectedStaff) ? selectedStaff : [];

  // Track unchecks this session (to be removed)
  const [removedRooms, setRemovedRooms] = useState<string[]>([]);
  const [removedStaff, setRemovedStaff] = useState<string[]>([]);

  // Mode + baselines captured at moment of switching to REMOVE
  const [mode, setMode] = useState<Mode>("ADD");
  const baselineRoomsRef = useRef<Set<string>>(new Set());
  const baselineStaffRef = useRef<Set<string>>(new Set());

  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

  // Preview (used for ADD flow UX)
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successPreview, setSuccessPreview] = useState<GroupedPreview>([]);
  const { buildPreview, totalPairings } = usePreview(
    selRooms,
    selStaff,
    rooms,
    staff,
    floors,
  );
  const preview = buildPreview();

  // ---- Togglers (mode-aware) ----
  const handleToggleRoomSelection = (id: string) => {
    if (mode === "REMOVE") {
      // Only allow toggling baseline items
      if (!baselineRoomsRef.current.has(id)) return;

      const wasSelected = selRooms.includes(id);
      if (wasSelected) {
        // Unchecking → mark to remove
        setRemovedRooms((p) => uniq([...p, id]));
      } else {
        // Re-checking → undo removal
        setRemovedRooms((p) => p.filter((x) => x !== id));
      }
      toggleRoomSelectionStore(id);
      return;
    }

    // ADD mode
    toggleRoomSelectionStore(id);
  };

  const handleToggleStaffSelection = (id: string) => {
    if (mode === "REMOVE") {
      if (!baselineStaffRef.current.has(id)) return;

      const wasSelected = selStaff.includes(id);
      if (wasSelected) {
        setRemovedStaff((p) => uniq([...p, id]));
      } else {
        setRemovedStaff((p) => p.filter((x) => x !== id));
      }
      toggleStaffSelectionStore(id);
      return;
    }

    // ADD mode
    toggleStaffSelectionStore(id);
  };

  // ---- Bulk setters (keep safe in REMOVE) ----
  const handleSetSelectedRooms = (nextIds: string[]) => {
    if (mode === "REMOVE") {
      const baseline = baselineRoomsRef.current;
      const safeNext = nextIds.filter((id) => baseline.has(id)); // clamp
      const removed = selRooms.filter((id) => !safeNext.includes(id));
      const addedBack = safeNext.filter((id) => !selRooms.includes(id));
      setRemovedRooms((p) => uniq([...p, ...removed]));
      setRemovedRooms((p) => p.filter((id) => !addedBack.includes(id)));
      setSelectedRoomsStore(safeNext);
      return;
    }
    // ADD mode
    setSelectedRoomsStore(nextIds);
  };

  const handleSetSelectedStaff = (nextIds: string[]) => {
    if (mode === "REMOVE") {
      const baseline = baselineStaffRef.current;
      const safeNext = nextIds.filter((id) => baseline.has(id));
      const removed = selStaff.filter((id) => !safeNext.includes(id));
      const addedBack = safeNext.filter((id) => !selStaff.includes(id));
      setRemovedStaff((p) => uniq([...p, ...removed]));
      setRemovedStaff((p) => p.filter((id) => !addedBack.includes(id)));
      setSelectedStaffStore(safeNext);
      return;
    }
    // ADD mode
    setSelectedStaffStore(nextIds);
  };

  // ---- Proceed rules ----
  const canProceed = useMemo(() => {
    if (mode === "ADD") return selRooms.length > 0 && selStaff.length > 0;
    return removedRooms.length > 0 && removedStaff.length > 0;
  }, [mode, selRooms, selStaff, removedRooms, removedStaff]);

  const openPreview = () => {
    if (!canProceed) return;
    if (mode === "REMOVE") return;
    setShowPreview(true);
  };

  const openConfirm = () => {
    if (!canProceed) return;
    setShowConfirm(true);
  };

  // ---- Execute ----
  const onExecute = async () => {
    try {
      if (!canProceed) {
        setShowConfirm(false);
        setShowPreview(false);
        return;
      }

      const payload =
        mode === "ADD"
          ? { rooms: [{ roomIds: selRooms, staffIds: selStaff }] }
          : {
              rooms: [
                { removeRoomIds: removedRooms, removeStaffIds: removedStaff },
              ],
            };

      await mutateAsync(payload);

      setSuccessPreview(preview);
      setShowConfirm(false);
      setShowPreview(false);

      // Reset everything for a clean next action
      clearSelections();
      setRemovedRooms([]);
      setRemovedStaff([]);
      baselineRoomsRef.current = new Set();
      baselineStaffRef.current = new Set();
      setMode("ADD");
    } catch {
      setShowConfirm(false);
    }
  };

  // ---- Tool open/close ----
  const toggleTool = () => {
    setOpenTool((v) => !v);
    clearSelections();
    setRemovedRooms([]);
    setRemovedStaff([]);
    baselineRoomsRef.current = new Set();
    baselineStaffRef.current = new Set();
    setMode("ADD");
  };

  // ---- Mode change (no clearing) ----
  const onModeChange = (next: Mode) => {
    setMode(next);

    if (next === "REMOVE") {
      // Snapshot current selection as baseline
      baselineRoomsRef.current = new Set(selRooms);
      baselineStaffRef.current = new Set(selStaff);
      setRemovedRooms([]);
      setRemovedStaff([]);
    } else {
      // Back to ADD
      baselineRoomsRef.current = new Set();
      baselineStaffRef.current = new Set();
      setRemovedRooms([]);
      setRemovedStaff([]);
    }

    setShowPreview(false);
    setShowConfirm(false);
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-4 md:p-6 mx-auto max-w-7xl mb-[3rem]">
      {!openTool ? (
        <div className="space-y-2 text-center">
          <StaffAllocation toggleTool={toggleTool} setOpenTool={setOpenTool} />
        </div>
      ) : (
        <>
          {/* Header row with Back + Action dropdown */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={toggleTool}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm text-gray-600">Back to Overview</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {mode === "ADD" ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {mode === "ADD" ? "Add mode" : "Remove mode"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Action</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(v) => onModeChange(v as Mode)}
                >
                  <DropdownMenuRadioItem value="ADD">Add</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="REMOVE">
                    Remove
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pb-32 md:pb-20">
            <RoomsSelector
              rooms={rooms}
              floors={floors}
              selectedRooms={selRooms}
              setSelectedRooms={handleSetSelectedRooms}
              toggleRoomSelection={handleToggleRoomSelection}
              getStaffByRoom={getStaffByRoom}
              roomTypes={roomTypes}
            />
            <StaffSelector
              staff={staff}
              selectedStaff={selStaff}
              setSelectedStaff={handleSetSelectedStaff}
              toggleStaffSelection={handleToggleStaffSelection}
              getRoomsByStaff={getRoomsByStaff}
            />
          </div>

          <AdvancedBottomButton
            fixed
            maxWidth="36rem"
            buttons={[
              {
                text: "Preview",
                onClick: openPreview,
                disable: mode === "REMOVE" || !canProceed,
                className:
                  "w-full sm:w-auto py-3 px-6 ring-1 ring-blue-200 text-blue-700 bg-white hover:bg-blue-50 shadow-lg",
              },
              {
                text:
                  mode === "ADD"
                    ? selRooms.length && selStaff.length
                      ? `Add staff × ${selRooms.length} rooms (${totalPairings})`
                      : "Add"
                    : "Apply removals",
                onClick: openConfirm,
                disable: !canProceed,
                className:
                  "w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg",
              },
            ]}
          />

          <PreviewDialog
            open={showPreview}
            onOpenChange={setShowPreview}
            preview={preview}
            onProceed={openConfirm}
          />
          <ConfirmDialog
            open={showConfirm}
            onOpenChange={setShowConfirm}
            onExecute={onExecute}
            preview={successPreview}
          />
        </>
      )}
    </div>
  );
}
