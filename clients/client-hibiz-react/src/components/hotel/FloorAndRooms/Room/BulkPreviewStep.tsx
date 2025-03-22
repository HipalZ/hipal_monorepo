import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Building2, Users, Check } from "lucide-react"
import { useGetAllRoomTypes } from "@/hooks/hotel/useRoomTypeHook"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import useBusinessData from "@/components/store/useBusinessData"
import { Separator } from "@/components/ui/separator"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"

interface BulkPreviewStepProps {
  previewNames: string[]
  selectedRoomTypeId: string
  selectedFloorId: string
  selectedStaffIds: string[]
}

const BulkPreviewStep = ({
  previewNames,
  selectedRoomTypeId,
  selectedFloorId,
  selectedStaffIds,
}: BulkPreviewStepProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { roomTypesData } = useGetAllRoomTypes(businessId)
  const floorData = useFloorStore((state) => state.floorData)
  const staffData = useStaffDataStore((state) => state.staffData)

  // Get selected room type
  const selectedRoomType = roomTypesData?.find((rt) => rt._id === selectedRoomTypeId)

  // Get selected floor
  const selectedFloor = floorData.find((floor) => floor._id === selectedFloorId)

  // Get selected staff
  const selectedStaff = staffData.filter((staff) => selectedStaffIds.includes(staff._id))

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Review Information</h2>
      <p className="text-sm text-muted-foreground">Please review all information before creating the rooms</p>

      {/* Room Information */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Bed className="w-4 h-4" />
            <h3>Room Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 pl-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Rooms:</span>
              <Badge>{previewNames.length || 0}</Badge>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Room Names:</span>
              <div className="flex flex-wrap gap-1.5 mt-1 max-h-24 overflow-y-auto">
                {previewNames.slice(0, 10).map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
                {previewNames.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{previewNames.length - 10} more
                  </Badge>
                )}
              </div>
            </div>

            {selectedRoomType && (
              <div className="flex flex-col mt-2">
                <span className="text-sm text-muted-foreground">Room Type:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{selectedRoomType.roomType.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline" className="text-xs">
                    ₹{selectedRoomType.pricePerNight}/night
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Floor Information */}
      {selectedFloor && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Building2 className="w-4 h-4" />
              <h3>Floor</h3>
            </div>

            <div className="pl-6">
              <span className="font-medium">{selectedFloor.name}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Information */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Users className="w-4 h-4" />
              <h3>Assigned Staff</h3>
            </div>
            <Badge variant="outline" className="px-2 py-0.5">
              {selectedStaffIds.length} selected
            </Badge>
          </div>

          <div className="pl-6">
            {selectedStaff.length > 0 ? (
              <div className="space-y-2">
                {selectedStaff.map((staff) => (
                  <div key={staff._id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    <span>{staff.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No staff members assigned</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">Click "Create Rooms" to confirm</p>
      </div>
    </div>
  )
}

export default BulkPreviewStep

