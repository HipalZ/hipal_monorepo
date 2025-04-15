"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { UploadIcon, XIcon } from "lucide-react"
import toast from "react-hot-toast"
import type { ImageData } from "../hotel/FloorAndRooms/Room/types"

interface ImageSelectorProps {
  images: ImageData[]
  onAddImages: (newImages: ImageData[]) => void
  onRemoveImage: (id: string) => void
  onProceedToMetadata: () => void
}

export function ImageSelector({ images, onAddImages, onRemoveImage, onProceedToMetadata }: ImageSelectorProps) {
  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to 20 images total
      const availableSlots = 20 - images.length
      const filesToAdd = acceptedFiles.slice(0, availableSlots)

      if (acceptedFiles.length > availableSlots) {
        toast.error(`You can only upload up to 20 images. Only the first ${availableSlots} will be added.`)
      }

      // Process each file to create data URLs (not blob URLs)
      const processFiles = async () => {
        const newImages: ImageData[] = []

        for (const file of filesToAdd) {
          try {
            // Validate file type
            const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"]
            if (!validTypes.includes(file.type)) {
              toast.error(`Skipping ${file.name}: Only PNG, JPEG, JPG, GIF, and WEBP are allowed.`)
              continue
            }

            // Create a data URL for the preview
            const preview = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })

            console.log(`Created preview for ${file.name}, type: ${file.type}`)

            newImages.push({
              id: crypto.randomUUID(),
              file,
              preview,
              name: file.name.split(".")[0], // Default name from filename
              description: "",
              status: "pending",
            })
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
            toast.error(`Error processing ${file.name}`)
          }
        }

        if (newImages.length > 0) {
          onAddImages(newImages)
        }
      }

      processFiles()
    },
    [images.length, onAddImages],
  )

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
    },
    maxSize: 10485760, // 10MB
  })

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-300 hover:bg-green-50"}`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="mx-auto w-fit"
        >
          <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
        </motion.div>
        <p className="mt-2 text-sm text-gray-500">
          {isDragActive ? "Drop the images here..." : "Drag & drop images here, or click to select"}
        </p>
        <p className="text-xs text-gray-400">PNG, JPEG, JPG, GIF, WEBP up to 10MB each (max 20 images)</p>
      </div>

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Selected Images ({images.length}/20)</h2>
            <Button variant="outline" size="sm" onClick={onProceedToMetadata} disabled={images.length === 0}>
              Continue
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image) => (
              <motion.div
                key={image.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <Card className="h-full overflow-hidden border-green-100">
                  <CardContent className="relative p-0 aspect-square">
                    <img
                      src={image.preview || "/placeholder.svg"}
                      alt={image.name}
                      className="object-cover w-full h-full"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveImage(image.id)
                      }}
                    >
                      <XIcon className="w-4 h-4" />
                    </motion.button>
                  </CardContent>
                  <CardFooter className="p-2 text-xs truncate">{image.name || "Unnamed"}</CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
