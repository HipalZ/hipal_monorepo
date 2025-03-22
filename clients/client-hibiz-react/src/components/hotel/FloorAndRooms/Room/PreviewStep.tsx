import { memo, useMemo } from "react"
import { Bed, Building2, Users, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useGetAllRoomTypes } from "@/hooks/hotel/useRoomTypeHook"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import useBusinessData from "@/components/store/useBusinessData"
import type { StepProps } from "./types"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"

const PreviewStep = ({ formData }: StepProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { roomTypesData } = useGetAllRoomTypes(businessId)
  const floorData = useFloorStore((state) => state.floorData)
  const staffData = useStaffDataStore((state) => state.staffData)

  // Get selected room type details
  const selectedRoomType = useMemo(() => {
    return roomTypesData?.find((rt) => rt._id === formData.roomTypeId)
  }, [roomTypesData, formData.roomTypeId])

  // Get selected staff details
  const selectedStaff = useMemo(() => {
    return staffData.filter((staff) => formData.staffIds.includes(staff._id))
  }, [staffData, formData.staffIds])

  // Get selected floor details
  const selectedFloor = useMemo(() => {
    return floorData.find((floor) => floor._id === formData.zoneId)
  }, [floorData, formData.zoneId])

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Review Information</h2>
      <p className="text-sm text-muted-foreground">Please review all information before creating the room</p>

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
              <span className="font-medium">{formData.name}</span>
            </div>

            {selectedRoomType && (
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Room Type</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedRoomType.roomType.replace(/_/g, " ")}</span>
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
              {formData.staffIds.length} selected
            </Badge>
          </div>

          <div className="pl-6">
            {formData.staffIds.length > 0 ? (
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
        <p className="text-sm text-muted-foreground">Click "Create Room" to confirm</p>
      </div>
    </div>
  )
}

export default memo(PreviewStep)

