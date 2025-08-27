import { createRoot } from "react-dom/client";
import { memo, useCallback, useMemo, useState } from "react";
import { Bed, Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import PopUp from "@/components/atom/popUp";
import { useRoomStore } from "@/components/store/hotel/useRoomStore";
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore";
import NewRoomCreation from "./AddRoom";
import { useFloorStore } from "@/components/store/hotel/useFloorStore";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import RoomTypeSection from "./RoomTypeSection";
import { EmptyState, RoomCard } from "./RoomComponants";
import { toPng } from "html-to-image";
import QRCode from "react-qr-code";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const RoomMain = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFloor, setFilterFloor] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [currentDownloadIndex, setCurrentDownloadIndex] = useState<number>(0);

  // Fetch data

  // Get data from stores
  const {
    setOpenAddRoomModal,
    roomData,
    openAddRoomModal,
    roomType: roomTypesData,
  } = useRoomStore((s) => ({
    setOpenAddRoomModal: s.setOpenAddRoomModal,
    roomData: s.roomData,
    openAddRoomModal: s.openAddRoomModal,
    roomType: s.roomType,
  }));

  const floorData = useFloorStore((state) => state.floorData);
  const staffData = useStaffDataStore((state) => state.staffData);
  console.log("staffData", staffData);

  // Get room form actions
  const { setEditMode, setEditRoomId, initializeFormForEdit } =
    useRoomFormStore((state) => ({
      setEditMode: state.setEditMode,
      setEditRoomId: state.setEditRoomId,
      initializeFormForEdit: state.initializeFormForEdit,
    }));

  // Filter rooms based on search query and filters
  const filteredRoomData = useMemo(() => {
    if (!roomData) return [];

    return roomData.filter((room) => {
      const matchesSearch =
        searchQuery === "" ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === "all" || room.roomTypeId === filterType;

      const matchesStatus =
        filterStatus === "all" || room.roomStatus === filterStatus;

      const matchesFloor = filterFloor === "all" || room.zoneId === filterFloor;

      return matchesSearch && matchesType && matchesStatus && matchesFloor;
    });
  }, [roomData, searchQuery, filterType, filterStatus, filterFloor]);

  // Group rooms by room type
  const roomsByType = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    if (filteredRoomData && roomTypesData) {
      filteredRoomData.forEach((room) => {
        const roomTypeId = room.roomTypeId || "";
        if (!grouped[roomTypeId]) {
          grouped[roomTypeId] = [];
        }
        grouped[roomTypeId].push(room);
      });
    }

    return grouped;
  }, [filteredRoomData, roomTypesData]);

  const handleAddRoom = useCallback(() => {
    setEditMode(false);
    setEditRoomId(null);
    setOpenAddRoomModal(true);
  }, [setOpenAddRoomModal, setEditMode, setEditRoomId]);

  const handleEditRoom = useCallback(
    (roomId: string) => {
      const roomToEdit = roomData.find((room) => room._id === roomId);
      if (roomToEdit) {
        setEditMode(true);
        setEditRoomId(roomId);
        initializeFormForEdit(roomToEdit);
        setOpenAddRoomModal(true);
      }
    },
    [
      roomData,
      setEditMode,
      setEditRoomId,
      initializeFormForEdit,
      setOpenAddRoomModal,
    ],
  );

  const getFloorName = useCallback(
    (floorId: string) => {
      const floor = floorData.find((f) => f._id === floorId);
      return floor ? floor.name : "Unassigned";
    },
    [floorData],
  );

  const getStaffNames = useCallback(
    (staffIds: string[]) => {
      return staffIds
        .map((id) => {
          const staff = staffData.find((s) => s._id === id);
          return staff ? staff.name : null;
        })
        .filter(Boolean) as string[];
    },
    [staffData],
  );

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType("all");
    setFilterStatus("all");
    setFilterFloor("all");
  }, []);

  const totalFilteredRooms = useMemo(() => {
    return Object.values(roomsByType).reduce(
      (total, rooms) => total + rooms.length,
      0,
    );
  }, [roomsByType]);

  const downloadQRCodeImage = async (room: IHotelRoom) => {
    if (!room?.downLoadLink) return;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <div
        style={{
          padding: "20px",
          background: "white",
          border: "1px solid #ccc",
          display: "inline-block",
        }}
      >
        <QRCode value={room.downLoadLink} size={1080} />
        <div
          className="capitalise"
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "80px",
            fontWeight: "bold",
          }}
        >
          {room.name || "Qr"}
        </div>
      </div>,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (container.firstChild) {
        const dataUrl = await toPng(container.firstChild as HTMLElement);
        const link = document.createElement("a");
        link.download = `${room.name}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Failed to generate QR code image:", error);
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  };

  // Download QR codes for all room types
  const downloadAllQRCodes = async (roomData: IHotelRoom[]) => {
    const rooms = roomData.filter((type) => type.downLoadLink);
    setIsDownloading(true);
    setDownloadProgress(0);
    setCurrentDownloadIndex(0);
    for (let i = 0; i < rooms.length; i++) {
      const downloadRoom = rooms[i];
      setCurrentDownloadIndex(i);
      const progress = Math.round(((i + 1) / rooms.length) * 100);
      setDownloadProgress(progress);
      await downloadQRCodeImage(downloadRoom);
    }
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadProgress(0);
      setCurrentDownloadIndex(0);
    }, 500);
  };

  const downloadSingleQRCode = async (
    e: React.MouseEvent<HTMLButtonElement>,
    roomId: string,
  ) => {
    const room = roomData.find((room) => room._id === roomId);
    if (room) {
      e.stopPropagation();
      await downloadQRCodeImage(room);
    }
  };

  return (
    <div className="px-4 py-8 mx-auto pb-[10rem]">
      <div className="flex flex-col mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Rooms</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {(filterType !== "all" ||
                filterStatus !== "all" ||
                filterFloor !== "all") && (
                <Badge className="flex items-center justify-center w-5 h-5 p-0 ml-1">
                  {(filterType !== "all" ? 1 : 0) +
                    (filterStatus !== "all" ? 1 : 0) +
                    (filterFloor !== "all" ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rooms by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute p-0 transform -translate-y-1/2 right-2 top-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              ×
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg md:grid-cols-3 bg-muted/20">
            <div className="space-y-1">
              <label className="text-sm font-medium">Room Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypesData?.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.roomType.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="BOOKED">Booked</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="CLEANING">Cleaning</SelectItem>
                  <SelectItem value="RESERVED">Reserved</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Floor</label>
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {floorData.map((floor) => (
                    <SelectItem key={floor._id} value={floor._id}>
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end md:col-span-3">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results count */}
        {(searchQuery ||
          filterType !== "all" ||
          filterStatus !== "all" ||
          filterFloor !== "all") && (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-2 py-1">
              {totalFilteredRooms} {totalFilteredRooms === 1 ? "room" : "rooms"}{" "}
              found
            </Badge>
            {totalFilteredRooms === 0 && (
              <Button variant="link" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {roomData &&
        roomData.length > 0 &&
        roomData.some((type) => type?.downLoadLink) && (
          <div className="flex justify-end mt-4 mb-4">
            <Button
              variant="outline"
              onClick={() => downloadAllQRCodes(roomData)}
              className="flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              All QR Codes
            </Button>
          </div>
        )}

      {isDownloading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h3 className="mb-4 text-xl font-semibold">Downloading QR Codes</h3>
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full transition-all duration-300 bg-purple-600 rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm text-right text-gray-600">
                {downloadProgress}%
              </p>
            </div>
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <p className="ml-3 text-gray-600">
                {downloadProgress < 100
                  ? `Downloading QR code ${currentDownloadIndex + 1}...`
                  : "Download complete!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {roomData && roomData.length > 0 ? (
        totalFilteredRooms > 0 ? (
          <div>
            {roomTypesData?.map((roomType) => (
              <RoomTypeSection
                key={roomType._id}
                roomType={roomType}
                rooms={roomsByType[roomType._id] || []}
                onEditRoom={handleEditRoom}
                getFloorName={getFloorName}
                getStaffNames={getStaffNames}
                downloadSingleQRCode={downloadSingleQRCode}
              />
            ))}

            {/* Rooms without a room type */}
            {roomsByType[""] && roomsByType[""].length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Bed className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Other Rooms</h2>
                  <Badge variant="outline" className="ml-2">
                    {roomsByType[""].length}{" "}
                    {roomsByType[""].length === 1 ? "Room" : "Rooms"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {roomsByType[""].map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      onEdit={handleEditRoom}
                      floorName={getFloorName(room.zoneId)}
                      staffNames={getStaffNames(room.staffIds || [])}
                      downloadSingleQRCode={downloadSingleQRCode}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <div className="p-4 mx-auto rounded-full bg-muted w-fit">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              No rooms match your search
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters to find what you're looking
              for
            </p>
            <Button variant="outline" className="mt-4" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        )
      ) : (
        <EmptyState onAddRoom={handleAddRoom} />
      )}

      <PopUp
        width="w-[30rem]"
        rightTopBack
        hide
        height="h-[100dvh] lg:h-[80dvh]"
        show={openAddRoomModal}
        onClose={() => setOpenAddRoomModal(false)}
      >
        <NewRoomCreation onClose={() => setOpenAddRoomModal(false)} />
      </PopUp>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Add Room",
            onClick: handleAddRoom,
            icon: <Plus className="w-4 h-4 mr-2" />,
            className: "pl-3 rounded-md w-full",
          },
        ]}
      />
    </div>
  );
};

export default memo(RoomMain);
