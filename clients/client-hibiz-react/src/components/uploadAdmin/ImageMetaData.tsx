
import { motion } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SaveIcon, Trash2Icon, GripVerticalIcon } from "lucide-react"
import type { ImageData } from "../hotel/FloorAndRooms/Room/types"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton"

interface ImageMetadataFormProps {
  images: ImageData[]
  onUpdateMetadata: (id: string, field: "name" | "description", value: string) => void
  onRemoveImage: (id: string) => void
  onReorderImages: (reorderedImages: ImageData[]) => void
  onBack: () => void
  onStartUpload: () => void
}

// Sortable item component
function SortableImageItem({
  image,
  onUpdateMetadata,
  onRemoveImage,
}: {
  image: ImageData
  onUpdateMetadata: (id: string, field: "name" | "description", value: string) => void
  onRemoveImage: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border p-3 shadow-sm ${isDragging ? "border-green-400 bg-green-50" : ""}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-col w-full sm:w-1/3 md:w-1/4">
          <div className="overflow-hidden bg-gray-100 rounded-md aspect-square max-w-[120px] mx-auto sm:mx-0">
            <img src={image.preview || "/placeholder.svg"} alt={image.name} className="object-cover w-full h-full" />
          </div>
          <div
            className="flex items-center justify-center p-2 mt-2 rounded-md cursor-grab active:cursor-grabbing bg-gray-50 hover:bg-gray-100 max-w-[120px] mx-auto sm:mx-0"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="w-4 h-4 text-gray-400" />
            <span className="ml-2 text-xs text-gray-500">Drag to reorder</span>
          </div>
        </div>
        <div className="w-full mt-3 space-y-3 sm:w-2/3 md:w-3/4 sm:mt-0">
          <div>
            <Label htmlFor={`name-${image.id}`} className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`name-${image.id}`}
              value={image.name}
              onChange={(e) => onUpdateMetadata(image.id, "name", e.target.value)}
              placeholder="Enter image name"
              className="mt-1 border-green-200 focus-visible:ring-green-500"
              required
            />
            {image.name.trim() === "" && <p className="mt-1 text-xs text-red-500">Name is required</p>}
          </div>
          <div>
            <Label htmlFor={`description-${image.id}`} className="text-sm font-medium">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <Textarea
              id={`description-${image.id}`}
              value={image.description}
              onChange={(e) => onUpdateMetadata(image.id, "description", e.target.value)}
              placeholder="Enter image description"
              className="mt-1 border-green-200 focus-visible:ring-green-500"
              rows={2}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveImage(image.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2Icon className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ImageMetadataForm({
  images,
  onUpdateMetadata,
  onRemoveImage,
  onReorderImages,
  onBack,
  onStartUpload,
}: ImageMetadataFormProps) {
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)

      const reorderedImages = arrayMove(images, oldIndex, newIndex)
      onReorderImages(reorderedImages)
    }
  }

  // Check if all images have names
  const allImagesHaveNames = images.every((img) => img.name.trim() !== "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pb-20 space-y-8"
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {images.map((image) => (
              <SortableImageItem
                key={image.id}
                image={image}
                onUpdateMetadata={onUpdateMetadata}
                onRemoveImage={onRemoveImage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

    <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
            {
                text: "",
                isBackButton: true,
                onClick: onBack,
                className: "pl-3 rounded-md",
            },
            {
                text: "Save & Upload",
                isBackButton: false,
                icon: <SaveIcon className="w-4 h-4 mr-2" />,
                onClick: onStartUpload,
                disable: !allImagesHaveNames || images.length === 0,
                className: "rounded-md",
            },
        ]}
    />
    </motion.div>
  )
}
