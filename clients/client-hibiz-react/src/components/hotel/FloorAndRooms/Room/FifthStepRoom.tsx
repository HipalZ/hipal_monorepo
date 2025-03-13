import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Building2, User, Wifi, ToggleLeft, ToggleRight, DollarSign, Users, Maximize, Image } from "lucide-react"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { useRoomStore } from "@/components/store/hotel/useRoomStore"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"

const FifthStepRoom: React.FC = () => {
  const { roomInfo, selectedAmenities, selectedFloorId, selectedStaffIds, roomImages, isEditMode } = useRoomFormStore(
    (state) => ({
      roomInfo: state.roomInfo,
      selectedAmenities: state.selectedAmenities,
      selectedFloorId: state.selectedFloorId,
      selectedStaffIds: state.selectedStaffIds,
      roomImages: state.roomImages,
      isEditMode: state.isEditMode,
    }),
  )

  // Get data from stores
  const amenitiesData = useRoomStore((state) => state.amenitiesData)
  const floorData = useFloorStore((state) => state.floorData)
  const staffData = useStaffDataStore((state) => state.staffData)

  // Get selected amenities with full data
  const selectedAmenitiesData = amenitiesData.filter((amenity) => selectedAmenities.includes(amenity._id))

  // Get selected floor with full data
  const selectedFloor = floorData.find((floor) => floor._id === selectedFloorId)

  // Get selected staff with full data
  const selectedStaffData = staffData.filter((staff) => selectedStaffIds.includes(staff._id))

  // Get amenity icon based on name (simplified version)
  const getAmenityIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("wifi")) return <Wifi className="w-4 h-4" />
    if (lowerName.includes("coffee") || lowerName.includes("breakfast")) return <Wifi className="w-4 h-4" />
    if (lowerName.includes("tv")) return <Wifi className="w-4 h-4" />
    if (lowerName.includes("restaurant") || lowerName.includes("food")) return <Wifi className="w-4 h-4" />
    if (lowerName.includes("gym") || lowerName.includes("fitness")) return <Wifi className="w-4 h-4" />
    if (lowerName.includes("pool") || lowerName.includes("swimming")) return <Wifi className="w-4 h-4" />
    return null
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
        Please review all information before {isEditMode ? "updating" : "creating"} the room
      </p>

      {/* Room Information */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Bed className="w-4 h-4" />
            <h3>Room Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 pl-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="font-medium">{roomInfo.name}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="text-sm">{roomInfo.description}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Room Type</span>
                <Badge variant="outline" className="mt-1 w-fit">
                  {roomInfo.roomType.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Room Status</span>
                <Badge variant="secondary" className="mt-1 w-fit">
                  {roomInfo.roomStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Price Per Night</span>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="font-medium">₹{roomInfo.pricePerNight}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Capacity</span>
                <div className="flex items-center mt-1">
                  <Users className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="font-medium">
                    {roomInfo.capacity} {roomInfo.capacity > 1 ? "persons" : "person"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-sm text-muted-foreground">Room Size</span>
              <div className="flex items-center mt-1">
                <Maximize className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="font-medium">{roomInfo.size}</span>
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <span className="text-sm text-muted-foreground">Availability</span>
              <div className="flex items-center mt-1">
                {roomInfo.availability ? (
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

      {/* Room Images */}
      {roomImages.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Image className="w-4 h-4" />
                <h3>Room Images</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5">
                {roomImages.length} images
              </Badge>
            </div>

            <div className="pl-6">
              <div className="grid grid-cols-3 gap-2">
                {roomImages.map((url, index) => (
                  <div key={index} className="overflow-hidden border rounded-md aspect-square">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Room image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floor Information */}
      {selectedFloor && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Building2 className="w-4 h-4" />
              <h3>Floor</h3>
            </div>

            <div className="pl-6">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{selectedFloor.name}</span>
                {selectedFloor.tax > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Tax: {selectedFloor.tax}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amenities Information */}
      {selectedAmenitiesData.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Wifi className="w-4 h-4" />
                <h3>Amenities</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5">
                {selectedAmenitiesData.length} selected
              </Badge>
            </div>

            <div className="pl-6">
              <div className="flex flex-wrap gap-2">
                {selectedAmenitiesData.map((amenity) => (
                  <Badge key={amenity._id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {getAmenityIcon(amenity.name)}
                    <span>{amenity.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Information */}
      {selectedStaffData.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-primary">
                <User className="w-4 h-4" />
                <h3>Assigned Staff</h3>
              </div>
              <Badge variant="outline" className="px-2 py-0.5">
                {selectedStaffData.length} selected
              </Badge>
            </div>

            <div className="pl-6">
              <div className="space-y-2">
                {selectedStaffData.map((staff) => (
                  <div key={staff._id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    {staff.customRole && staff.customRole.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {staff.customRole[0].role.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">Click "{isEditMode ? "Update Room" : "Create Room"}" to confirm</p>
      </div>
    </div>
  )
}

export default memo(FifthStepRoom)

