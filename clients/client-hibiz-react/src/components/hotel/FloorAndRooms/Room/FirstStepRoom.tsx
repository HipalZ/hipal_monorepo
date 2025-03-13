import { memo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { roomTypeEnum, hotelStatusEnum } from "@/hooks/hotel/useRoomHook"

const FirstStepRoom: React.FC = () => {
    const { roomInfo, errors, setRoomInfo } = useRoomFormStore((state) => ({
        roomInfo: state.roomInfo,
        errors: state.errors,
        setRoomInfo: state.setRoomInfo,
    }))

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Room Information</h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                        Room Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={roomInfo.name}
                        onChange={(e) => setRoomInfo({ name: e.target.value })}
                        placeholder="Enter room name or number (e.g. 101, Deluxe Suite)"
                        className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>
                        Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        value={roomInfo.description}
                        onChange={(e) => setRoomInfo({ description: e.target.value })}
                        placeholder="Enter room description"
                        className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label className={errors.roomType ? "text-destructive" : ""}>
                            Room Type <span className="text-destructive">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {roomTypeEnum.map((type) => (
                                <div
                                    key={type}
                                    className={`
                    p-3 border rounded-lg cursor-pointer transition-all
                    ${roomInfo.roomType === type
                                            ? "border-primary bg-primary/5"
                                            : "border-input hover:border-primary/50"
                                        }
                  `}
                                    onClick={() => setRoomInfo({ roomType: type })}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{type.replace(/_/g, " ")}</span>
                                        {roomInfo.roomType === type && (
                                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.roomType && <p className="text-sm text-destructive">{errors.roomType}</p>}
                    </div>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="pricePerNight" className={errors.pricePerNight ? "text-destructive" : ""}>
                            Price Per Night <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex">
                            <div className="flex items-center justify-center px-3 border border-r-0 bg-muted rounded-l-md">₹</div>
                            <Input
                                id="pricePerNight"
                                type="number"
                                value={roomInfo.pricePerNight}
                                onChange={(e) => setRoomInfo({ pricePerNight: Number(e.target.value) })}
                                placeholder="Enter price"
                                className={`rounded-l-none ${errors.pricePerNight ? "border-destructive" : ""}`}
                            />
                        </div>
                        {errors.pricePerNight && <p className="text-sm text-destructive">{errors.pricePerNight}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity" className={errors.capacity ? "text-destructive" : ""}>
                            Capacity <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={roomInfo.capacity}
                            onChange={(e) => setRoomInfo({ capacity: Number(e.target.value) })}
                            placeholder="Enter capacity"
                            className={errors.capacity ? "border-destructive" : ""}
                            min={1}
                        />
                        {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="size" className={errors.size ? "text-destructive" : ""}>
                        Room Size <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="size"
                        value={roomInfo.size}
                        onChange={(e) => setRoomInfo({ size: e.target.value })}
                        placeholder="Enter room size (e.g. 300 sq ft)"
                        className={errors.size ? "border-destructive" : ""}
                    />
                    {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                        <Label htmlFor="availability">Availability</Label>
                        <p className="text-xs text-muted-foreground">Toggle to set if this room is available for booking</p>
                    </div>
                    <Switch
                        id="availability"
                        checked={roomInfo.availability}
                        onCheckedChange={(checked) => setRoomInfo({ availability: checked })}
                    />
                </div>
            </div>
        </div>
    )
}

export default memo(FirstStepRoom)

