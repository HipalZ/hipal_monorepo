import { useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { ImageSelector } from "./ImageSelector"
import { UploadProgress } from "./UploadProgress"
import { UploadSummary } from "./UploadSummary"
import type { ImageData } from "../hotel/FloorAndRooms/Room/types"
import { ImageMetadataForm } from "./ImageMetaData"

const ImageUploaderContainer = () => {
  const { catId:categoryId } = useParams<{ catId: string }>()
  const navigate = useNavigate()
  const [images, setImages] = useState<ImageData[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<"select" | "metadata" | "uploading" | "complete">("select")
  const [shouldStartUpload, setShouldStartUpload] = useState(false)

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === "metadata") {
      setCurrentStep("select")
    } else if (currentStep === "select") {
      navigate(-1)
    } else if (currentStep === "complete") {
      navigate(-1)
    }
  }

  // Handle image removal
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id)
      // If no images left, go back to select step
      if (filtered.length === 0 && currentStep === "metadata") {
        setCurrentStep("select")
      }
      return filtered
    })
  }

  // Handle image reordering
  const handleReorderImages = (reorderedImages: ImageData[]) => {
    setImages(reorderedImages)
  }

  // Handle metadata update
  const handleUpdateMetadata = (id: string, field: "name" | "description", value: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)))
  }

  // Handle adding new images
  const handleAddImages = (newImages: ImageData[]) => {
    setImages((prev) => [...prev, ...newImages])
    if (currentStep === "select" && newImages.length > 0) {
      setCurrentStep("metadata")
    }
  }

  // Handle proceeding to metadata step
  const handleProceedToMetadata = () => {
    if (images.length > 0) {
      setCurrentStep("metadata")
    }
  }

  // Handle starting upload
  const handleStartUpload = () => {
    if (images.length > 0 && images.every((img) => img.name.trim() !== "")) {
      setCurrentStep("uploading")
      setUploadProgress(0)
      setShouldStartUpload(true) // Trigger the upload process
    }
  }

  // Handle upload completion - use useCallback to prevent recreation
  const handleUploadComplete = useCallback((updatedImages: ImageData[]) => {
    console.log("Upload complete callback received with", updatedImages.length, "images")
    setImages(updatedImages)
    setShouldStartUpload(false) // Reset the trigger
    setCurrentStep("complete")
  }, [])

  // Handle progress update - use useCallback to prevent recreation
  const handleProgressUpdate = useCallback((progress: number) => {
    setUploadProgress(progress)
  }, [])

  // Handle reset for new upload
  const handleReset = () => {
    setImages([])
    setCurrentStep("select")
    setUploadProgress(0)
    setShouldStartUpload(false)
  }

  // Handle retry for failed images
  const handleRetryFailed = () => {
    setImages((prev) => prev.filter((img) => img.status === "error").map((img) => ({ ...img, status: "pending" })))
    setCurrentStep("metadata")
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon" onClick={handleBack} className="rounded-full">
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
        </motion.div>
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-2xl font-bold md:text-3xl">
            {currentStep === "select" && "Select Images"}
            {currentStep === "metadata" && "Image Details"}
            {currentStep === "uploading" && "Uploading Images"}
            {currentStep === "complete" && "Upload Complete"}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === "select" && "Choose up to 20 images to upload (PNG, JPEG, JPG, GIF, WEBP)"}
            {currentStep === "metadata" && `Enter details for ${images.length} image${images.length !== 1 ? "s" : ""}`}
            {currentStep === "uploading" && `Uploading ${images.length} image${images.length !== 1 ? "s" : ""}...`}
            {currentStep === "complete" &&
              `${images.filter((img) => img.status === "saved").length} image${
                images.filter((img) => img.status === "saved").length !== 1 ? "s" : ""
              } uploaded successfully${
                images.filter((img) => img.status === "error").length > 0
                  ? `, ${images.filter((img) => img.status === "error").length} failed`
                  : ""
              }`}
          </p>
        </motion.div>
      </div>

      {/* Content based on current step */}
      {currentStep === "select" && (
        <ImageSelector
          images={images}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onProceedToMetadata={handleProceedToMetadata}
        />
      )}

      {currentStep === "metadata" && (
        <ImageMetadataForm
          images={images}
          onUpdateMetadata={handleUpdateMetadata}
          onRemoveImage={handleRemoveImage}
          onReorderImages={handleReorderImages}
          onBack={() => setCurrentStep("select")}
          onStartUpload={handleStartUpload}
        />
      )}

      {currentStep === "uploading" && (
        <UploadProgress
          images={images}
          setImages={setImages}
          categoryId={categoryId || ""}
          progress={uploadProgress}
          onProgressUpdate={handleProgressUpdate}
          onComplete={handleUploadComplete}
          shouldStartUpload={shouldStartUpload}
        />
      )}

      {currentStep === "complete" && (
        <UploadSummary
          images={images}
          onReturnToGallery={() => navigate(-1)}
          onRetryFailed={handleRetryFailed}
          onUploadMore={handleReset}
        />
      )}
    </motion.div>
  )
}

export default ImageUploaderContainer
