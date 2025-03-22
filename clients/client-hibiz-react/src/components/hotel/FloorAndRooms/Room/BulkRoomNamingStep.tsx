import { Text, Hash, Bed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BulkRoomNamingProps } from "./types"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllRoomTypes } from "@/hooks/hotel/useRoomTypeHook"
import LoadingSpinner from "@/components/atom/loadingSpinner"

const BulkRoomNamingStep = ({
  usePrefix,
  setUsePrefix,
  prefix,
  setPrefix,
  rangeStart,
  setRangeStart,
  rangeEnd,
  setRangeEnd,
  errors,
  previewNames,
  formData,
  handleChange,
}: BulkRoomNamingProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { roomTypesData, roomTypesLoading } = useGetAllRoomTypes(businessId)

  if (roomTypesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4 pb-[10rem]">
      <h2 className="text-xl font-semibold">Room Naming</h2>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="usePrefix">Use Prefix</Label>
          <p className="text-xs text-muted-foreground">Add a prefix to room numbers (e.g., Room101)</p>
        </div>
        <Switch id="usePrefix" checked={usePrefix} onCheckedChange={setUsePrefix} />
      </div>

      {usePrefix && (
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix</Label>
          <div className="flex items-center">
            <Text className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Enter prefix (e.g., Room)"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="range" className={errors.range ? "text-destructive" : ""}>
          Number Range <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              id="rangeStart"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder="Start"
              type="number"
              min="1"
              className={errors.range ? "border-destructive" : ""}
            />
          </div>
          <span className="text-muted-foreground">to</span>
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
            <Input
              id="rangeEnd"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              placeholder="End"
              type="number"
              min="1"
              className={errors.range ? "border-destructive" : ""}
            />
          </div>
        </div>
        {errors.range && <p className="text-sm text-destructive">{errors.range}</p>}
      </div>

      {/* Preview */}
      {previewNames.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Preview</h3>
              <Badge variant="outline">{previewNames.length} rooms</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {previewNames.slice(0, 20).map((name, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
              {previewNames.length > 20 && (
                <Badge variant="outline" className="text-xs">
                  +{previewNames.length - 20} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Type Selection */}
      <div className="space-y-2">
        <Label className={errors.roomTypeId ? "text-destructive" : ""}>
          Room Type <span className="text-destructive">*</span>
        </Label>

        {roomTypesData && roomTypesData.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {roomTypesData.map((roomType) => (
              <Card
                key={roomType._id}
                className={`border cursor-pointer transition-all ${formData.roomTypeId === roomType._id ? "border-primary bg-primary/5" : ""}`}
                onClick={() => handleChange("roomTypeId", roomType._id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Bed className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{roomType.roomType.replace(/_/g, " ")}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            ₹{roomType.pricePerNight}/night
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {roomType.capacity} Person
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-4 h-4 border-2 rounded-full">
                      {formData.roomTypeId === roomType._id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No room types available</p>
          </Card>
        )}

        {errors.roomTypeId && <p className="text-sm text-destructive">{errors.roomTypeId}</p>}
      </div>
    </div>
  )
}

export default BulkRoomNamingStep

