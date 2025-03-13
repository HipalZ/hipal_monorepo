import { memo, useState, useCallback } from "react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllAmenitiesOfHotel } from "@/hooks/hotel/useAmenities"
import { useGetAllHotelStaff } from "@/hooks/useHotelStaff"
import { type IHotelRoom, useGetAllHotelRooms } from "@/hooks/hotel/useRoomHook"
import {
  Bed,
  PlusIcon as HousePlus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Building2,
  Users,
  DollarSign,
  ReceiptIndianRupee,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import PopUp from "@/components/atom/popUp"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"
import AddRoom from "./Room/AddRoom"

// Define props for RoomCard component
interface RoomCardProps {
  room: IHotelRoom
  index: number
  hoveredCard: string | null
  setHoveredCard: (id: string | null) => void
  onEditRoom: (roomId: string) => void
  onDeleteRoom: (roomId: string) => void
  onToggleAvailability: (roomId: string, currentStatus: boolean) => void
  floorName: string
}

// Separate RoomCard component for better performance
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  index,
  hoveredCard,
  setHoveredCard,
  onEditRoom,
  onDeleteRoom,
  onToggleAvailability,
  floorName,
}) => {
  // Memoize the color to prevent recalculation
  const roomColor = (() => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-purple-400 to-purple-600",
      "from-amber-400 to-amber-600",
      "from-emerald-400 to-emerald-600",
      "from-rose-400 to-rose-600",
      "from-cyan-400 to-cyan-600",
    ]
    return colors[index % colors.length]
  })()

  // Get room status color
  const getRoomStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800 hover:bg-green-100",
      BOOKED: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      OCCUPIED: "bg-red-100 text-red-800 hover:bg-red-100",
      MAINTENANCE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      CLEANING: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
      RESERVED: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      BLOCKED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 border-2 hover:shadow-lg"
      style={{
        borderColor: hoveredCard === room._id ? "var(--primary)" : "transparent",
        transform: hoveredCard === room._id ? "translateY(-5px)" : "none",
      }}
      onMouseEnter={() => setHoveredCard(room._id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Edit className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditRoom(room._id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Room
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteRoom(room._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div
            className={`p-4 rounded-full bg-gradient-to-br ${roomColor} shadow-lg transform hover:scale-105 transition-transform`}
          >
            <Bed className="w-10 h-10 text-white drop-shadow-md" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Building2 className="h-3.5 w-3.5" />
              {floorName}
            </Badge>

            <Badge variant="secondary" className={getRoomStatusColor(room?.roomStatus)}>
              {room?.roomStatus?.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="grid w-full grid-cols-2 gap-2">
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
              <ReceiptIndianRupee  className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">₹{room?.pricePerNight}/night</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-md bg-muted/30">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {room.capacity} {room.capacity > 1 ? "persons" : "person"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onToggleAvailability(room._id, room.availability)}
        >
          {room.availability ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Disable</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Enable</span>
            </>
          )}
        </Button>

        <Badge variant={room.availability ? "default" : "secondary"} className="px-3 py-1">
          {room.availability ? "Available" : "Unavailable"}
        </Badge>
      </CardFooter>
    </Card>
  )
}

// Memoize the RoomCard component to prevent unnecessary re-renders
const MemoizedRoomCard = memo(RoomCard)

// Empty state component
interface EmptyStateProps {
  onAddRoom: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddRoom }) => (
  <Card className="p-8 mt-8 text-center">
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-gray-600">
        <Bed className="w-10 h-10 text-white drop-shadow-md" />
      </div>
      <h3 className="text-lg font-medium">No Rooms Added Yet</h3>
      <p className="text-sm text-muted-foreground">Add rooms to your hotel to start managing them</p>
      <Button onClick={onAddRoom} className="mt-2">
        <HousePlus className="w-4 h-4 mr-2" />
        Add First Room
      </Button>
    </div>
  </Card>
)

const RoomMain: React.FC = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // Fetch data
  const { staffLoading } = useGetAllHotelStaff(businessId as string)
  // const { roomLoading } = useGetAllHotelRooms(businessId as string)

  // Get data from stores
  const { setOpenAddRoomModal, openAddRoomModal, roomData } = useRoomStore((s) => ({
    setOpenAddRoomModal: s.setOpenAddRoomModal,
    openAddRoomModal: s.openAddRoomModal,
    roomData: s.roomData,
  }))

  const floorData = useFloorStore((state) => state.floorData)
  const staffData = useStaffDataStore((state) => state.staffData)

  // Get room form actions
  const { setEditMode, setEditRoomId, initializeFormForEdit } = useRoomFormStore((state) => ({
    setEditMode: state.setEditMode,
    setEditRoomId: state.setEditRoomId,
    initializeFormForEdit: state.initializeFormForEdit,
  }))

  // Memoize event handlers to prevent unnecessary re-renders
  const handleAddRoom = useCallback(() => {
    // Reset form and open modal
    setEditMode(false)
    setEditRoomId(null)
    setOpenAddRoomModal(true)
  }, [setOpenAddRoomModal, setEditMode, setEditRoomId])

  const handleEditRoom = useCallback(
    (roomId: string) => {
      // Find the room to edit
      const roomToEdit = roomData.find((room) => room._id === roomId)
      if (roomToEdit) {
        // Initialize form with room data
        setEditMode(true)
        setEditRoomId(roomId)
        initializeFormForEdit(roomToEdit, [], staffData)
        setOpenAddRoomModal(true)
      }
    },
    [roomData, staffData, setEditMode, setEditRoomId, initializeFormForEdit, setOpenAddRoomModal],
  )

  const handleDeleteRoom = useCallback((roomId: string) => {
    // Show confirmation dialog and delete room
    console.log("Delete room:", roomId)
  }, [])

  const handleToggleAvailability = useCallback((roomId: string, currentStatus: boolean) => {
    // Toggle room availability
    console.log("Toggle availability for room:", roomId, "New status:", !currentStatus)
  }, [])

  // Get floor name by ID
  const getFloorName = useCallback(
    (floorId: string) => {
      const floor = floorData.find((f) => f._id === floorId)
      return floor ? floor.name : "Unassigned"
    },
    [floorData],
  )

  if ( staffLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Hotel Rooms</h2>
        <Button onClick={handleAddRoom} className="flex items-center gap-2">
          <HousePlus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {roomData && roomData?.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 pb-[10rem]">
          {roomData?.map((room, index) => (
            <MemoizedRoomCard
              key={room._id}
              room={room}
              index={index}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
              onEditRoom={handleEditRoom}
              onDeleteRoom={handleDeleteRoom}
              onToggleAvailability={handleToggleAvailability}
              floorName={getFloorName(room.zoneId)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAddRoom={handleAddRoom} />
      )}

      {/* Room Modal */}
      {
        openAddRoomModal && (
            <PopUp hide width="w-[30rem]" height="h-[100dvh] lg:h-[90dvh]" show={openAddRoomModal} onClose={() => setOpenAddRoomModal(false)}>
                <AddRoom />
            </PopUp>
        )
      }

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "Add Room",
            onClick: handleAddRoom,
            icon: <HousePlus className="w-4 h-4 mr-2" />,
            className: "pl-3 rounded-md w-full",
          },
        ]}
      />
    </div>
  )
}

export default memo(RoomMain)

