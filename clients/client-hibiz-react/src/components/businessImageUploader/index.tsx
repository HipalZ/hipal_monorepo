import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon, ArrowLeftIcon, PlusIcon, RefreshCwIcon, ImageOffIcon, Loader2Icon } from "lucide-react"
import BusinessImageUploaderContainer from "./businessImageUploaderContainer"
import { useGetBucketByBusinessId } from "@/hooks/useAdminUpload"
import { useNavigate, useParams } from "react-router-dom"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

interface BusinessCategoryImagesProps {
  categoryId: string
}

export function BusinessCategoryImages({  categoryId }: BusinessCategoryImagesProps) {
  const navigate = useNavigate()
  const businessId = useParams().businessId as string
    const [showUploader, setShowUploader] = useState(false)
  const { buckets, isLoading, isError } = useGetBucketByBusinessId(businessId)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Find the current category
  const currentCategory = buckets.find((bucket) => bucket.categoryId === categoryId)
  const images = currentCategory?.images || []
  const categoryName = currentCategory?.categoryName || "Category"

  // Handle back navigation
  const handleBack = () => {
    navigate(`/app/business/${businessId}/thumbnail`, { replace: true })
  }

  if (showUploader) {
    return (
      <BusinessImageUploaderContainer
        businessId={businessId}
        categoryId={categoryId}
        onBack={() => setShowUploader(false)}
        onComplete={() => {
          setShowUploader(false)
        }}
      />
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container px-4 py-8 mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="icon" onClick={handleBack} className="rounded-full">
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          </motion.div>
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-2xl font-bold md:text-3xl">{isLoading ? "Loading..." : categoryName}</h1>
            <p className="text-muted-foreground">
              {!isLoading && images && `${images.length} images in this category`}
            </p>
          </motion.div>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Button
            onClick={() => setShowUploader(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Add Images</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden animate-pulse aspect-square">
                  <CardContent className="flex items-center justify-center h-full p-0 bg-muted">
                    <motion.div
                      animate={{
                        rotate: 360,
                        transition: { repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "linear" },
                      }}
                    >
                      <Loader2Icon className="w-8 h-8 text-muted-foreground/30" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-12 text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                transition: { duration: 0.5, delay: 0.2 },
              }}
              className="mx-auto w-fit"
            >
              <div className="inline-block p-6 bg-red-100 rounded-full">
                <ImageOffIcon className="w-12 h-12 text-red-500" />
              </div>
            </motion.div>
            <p className="mt-4 text-red-500">Failed to load images. Please try again.</p>
            <motion.div className="mt-4" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </motion.div>
          </motion.div>
        ) : images.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center border rounded-lg bg-muted/10"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="mx-auto w-fit"
            >
              <div className="inline-block p-6 bg-green-100 rounded-full">
                <ImageIcon className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
              className="mt-4 text-xl font-semibold"
            >
              No images found
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
              className="text-muted-foreground"
            >
              Add your first image to this category
            </motion.p>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <Button onClick={() => setShowUploader(true)} className="bg-green-500 hover:bg-green-600">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Images
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{
                  y: -5,
                  scale: 1.03,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => image.imageUrl && setSelectedImage(image.imageUrl)}
                className={image.imageUrl ? "cursor-pointer" : "cursor-not-allowed"}
              >
                <Card className="overflow-hidden transition-all duration-300 border-green-100 hover:border-green-300 aspect-square">
                  <CardContent className="h-full p-0">
                    <div className="relative w-full h-full group">
                      {image.imageUrl ? (
                        <img
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={image.name}
                          className="object-cover w-full h-full transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-100">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {image.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 bg-black/0 group-hover:bg-black/20 group-hover:opacity-100">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            className="p-2 rounded-full bg-white/80"
                          >
                            <ImageIcon className="w-5 h-5 text-green-600" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
        )}
      </AnimatePresence>

      {/* Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              className="absolute h-auto p-2 rounded-full top-2 right-2 bg-black/50 hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
