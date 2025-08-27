import { lazy, useState } from "react";
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
import { ArrowLeft } from "lucide-react";

const StaffAllocation = lazy(() => import("./staffAllocation"));

export function RoomStaffLink() {
  const { mutateAsync, isPending } = useStaffLinking();

  // stores
  const selectedRooms = useStaffDataStore((s) => s.selectedRooms);
  const selectedStaff = useStaffDataStore((s) => s.selectedStaff);
  const setSelectedRooms = useStaffDataStore((s) => s.setSelectedRooms);
  const setSelectedStaff = useStaffDataStore((s) => s.setSelectedStaff);
  const toggleRoomSelection = useStaffDataStore((s) => s.toggleRoomSelection);
  const toggleStaffSelection = useStaffDataStore((s) => s.toggleStaffSelection);
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

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successPreview, setSuccessPreview] = useState<GroupedPreview>([]);

  // Derived preview util
  const { buildPreview, totalPairings } = usePreview(
    selRooms,
    selStaff,
    rooms,
    staff,
    floors,
  );

  const preview = buildPreview();
  // Actions
  const openPreview = () => {
    if (!selRooms.length || !selStaff.length) return;
    setShowPreview(true);
  };
  const openConfirm = () => {
    if (!selRooms.length || !selStaff.length) return;
    setShowConfirm(true);
  };

  const onExecute = async () => {
    try {
      await mutateAsync({
        rooms: [{ roomIds: selRooms, staffIds: selStaff }],
        action: "ADD",
      });
      setSuccessPreview(preview);
      setShowConfirm(false);
      setShowPreview(false);
      clearSelections();
    } catch (e) {
      setShowConfirm(false);
    }
  };

  const toggleTool = () => {
    setOpenTool(!openTool);
    setSelectedRooms([]);
    setSelectedStaff([]);
  };

  if (isPending) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-4 md:p-6 mx-auto max-w-7xl">
      {/* Header */}
      {!openTool ? (
        <div className="space-y-2 text-center">
          <StaffAllocation toggleTool={toggleTool} setOpenTool={setOpenTool} />
        </div>
      ) : (
        <>
          {/* Selectors */}
          <Button
            variant="ghost"
            className="flex items-center gap-2 mb-4"
            onClick={toggleTool}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm text-gray-600">Back to Overview</span>
          </Button>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 pb-32 md:pb-20">
            <RoomsSelector
              rooms={rooms}
              floors={floors}
              selectedRooms={selRooms}
              setSelectedRooms={setSelectedRooms}
              toggleRoomSelection={toggleRoomSelection}
              getStaffByRoom={getStaffByRoom}
              roomTypes={roomTypes}
            />
            <StaffSelector
              staff={staff}
              selectedStaff={selStaff}
              setSelectedStaff={setSelectedStaff}
              toggleStaffSelection={toggleStaffSelection}
              getRoomsByStaff={getRoomsByStaff}
            />
          </div>
          {/* Sticky bottom actions */}
          <AdvancedBottomButton
            fixed
            maxWidth="36rem"
            buttons={[
              {
                text: "Preview",
                onClick: openPreview,
                disable: !selRooms.length || !selStaff.length,
                className:
                  "w-full sm:w-auto py-3 px-6 ring-1 ring-blue-200 text-blue-700 bg-white hover:bg-blue-50 shadow-lg",
              },
              {
                text: `Add staff × ${selRooms.length} rooms (${totalPairings})`,
                onClick: openConfirm,
                disable: !selRooms.length || !selStaff.length,
                className:
                  "w-full sm:w-auto py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg",
              },
            ]}
          />
          {/* Dialogs */}
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
