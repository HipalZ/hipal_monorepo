"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ZoomIn } from "lucide-react";

interface MasonryGridProps {
  images: {
    _id: string;
    name: string;
    imageUrl: string;
    categoryName: string;
  }[];
}

type Img = MasonryGridProps["images"][number];

export default function MasonryGrid({ images }: MasonryGridProps) {
  const [selectedImage, setSelectedImage] = useState<Img | null>(null);

  // Store previous scroll position and restore on close (robust scroll lock)
  const scrollYRef = useRef(0);
  const wasLockedRef = useRef(false);

  // Lock/unlock scroll when selectedImage changes
  useEffect(() => {
    const lock = () => {
      if (wasLockedRef.current) return;
      wasLockedRef.current = true;

      scrollYRef.current = window.scrollY || window.pageYOffset || 0;

      // Use position: fixed trick (works across iOS/desktop)
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      // (optional) visually remove scrollbar gap:
      // document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    };

    const unlock = () => {
      if (!wasLockedRef.current) return;
      wasLockedRef.current = false;

      const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || 0;

      // Reset styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      // document.body.style.paddingRight = "";

      // Restore scroll
      window.scrollTo(0, y);
      document.documentElement.style.scrollBehavior = "";
    };

    if (selectedImage) lock();
    else unlock();

    // Cleanup in case component unmounts while locked
    return () => {
      if (wasLockedRef.current) {
        // Ensure unlock on unmount
        const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || 0;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, y);
        document.documentElement.style.scrollBehavior = "";
        wasLockedRef.current = false;
      }
    };
  }, [selectedImage]);

  // Close on ESC
  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const openLightbox = (image: Img) => setSelectedImage(image);
  const closeLightbox = () => setSelectedImage(null);

  if (images.length === 0) return null;

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
      >
        {images.map((image) => (
          <motion.div
            key={image._id}
            variants={itemVariants}
            className="break-inside-avoid group cursor-pointer"
            onClick={() => openLightbox(image)}
          >
            <div className="relative rounded-lg overflow-hidden bg-muted hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/3] sm:aspect-auto">
                <Image
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.name || "Property image"}
                  width={400}
                  height={300}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {image.categoryName}
                </Badge>
                {image.name && (
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {image.name}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Use overflow-auto here so zoomed/tall images can scroll within the lightbox
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-auto"
            onClick={closeLightbox}
          >
            <motion.div
              key={selectedImage._id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute -top-12 right-0 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20"
                onClick={closeLightbox}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image */}
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.name || "Property image"}
                  width={1200}
                  height={800}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <Badge variant="secondary" className="mb-2">
                  {selectedImage.categoryName}
                </Badge>
                {selectedImage.name && (
                  <h3 className="text-white text-lg font-semibold">
                    {selectedImage.name}
                  </h3>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
