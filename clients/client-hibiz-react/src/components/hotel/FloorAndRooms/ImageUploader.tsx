import * as React from "react"
import { useState, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { storeImageAfterSave } from "@/components/utils/helper"

interface ImageUploaderProps {
  images: string[]
  onAddImage: (imageUrl: string) => void
  onRemoveImage: (imageUrl: string) => void
  maxImages?: number
}

const ImageUploader = ({ images, onAddImage, onRemoveImage, maxImages = 6 }: ImageUploaderProps) => {
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
      const totalFiles = selectedFiles.length + images.length + files.length
      if (totalFiles > maxImages) {
        toast.error(`You can upload a maximum of ${maxImages} images`)
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
    [selectedFiles, images.length, maxImages],
  )

  // Handle file removal from selection
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

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
          onAddImage(imageUrl)
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
  }, [selectedFiles, previews, onAddImage])

  return (
    <div className="space-y-4">
      {/* Image upload area */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="mb-4">
            <Upload className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="mb-2 text-sm text-center">Drag and drop images here or click to browse</p>
          <p className="mb-4 text-xs text-center text-muted-foreground">Maximum {maxImages} images, 5MB each</p>
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
            disabled={isUploading || selectedFiles.length + images.length >= maxImages}
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
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Uploading {uploadProgress}%</span>
                </div>
              ) : (
                "Upload All"
              )}
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
      {images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Images</h3>
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, index) => (
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
                  onClick={() => onRemoveImage(url)}
                  className="absolute p-1 text-white transition-opacity rounded-full opacity-0 top-1 right-1 bg-black/70 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader

