import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckIcon, AlertCircleIcon } from "lucide-react"
import type { ImageData } from "../hotel/FloorAndRooms/Room/types"

interface UploadSummaryProps {
  images: ImageData[]
  onReturnToGallery: () => void
  onRetryFailed: () => void
  onUploadMore: () => void
}

export function UploadSummary({ images, onReturnToGallery, onRetryFailed, onUploadMore }: UploadSummaryProps) {
  const savedCount = images.filter((img) => img.status === "saved").length
  const errorCount = images.filter((img) => img.status === "error").length
  const pendingCount = images.filter((img) =>
    ["pending", "uploading", "uploaded", "saving"].includes(img.status),
  ).length

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="p-4 text-center bg-white border rounded-lg shadow-sm sm:p-6">
        {errorCount === 0 ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="p-4 mx-auto mb-4 bg-green-100 rounded-full w-fit"
          >
            <CheckIcon className="w-10 h-10 text-green-500 sm:w-12 sm:h-12" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="p-4 mx-auto mb-4 bg-yellow-100 rounded-full w-fit"
          >
            <AlertCircleIcon className="w-10 h-10 text-yellow-500 sm:w-12 sm:h-12" />
          </motion.div>
        )}

        <h2 className="text-xl font-semibold">Upload Complete</h2>

        <div className="mt-4 space-y-2">
          <p className="font-medium text-green-500">
            {savedCount} image{savedCount !== 1 ? "s" : ""} uploaded successfully
          </p>

          {errorCount > 0 && (
            <p className="font-medium text-red-500">
              {errorCount} image{errorCount !== 1 ? "s" : ""} failed to upload
            </p>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 mt-6 sm:flex-row">
          <Button variant="outline" onClick={onReturnToGallery} className="w-full sm:w-auto">
            Return to Gallery
          </Button>

          {errorCount > 0 && pendingCount === 0 && (
            <Button onClick={onRetryFailed} className="w-full bg-yellow-500 sm:w-auto hover:bg-yellow-600">
              Retry Failed Images
            </Button>
          )}

          <Button onClick={onUploadMore} className="w-full bg-green-500 sm:w-auto hover:bg-green-600">
            Upload More Images
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
