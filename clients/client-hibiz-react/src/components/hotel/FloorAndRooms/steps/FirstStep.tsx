import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import useFloorFormStore from "@/components/store/hotel/useFloorStore"

const FirstStep: React.FC = () => {
  const { floorInfo, errors, setFloorInfo } = useFloorFormStore((state) => ({
    floorInfo: state.floorInfo,
    errors: state.errors,
    setFloorInfo: state.setFloorInfo,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Floor Information</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
            Floor Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={floorInfo.name}
            onChange={(e) => setFloorInfo({ name: e.target.value })}
            placeholder="Enter floor name (e.g. 1st Floor, Ground Floor)"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax" className={errors.tax ? "text-destructive" : ""}>
            Tax Percentage
          </Label>
          <Input
            id="tax"
            type="number"
            value={floorInfo.tax}
            max={100}
            min={0}
            onChange={(e) => setFloorInfo({ tax: Number(e.target.value) })}
            placeholder="Enter tax percentage"
            className={errors.tax ? "border-destructive" : ""}
          />
          {errors.tax && <p className="text-sm text-destructive">{errors.tax}</p>}
          <p className="text-xs text-muted-foreground">
            Tax percentage applied to rooms on this floor. Leave at 0 if not applicable.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="availability">Availability</Label>
            <p className="text-xs text-muted-foreground">Toggle to set if this floor is available for booking</p>
          </div>
          <Switch
            id="availability"
            checked={floorInfo.availability}
            onCheckedChange={(checked) => setFloorInfo({ availability: checked })}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(FirstStep)

