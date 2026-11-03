"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryCarouselProps {
  images: {
    _id: string;
    name: string;
    imageUrl: string;
  }[];
}

export default function GalleryCarousel({ images }: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (document.hidden || interval) return;
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = undefined;
    };
    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAutoPlaying, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative group">
      {/* Frame with glass & border */}
      <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0.2, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.995 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex].imageUrl || "/placeholder.svg"}
              alt={images[currentIndex].name || "Property image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            {/* bottom gradient overlay for readability */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
            {/* label */}
            {images[currentIndex].name && (
              <div className="absolute bottom-3 left-3 text-white/90 text-sm px-3 py-1 rounded-full bg-black/40 backdrop-blur">
                {images[currentIndex].name}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/60 text-white border-white/20"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/60 text-white border-white/20"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-4 right-4 text-white/90 px-3 py-1 rounded-full text-sm font-medium bg-black/40 backdrop-blur border border-white/10">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image._id}
              onClick={() => goToSlide(index)}
              className={[
                "relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden",
                "transition-all duration-200",
                "border",
                index === currentIndex
                  ? "border-white/60 ring-2 ring-white/20"
                  : "border-white/10 hover:border-white/30",
              ].join(" ")}
            >
              <Image
                src={image.imageUrl || "/placeholder.svg"}
                alt={image.name || "Property thumbnail"}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
