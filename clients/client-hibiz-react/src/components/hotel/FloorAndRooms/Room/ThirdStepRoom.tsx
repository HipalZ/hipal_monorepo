import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Bed } from "lucide-react"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllHotelFloors } from "@/hooks/useFloorHook"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const ThirdStepRoom: React.FC = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const { floorsLoading } = useGetAllHotelFloors(businessId as string)

  const { selectedFloorId, setSelectedFloorId, errors } = useRoomFormStore((state) => ({
    selectedFloorId: state.selectedFloorId,
    setSelectedFloorId: state.setSelectedFloorId,
    errors: state.errors,
  }))

  // Get floor data from store
  const floorData = useFloorStore((state) => state.floorData)

  // Filter only available floors
  const availableFloors = floorData.filter((floor) => floor.availability)

  if (floorsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Floor</h2>
      <p className="text-sm text-muted-foreground">Choose which floor this room belongs to</p>

      {errors.floor && <p className="text-sm text-destructive">{errors.floor}</p>}

      {availableFloors.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Building2 className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-medium">No Available Floors</h3>
            <p className="text-sm text-muted-foreground">Please create a floor first before adding rooms.</p>
          </div>
        </Card>
      ) : (
        <RadioGroup
          value={selectedFloorId}
          onValueChange={setSelectedFloorId}
          className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
        >
          {availableFloors.map((floor) => (
            <div key={floor._id}>
              <Card
                className={`border cursor-pointer transition-all ${selectedFloorId === floor._id ? "border-primary" : ""}`}
                onClick={() => setSelectedFloorId(floor._id)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={floor._id} id={`floor-${floor._id}`} className="pointer-events-none" />
                    <div>
                      <Label htmlFor={`floor-${floor._id}`} className="font-medium cursor-pointer">
                        {floor.name}
                      </Label>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          <Bed className="w-3 h-3" />
                          {floor.roomIds.length} Rooms
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {floor.tax > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Tax: {floor.tax}%
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}

export default memo(ThirdStepRoom)

