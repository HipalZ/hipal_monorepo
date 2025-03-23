import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Bed, DoorClosed } from "lucide-react"
import useBusinessData from "@/components/store/useBusinessData"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useGetAllHotelRooms } from "@/hooks/hotel/useRoomHook"
import useFloorFormStore from "@/components/store/hotel/useFloorStore"

const SecondStep: React.FC = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const { isLoading,  hotelRoomsData } = useGetAllHotelRooms(businessId as string)

  const { selectedRooms, toggleRoom } = useFloorFormStore((state) => ({
    selectedRooms: state.selectedRooms,
    toggleRoom: state.toggleRoom,
  }))

  // Check if a room is selected
  const isRoomSelected = (roomId: string) => {
    return selectedRooms.some((room) => room._id === roomId)
  }

  // Get room status color
  const getRoomStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800 hover:bg-green-100",
      OCCUPIED: "bg-red-100 text-red-800 hover:bg-red-100",
      MAINTENANCE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      CLEANING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  // Get room type label
  const getRoomTypeLabel = (type: string) => {
    return type?.replace(/_/g, " ") || ""
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Assign Rooms</h2>
      <p className="text-sm text-muted-foreground">Select the rooms that belong to this floor</p>

      {!hotelRoomsData || hotelRoomsData?.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <DoorClosed className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-medium">No Available Rooms</h3>
            <p className="text-sm text-muted-foreground">
              All rooms are already assigned to floors or no rooms have been created yet.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {hotelRoomsData?.map((room) => (
              <Card
                key={room._id}
                className={`border transition-all hover:shadow-md ${isRoomSelected(room._id) ? "border-primary bg-primary/5" : ""}`}
                onClick={() => toggleRoom(room)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={room._id}
                      checked={isRoomSelected(room._id)}
                      onCheckedChange={() => toggleRoom(room)}
                      className="pointer-events-none"
                    />
                    <div>
                      <Label htmlFor={room._id} className="flex items-center cursor-pointer">
                        <span className="font-medium">{room.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {getRoomTypeLabel(room.roomType)}
                        </Badge>
                      </Label>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="secondary" className={`text-xs ${getRoomStatusColor(room.roomStatus)}`}>
                          {room.roomStatus}
                        </Badge>
                        {room.capacity > 0 && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Bed className="w-3 h-3 mr-1" />
                            {room.capacity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {room.pricePerNight > 0 && <div className="text-sm font-medium">₹{room.pricePerNight}/night</div>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium">Selected rooms: {selectedRooms.length}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(SecondStep)

