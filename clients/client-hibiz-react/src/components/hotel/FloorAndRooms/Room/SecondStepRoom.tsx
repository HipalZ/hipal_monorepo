import { memo, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { storeImageAfterSave } from "@/components/utils/helper"

const SecondStepRoom: React.FC = () => {
  const { roomImages, addRoomImage, removeRoomImage, isEditMode } = useRoomFormStore((state) => ({
    roomImages: state.roomImages,
    addRoomImage: state.addRoomImage,
    removeRoomImage: state.removeRoomImage,
    isEditMode: state.isEditMode,
  }))

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Handle file selection
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      // Check if adding these files would exceed the limit
      const totalFiles = selectedFiles.length + roomImages.length + files.length
      if (totalFiles > 6) {
        toast.error("You can upload a maximum of 6 images")
        return
      }

      const newFiles: File[] = []
      const newPreviews: string[] = []

      Array.from(files).forEach((file) => {
        // Check file type
        if (!file.type.match("image/(jpeg|jpg|png|webp)")) {
          toast.error(`File type not supported: ${file.type}`)
          return
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File too large: ${file.name}`)
          return
        }

        newFiles.push(file)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === newFiles.length) {
            setSelectedFiles((prev) => [...prev, ...newFiles])
            setPreviews((prev) => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })

      // Reset the input value to allow selecting the same file again
      event.target.value = ""
    },
    [selectedFiles, roomImages.length],
  )

  // Handle file removal from selection
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Handle removing an already uploaded image
  const handleRemoveUploadedImage = useCallback(
    (url: string) => {
      removeRoomImage(url)
    },
    [removeRoomImage],
  )

  // Upload all selected files
  const handleUploadFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const totalFiles = selectedFiles.length
    let uploadedCount = 0

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        const file = selectedFiles[i]
        const preview = previews[i]

        const imageUrl = await storeImageAfterSave(file, preview, (loading) => {
          // This callback is called when the upload starts and finishes
          if (!loading) {
            uploadedCount++
            setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
          }
        })

        if (imageUrl) {
          addRoomImage(imageUrl)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    // Clear selected files after upload
    setSelectedFiles([])
    setPreviews([])
    setIsUploading(false)
    toast.success("Images uploaded successfully")
  }, [selectedFiles, previews, addRoomImage])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Room Images</h2>
      <p className="text-sm text-muted-foreground">
        Upload up to 6 images of the room. Supported formats: JPG, PNG, WEBP
      </p>

      {/* Image upload area */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4">
            <Upload className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="mb-2 text-sm text-center">Drag and drop images here or click to browse</p>
          <p className="mb-4 text-xs text-center text-muted-foreground">Maximum 6 images, 5MB each</p>
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={isUploading || selectedFiles.length + roomImages.length >= 6}
          >
            Select Images
          </Button>
        </CardContent>
      </Card>

      {/* Selected files preview */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Selected Images</h3>
            <Button size="sm" onClick={handleUploadFiles} disabled={isUploading} className="h-8">
              {isUploading ? `Uploading ${uploadProgress}%` : "Upload All"}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="overflow-hidden border rounded-md aspect-square bg-muted">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="absolute p-1 text-white transition-opacity rounded-full opacity-0 top-1 right-1 bg-black/70 group-hover:opacity-100"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already uploaded images */}
      {roomImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Images</h3>
          <div className="grid grid-cols-3 gap-3">
            {roomImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="overflow-hidden border rounded-md aspect-square bg-muted">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Room image ${index}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveUploadedImage(url)}
                  className="absolute p-1 text-white transition-opacity rounded-full opacity-0 top-1 right-1 bg-black/70 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {roomImages.length === 0 && previews.length === 0 && (
        <div className="p-6 text-center rounded-lg bg-muted/30">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <h3 className="text-sm font-medium">No images added yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">Add images to showcase the room to potential guests</p>
        </div>
      )}

      {/* Warning for edit mode */}
      {isEditMode && (
        <div className="flex items-start gap-2 p-3 mt-4 border rounded-md bg-amber-50 border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Editing Room Images</p>
            <p className="text-xs text-amber-700">
              Only new images will be uploaded. Existing images will remain unless removed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(SecondStepRoom)

