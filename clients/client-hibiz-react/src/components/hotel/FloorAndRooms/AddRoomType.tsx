import { useState, useCallback } from "react"
import { Bed, Edit, ImageIcon, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import useBusinessData from "@/components/store/useBusinessData"
import useRoomTypeStore, { type RoomTypeEnum } from "@/components/store/hotel/useRoomTypeStore"
import { toast } from "react-hot-toast"
import ImageUploader from "./ImageUploader"
import { useCreateRoomType, useUpdateRoomType } from "@/hooks/hotel/useRoomTypeHook"

interface AddRoomTypeProps {
  onClose?: () => void
}

const roomTypeOptions: { value: RoomTypeEnum; label: string }[] = [
  { value: "SINGLE", label: "Single Room" },
  { value: "DOUBLE", label: "Double Room" },
  { value: "TRIPLE", label: "Triple Room" },
  { value: "QUAD", label: "Quad Room" },
  { value: "SUITE", label: "Suite" },
  { value: "DELUXE", label: "Deluxe Room" },
]

const AddRoomType = ({ onClose }: AddRoomTypeProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const { createRoomType, createRoomTypeLoading } = useCreateRoomType()
  const { updateRoomType, updateRoomTypeLoading } = useUpdateRoomType()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    isEditMode,
    editRoomTypeId,
    roomTypeInfo,
    roomTypeImages,
    errors,
    setRoomTypeInfo,
    addRoomTypeImage,
    removeRoomTypeImage,
    resetForm,
    validateForm,
  } = useRoomTypeStore()

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      const payload = {
        businessId,
        roomType: roomTypeInfo.roomType,
        description: roomTypeInfo.description,
        pricePerNight: roomTypeInfo.pricePerNight,
        size: roomTypeInfo.size,
        capacity: roomTypeInfo.capacity,
        images: roomTypeImages,
      }

      if (isEditMode && editRoomTypeId) {
        await updateRoomType({
          ...payload,
          roomTypeId: editRoomTypeId,
        })
      } else {
        await createRoomType(payload)
      }

      onClose?.()
      resetForm()
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} room type:`, error)
      toast.error(`Failed to ${isEditMode ? "update" : "create"} room type`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    businessId,
    roomTypeInfo,
    roomTypeImages,
    isEditMode,
    editRoomTypeId,
    validateForm,
    updateRoomType,
    createRoomType,
    onClose,
    resetForm,
  ])

  const isLoading = isSubmitting || createRoomTypeLoading || updateRoomTypeLoading

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Room Type" : "Add Room Type"}</h1>
        <div className="flex items-center space-x-1">
          {isEditMode ? <Edit className="w-5 h-5 text-primary" /> : <Bed className="w-5 h-5 text-primary" />}
        </div>
      </div>

      <div className="mb-6 h-[80dvh] overflow-auto pb-[7rem] hide-scrollbar">
        <div className="space-y-6">
          {/* Room Type Selection */}
          <div className="space-y-2">
            <Label className={errors.roomType ? "text-destructive" : ""}>
              Room Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={roomTypeInfo.roomType}
              onValueChange={(value) => setRoomTypeInfo({ roomType: value as RoomTypeEnum })}
              className="grid grid-cols-2 gap-2"
            >
              {roomTypeOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`type-${option.value}`} className="sr-only peer" />
                  <Label
                    htmlFor={`type-${option.value}`}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Bed className="w-6 h-6 mb-2" />
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.roomType && <p className="text-sm text-destructive">{errors.roomType}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              value={roomTypeInfo.description}
              onChange={(e) => setRoomTypeInfo({ description: e.target.value })}
              placeholder="Enter room type description"
              className="min-h-[100px]"
            />
          </div>

          {/* Price Per Night */}
          <div className="space-y-2">
            <Label htmlFor="pricePerNight" className={errors.pricePerNight ? "text-destructive" : ""}>
              Price Per Night <span className="text-destructive">*</span>
            </Label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 border border-r-0 bg-muted rounded-l-md">₹</div>
              <Input
                id="pricePerNight"
                type="number"
                value={roomTypeInfo.pricePerNight}
                onChange={(e) => setRoomTypeInfo({ pricePerNight: Number(e.target.value) })}
                placeholder="Enter price"
                className={`rounded-l-none ${errors.pricePerNight ? "border-destructive" : ""}`}
              />
            </div>
            {errors.pricePerNight && <p className="text-sm text-destructive">{errors.pricePerNight}</p>}
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label htmlFor="size" className={errors.size ? "text-destructive" : ""}>
              Room Size <span className="text-destructive">*</span>
            </Label>
            <Input
              id="size"
              value={roomTypeInfo.size}
              onChange={(e) => setRoomTypeInfo({ size: e.target.value })}
              placeholder="Enter room size (e.g. 300 sq ft)"
              className={errors.size ? "border-destructive" : ""}
            />
            {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className={errors.capacity ? "text-destructive" : ""}>
              Capacity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              value={roomTypeInfo.capacity}
              onChange={(e) => setRoomTypeInfo({ capacity: Number(e.target.value) })}
              placeholder="Enter capacity"
              className={errors.capacity ? "border-destructive" : ""}
              min={1}
            />
            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
          </div>

          <Separator />

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Room Images</Label>
              <Badge variant="outline">{roomTypeImages.length}/20 Images</Badge>
            </div>

            <ImageUploader
              images={roomTypeImages}
              onAddImage={addRoomTypeImage}
              onRemoveImage={removeRoomTypeImage}
              maxImages={20}
            />

            {roomTypeImages.length === 0 && (
              <Card className="p-4 text-center bg-muted/30">
                <div className="flex flex-col items-center justify-center py-4">
                  <ImageIcon className="w-10 h-10 mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">No images added yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add images to showcase the room type to potential guests
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: "",
            onClick: onClose,
            isBackButton: true,
            className: "pl-3 rounded-md",
          },
          {
            text: isLoading ? "Saving..." : isEditMode ? "Update Room Type" : "Create Room Type",
            onClick: handleSubmit,
            icon: isEditMode ? <Edit className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />,
            className: "rounded-md",
            highlight: true,
            disable: isLoading,
          },
        ]}
      />
    </div>
  )
}

export default AddRoomType

