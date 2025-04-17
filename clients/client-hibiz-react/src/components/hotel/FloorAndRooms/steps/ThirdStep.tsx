import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Bed, Check, ToggleLeft, ToggleRight, Percent } from "lucide-react"
import useFloorFormStore from "@/components/store/hotel/useFloorStore"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"

const ThirdStep: React.FC = () => {
  const { floorInfo, selectedRooms, isEditMode } = useFloorFormStore((state) => ({
    floorInfo: state.floorInfo,
    selectedRooms: state.selectedRooms,
    isEditMode: state.isEditMode,
  }))
  const roomType = useRoomStore(s=>s.roomType)

  const getRoomTypeById = (roomTypeId: string) => {
    const type = roomType.find((type) => type._id === roomTypeId)
    console.log("type", type?.roomType)
    return type?.roomType ? type?.roomType : "Unknown"
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Review Information</h2>
        <Badge variant="outline" className="px-2 py-1">
          {isEditMode ? "Edit Mode" : "Preview"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Please review all information before {isEditMode ? "updating" : "creating"} the floor
      </p>

      {/* Floor Information */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Building2 className="w-4 h-4" />
            <h3>Floor Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 pl-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{floorInfo.name}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Tax</span>
              <div className="flex items-center">
                <Percent className="w-3 h-3 mr-1 text-muted-foreground" />
                <span className="font-medium">{floorInfo.tax}%</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Availability</span>
              <div className="flex items-center">
                {floorInfo.availability ? (
                  <div className="flex items-center text-green-600">
                    <ToggleRight className="w-4 h-4 mr-1" />
                    <span>Available</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <ToggleLeft className="w-4 h-4 mr-1" />
                    <span>Unavailable</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Information */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Bed className="w-4 h-4" />
              <h3>Rooms</h3>
            </div>
            <Badge variant="outline" className="px-2 py-0.5">
              {selectedRooms.length} selected
            </Badge>
          </div>

          <div className="pl-6">
            {selectedRooms.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {selectedRooms.map((room) => (
                  <div key={room._id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{room.name}</span>
                      <Badge variant="outline" className="text-xs">
                      {getRoomTypeById(room?.roomTypeId || "")?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    {room.pricePerNight > 0 && <span className="text-sm">₹{room.pricePerNight}/night</span>}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No rooms selected</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Click "{isEditMode ? "Update Floor" : "Create Floor"}" to confirm
        </p>
      </div>
    </div>
  )
}

export default memo(ThirdStep)

