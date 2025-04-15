
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Loader2Icon, CheckIcon, AlertCircleIcon } from "lucide-react"
import toast from "react-hot-toast"
import { storeImageAfterSave } from "../uploadAdmin/imageUpload"
import type { ImageData } from "../hotel/FloorAndRooms/Room/types"
import { useGetBucketByBusinessId, useSaveImagesToBucket } from "@/hooks/useAdminUpload"

interface BusinessUploadProgressProps {
  images: ImageData[]
  setImages: React.Dispatch<React.SetStateAction<ImageData[]>>
  businessId: string
  categoryId: string
  progress: number
  onProgressUpdate: (progress: number) => void
  onComplete: (updatedImages: ImageData[]) => void
  shouldStartUpload: boolean
}

export function BusinessUploadProgress({
  images,
  setImages,
  businessId,
  categoryId,
  progress,
  onProgressUpdate,
  onComplete,
  shouldStartUpload,
}: BusinessUploadProgressProps) {
  const { isSaving,saveImageToBucket } = useSaveImagesToBucket()
  const {getBuckets} = useGetBucketByBusinessId(businessId)
  const isProcessingRef = useRef(false)
  const uploadStartedRef = useRef(false)

  // Use a ref to track if the component is mounted
  const isMountedRef = useRef(true)

  // Start the upload process when shouldStartUpload becomes true
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true

    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, []) // Empty dependency array means this only runs on mount/unmount

  // Separate effect for the upload process
  useEffect(() => {
    // Don't start if already processing or already started
    if (isProcessingRef.current || !shouldStartUpload || uploadStartedRef.current) {
      return
    }

    // Mark as started to prevent duplicate starts
    uploadStartedRef.current = true
    isProcessingRef.current = true

    const uploadImages = async () => {
      if (!categoryId || !businessId || images.length === 0) {
        uploadStartedRef.current = false
        isProcessingRef.current = false
        return
      }

      console.log("Starting upload process for", images.length, "images")

      try {
        // First, upload all images to get URLs
        let completedUploads = 0
        const totalImages = images.length
        let updatedImages = [...images]

        // Update all images with uploading status at once
        if (isMountedRef.current) {
          setImages((prev) => prev.map((img) => ({ ...img, status: "uploading" })))
          updatedImages = updatedImages.map((img) => ({ ...img, status: "uploading" }))
        }

        // Process images sequentially
        for (let i = 0; i < updatedImages.length; i++) {
          const image = updatedImages[i]
          console.log(`Processing image ${i + 1}/${updatedImages.length}: ${image.name}`)

          try {
            // Update current image status
            if (isMountedRef.current) {
              setImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, status: "uploading" } : img)))
            }
            updatedImages = updatedImages.map((img) => (img.id === image.id ? { ...img, status: "uploading" } : img))

            // Log the image and preview for debugging
            console.log(`Uploading image: ${image.name}`, image.file.type, image.file.size)

            // Upload image to server using the preview which should be a data URL
            const imageUrl = await storeImageAfterSave(image.file, image.preview)
            console.log("Received imageUrl:", imageUrl)

            if (!imageUrl) {
              throw new Error("Failed to upload image - no URL returned")
            }

            // Update image with URL and uploaded status
            if (isMountedRef.current) {
              setImages((prev) =>
                prev.map((img) => (img.id === image.id ? { ...img, imageUrl, status: "uploaded" } : img)),
              )
            }
            updatedImages = updatedImages.map((img) =>
              img.id === image.id ? { ...img, imageUrl, status: "uploaded" } : img,
            )

            // Update progress
            completedUploads++
            if (isMountedRef.current) {
              onProgressUpdate(Math.round((completedUploads / totalImages) * 50)) // First 50% is for uploads
            }
          } catch (error) {
            console.error(`Error uploading image ${image.name}:`, error)

            // Mark this image as error
            if (isMountedRef.current) {
              setImages((prev) =>
                prev.map((img) => (img.id === image.id ? { ...img, status: "error", error: "Upload failed" } : img)),
              )
            }
            updatedImages = updatedImages.map((img) =>
              img.id === image.id ? { ...img, status: "error", error: "Upload failed" } : img,
            )
          }
        }

        console.log("All images uploaded, now saving metadata")

        // Now save each uploaded image to the bucket
        let savedCount = 0
        console.log("Saving metadata for images, isMounted:", isMountedRef.current)

        for (let i = 0; i < updatedImages.length; i++) {
          const image = updatedImages[i]

          // Skip images that failed to upload
          if (image.status === "error" || !image.imageUrl) {
            console.log(`Skipping image ${image.name} due to previous error or missing URL`)
            continue
          }

          try {
            // Update status to saving
            if (isMountedRef.current) {
              setImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, status: "saving" } : img)))
            }
            updatedImages = updatedImages.map((img) => (img.id === image.id ? { ...img, status: "saving" } : img))

            console.log(`Saving metadata for image ${image.name}`)
            // Save image metadata to bucket with businessId
            await saveImageToBucket({
              name: image.name,
              description: image.description,
              imageUrl: image.imageUrl,
              categoryBucketId: categoryId,
              businessId: businessId,
            })
            console.log(`Successfully saved metadata for ${image.name}`)

            // Update status to saved
            if (isMountedRef.current) {
              setImages((prev) => prev.map((img) => (img.id === image.id ? { ...img, status: "saved" } : img)))
            }
            updatedImages = updatedImages.map((img) => (img.id === image.id ? { ...img, status: "saved" } : img))

            // Update progress (remaining 50% is for saving)
            savedCount++
            if (isMountedRef.current) {
              onProgressUpdate(50 + Math.round((savedCount / totalImages) * 50))
            }
          } catch (error) {
            console.error(`Error saving image ${image.name}:`, error)

            // Mark this image as error
            if (isMountedRef.current) {
              setImages((prev) =>
                prev.map((img) => (img.id === image.id ? { ...img, status: "error", error: "Save failed" } : img)),
              )
            }
            updatedImages = updatedImages.map((img) =>
              img.id === image.id ? { ...img, status: "error", error: "Save failed" } : img,
            )
          }
        }

        // Complete the process
        if (isMountedRef.current) {
          onProgressUpdate(100)
        }

        // Show success message
        const successCount = updatedImages.filter((img) => img.status === "saved").length
        const errorCount = updatedImages.filter((img) => img.status === "error").length

        if (errorCount === 0 && successCount > 0) {
          toast.success(`Successfully uploaded ${successCount} images!`)
        } else if (successCount > 0) {
          toast.success(`Uploaded ${successCount} images with ${errorCount} errors.`)
        } else {
          toast.error("Failed to upload images. Please try again.")
        }

        console.log("Upload process complete, calling onComplete")
        // Always call onComplete, even if component unmounted
        onComplete(updatedImages)
      
      } catch (error) {
        console.error("Error in upload process:", error)
        toast.error("An unexpected error occurred. Please try again.")

        // Still notify parent of completion even if there was an error
        onComplete(images)
      } finally {
        // Reset processing flags
        getBuckets()
        isProcessingRef.current = false
        uploadStartedRef.current = false
      }
    }

    // Start the upload process
    uploadImages()
  }, [shouldStartUpload, businessId, categoryId, images, setImages, saveImageToBucket, onProgressUpdate, onComplete])

  return (
    <motion.div
      key="uploading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="p-4 bg-white border rounded-lg shadow-sm sm:p-6">
        <div className="mb-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "linear" }}
            className="mx-auto mb-4 w-fit"
          >
            <Loader2Icon className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="text-xl font-semibold">Uploading Images</h2>
          <p className="mt-1 text-gray-500">Please wait while we upload your images...</p>
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {images.map((image) => (
            <div key={image.id} className="flex items-center gap-3 p-3 border rounded-md bg-gray-50">
              <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-md sm:w-12 sm:h-12">
                <img
                  src={image.preview || "/placeholder.svg"}
                  alt={image.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium truncate sm:text-base">{image.name}</p>
                <p className="hidden text-xs text-gray-500 truncate sm:block">
                  {image.description || "No description"}
                </p>
              </div>
              <div className="flex-shrink-0">
                {image.status === "pending" && <div className="text-sm text-gray-400">Pending</div>}
                {image.status === "uploading" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                  >
                    <Loader2Icon className="w-5 h-5 text-blue-500" />
                  </motion.div>
                )}
                {image.status === "uploaded" && (
                  <div className="flex items-center text-sm text-blue-500">
                    <CheckIcon className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Uploaded</span>
                  </div>
                )}
                {image.status === "saving" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                  >
                    <Loader2Icon className="w-5 h-5 text-green-500" />
                  </motion.div>
                )}
                {image.status === "saved" && (
                  <div className="flex items-center text-sm text-green-500">
                    <CheckIcon className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Saved</span>
                  </div>
                )}
                {image.status === "error" && (
                  <div className="flex items-center text-sm text-red-500">
                    <AlertCircleIcon className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Error</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
