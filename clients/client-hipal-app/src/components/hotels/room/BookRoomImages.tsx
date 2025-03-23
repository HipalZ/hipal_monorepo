
import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSwipe } from "@/components/utils/useSwipe"
import { Badge } from "@/components/ui/badge"

interface RoomTypeImagesProps {
  images: string[]
  roomType: string
  roomCount: number
}

const RoomTypeImages = ({ images, roomType, roomCount }: RoomTypeImagesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset index when images change
  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const handleImageClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Handle keyboard navigation
    if ("key" in e) {
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
      return
    }

    // Handle mouse click navigation
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = (e as React.MouseEvent).clientX - rect.left

    if (x < rect.width / 2) {
      prevImage()
    } else {
      nextImage()
    }
  }

  const swipeHandlers = useSwipe({
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
    threshold: 30,
  })

  return (
    <section
      className="p-3 relative h-[17.5rem] w-full cursor-pointer overflow-hidden group"
      onClick={handleImageClick}
      onTouchStart={swipeHandlers.onTouchStart}
      onTouchMove={swipeHandlers.onTouchMove}
      onTouchEnd={swipeHandlers.onTouchEnd}
      onKeyDown={handleImageClick}
      tabIndex={0}
      role="button"
      aria-label={`Browse ${roomType} room images`}
    >
      {/* Room type badge */}
      <Badge className="absolute top-4 left-4 z-20 bg-black/70 text-white px-3 py-1.5">
        {roomType.replace(/_/g, " ")}
      </Badge>

      {/* Room count badge */}
      {roomCount > 1 && (
        <Badge className="absolute top-4 right-4 z-20 bg-primary/90 text-white px-3 py-1.5">{roomCount} rooms</Badge>
      )}

      {/* Create a container for each image with absolute positioning and zoom effect */}
      {images.map((image, index) => (
        <div
          key={index.toString()}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-110"
          }`}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={`${roomType} - image ${index + 1}`}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-5 right-5 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full z-20 transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-sm">
          <span className="font-medium">
            {currentIndex + 1}/{images.length}
          </span>
        </div>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 z-20">
          {images.map((_, index) => (
            <button
              type="button"
              key={index.toString()}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index === currentIndex ? "bg-white shadow-sm" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default RoomTypeImages

