"use client"

import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader"
import { useGetBucketByBusinessId } from "../hooks/useImages"

interface BusinessImagesProps {
  businessId: string
}

export default function BusinessImages({ businessId }: BusinessImagesProps) {
  const { buckets, isLoading, isError } = useGetBucketByBusinessId(businessId)
  const [activeCategory, setActiveCategory] = useState<string>("")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Set the first category as active when buckets load
  if (buckets.length > 0 && !activeCategory) {
    setActiveCategory(buckets[0]?.categoryId)
  }

  if (isLoading) {
    return <SkeletonLoader height={300} />
  }

  if (isError || buckets.length === 0) {
    return null
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsModalOpen(true)
  }

  const handlePrevImage = () => {
    const activeCategoryObj = buckets.find((cat) => cat.categoryId === activeCategory)
    const imagesCount = activeCategoryObj?.images.length || 0
    setSelectedImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount)
  }

  const handleNextImage = () => {
    const activeCategoryObj = buckets.find((cat) => cat.categoryId === activeCategory)
    const imagesCount = activeCategoryObj?.images.length || 0
    setSelectedImageIndex((prev) => (prev + 1) % imagesCount)
  }

  return (
    <section className="w-full px-4 mt-8 rounded-3xl">
      <article className="relative bg-base-200 rounded-3xl">
        <h2 className="py-4 mt-4 text-2xl font-bold text-center text-primary bg-base-200 rounded-t-3xl">
          Photo Gallery
        </h2>

        <Tabs
          defaultValue={buckets[0]?.categoryId}
          className="w-full"
          onValueChange={(value) => setActiveCategory(value)}
        >
          <div className="px-4 overflow-x-auto">
            <TabsList className="h-auto p-1 mb-4">
              {buckets.map((category) => (
                <TabsTrigger key={category.categoryId} value={category.categoryId} className="px-4 py-2">
                  {category.categoryName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {buckets.map((category) => {
            // Limit to 6 visible images (first one takes 4 spaces)
            const visibleImages = category.images.slice(0, 6)

            return (
              <TabsContent key={category.categoryId} value={category.categoryId} className="px-4 pb-6">
                <div className="grid grid-cols-3 gap-4">
                  {visibleImages.map((image, index) => (
                    <div
                      key={`${category.categoryId}-${index}`}
                      className={`
                        overflow-hidden rounded-xl cursor-pointer
                        ${index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}
                      `}
                      onClick={() => handleImageClick(index)}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={image.name || "Gallery image"}
                        width={index === 0 ? 600 : 300}
                        height={index === 0 ? 600 : 300}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>

                {category.images.length > 6 && (
                  <div className="flex justify-center mt-4">
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4">
                          View All {category.images.length} Photos
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Image Modal with Carousel */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 bg-black/90 border-none">
            <div className="relative flex flex-col h-full">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute z-50 text-white top-2 right-2 bg-black/50 hover:bg-black/70"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Main carousel */}
              <div className="relative flex items-center justify-center flex-1 p-4">
                {buckets.find((cat) => cat.categoryId === activeCategory)?.images[selectedImageIndex] && (
                  <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
                    <Image
                      src={
                        buckets.find((cat) => cat.categoryId === activeCategory)?.images[selectedImageIndex]
                          ?.imageUrl || "/placeholder.svg"
                      }
                      alt={
                        buckets.find((cat) => cat.categoryId === activeCategory)?.images[selectedImageIndex]?.name ||
                        "Gallery image"
                      }
                      width={1200}
                      height={800}
                      className="object-contain max-h-[70vh] max-w-full"
                    />
                  </div>
                )}

                {/* Navigation buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute z-10 text-white rounded-full left-4 bg-black/50 hover:bg-black/70"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute z-10 text-white rounded-full right-4 bg-black/50 hover:bg-black/70"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>

              {/* Thumbnails */}
              <div className="p-4 bg-black/80">
                <div className="flex gap-2 pb-2 overflow-x-auto">
                  {buckets
                    .find((cat) => cat.categoryId === activeCategory)
                    ?.images.map((image, index) => (
                      <div
                        key={`thumb-${index}`}
                        className={`
                        flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer
                        ${selectedImageIndex === index ? "ring-2 ring-primary" : ""}
                      `}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={image?.name ||"Gallery image"}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </article>
    </section>
  )
}
