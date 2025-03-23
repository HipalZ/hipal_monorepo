import { memo } from "react"
import { Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFloorStore } from "@/components/store/hotel/useFloorStore"
import type { StepProps } from "./types"

const FloorSelectionStep = ({ formData, errors, handleChange }: StepProps) => {
  const floorData = useFloorStore((state) => state.floorData)
  const availableFloors = floorData.filter((floor) => floor.availability)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select Floor</h2>
      <p className="text-sm text-muted-foreground">Choose which floor this room belongs to</p>

      {errors.zoneId && <p className="text-sm text-destructive">{errors.zoneId}</p>}

      {availableFloors.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-medium">No Available Floors</h3>
            <p className="text-sm text-muted-foreground">Please create a floor first before adding rooms.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {availableFloors.map((floor) => (
            <Card
              key={floor._id}
              className={`border cursor-pointer transition-all ${formData.zoneId === floor._id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => handleChange("zoneId", floor._id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{floor.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {floor.roomIds.length} Rooms
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center">
                    {formData.zoneId === floor._id && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(FloorSelectionStep)

