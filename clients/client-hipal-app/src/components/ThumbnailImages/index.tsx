"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useGetBucketByBusinessId } from "../hooks/useImages";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import type { Image as ImageType, IBuckets } from "../hooks/useImages";
import { cn } from "@/lib/utils";

// Types
interface BusinessImagesProps {
  businessId: string;
}

// Animation variants
const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.1,
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.1,
    },
  }),
};

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.1,
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
  hover: {
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

// Memoized thumbnail component
const ImageThumbnail = memo(
  ({
    image,
    index,
    isSelected,
    onClick,
  }: {
    image: ImageType;
    index: number;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    return (
      <motion.div
        key={`thumb-${index}`}
        className={`
        flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer
        ${isSelected ? "ring-2 ring-primary" : ""}
      `}
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src={image.imageUrl || "/placeholder.svg"}
          alt={image?.name || "Gallery image"}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </motion.div>
    );
  },
);

ImageThumbnail.displayName = "ImageThumbnail";

// Memoized grid item component
const GridItem = memo(
  ({
    image,
    index,
    categoryId,
    onClick,
  }: {
    image: ImageType;
    index: number;
    categoryId: string;
    onClick: () => void;
  }) => {
    return (
      <motion.div
        key={`${categoryId}-${index}`}
        className={cn(
          "overflow-hidden rounded-xl cursor-pointer ",
          index === 0
            ? "col-span-2 row-span-2 h-[13rem]"
            : "col-span-1 row-span-1 h-[6rem]",
        )}
        onClick={onClick}
        variants={gridItemVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        custom={index}
        layoutId={`image-${categoryId}-${index}`}
      >
        <Image
          src={image.imageUrl}
          alt={image.name || "Gallery image"}
          width={index === 0 ? 600 : 300}
          height={index === 0 ? 600 : 300}
          className="object-cover w-full h-full"
        />
      </motion.div>
    );
  },
);

GridItem.displayName = "GridItem";

// Main component
function BusinessImagesComponent({ businessId }: BusinessImagesProps) {
  const { buckets, isLoading, isError } = useGetBucketByBusinessId(businessId);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [modalCategory, setModalCategory] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [direction, setDirection] = useState(0);

  // For drag gesture
  const x = useMotionValue(0);
  const dragThreshold = 100; // Amount of drag required to change image

  // Filter out categories with no images
  const validBuckets = useMemo(() => {
    return buckets.filter((bucket) => bucket.images.length > 0);
  }, [buckets]);

  // Create an "All" category that combines all images
  const allImagesCategory = useMemo(() => {
    if (validBuckets.length === 0) return null;

    const allImages = validBuckets.reduce<ImageType[]>((acc, bucket) => {
      return [...acc, ...bucket.images];
    }, []);

    return {
      categoryId: "all",
      categoryName: "All",
      images: allImages,
    } as IBuckets;
  }, [validBuckets]);

  // Combined buckets with "All" at the beginning
  const combinedBuckets = useMemo(() => {
    if (!allImagesCategory) return validBuckets;
    return [allImagesCategory, ...validBuckets];
  }, [allImagesCategory, validBuckets]);

  // Get current category object and images count
  const activeCategoryObj = useMemo(
    () => combinedBuckets.find((cat) => cat.categoryId === activeCategory),
    [combinedBuckets, activeCategory],
  );

  const modalCategoryObj = useMemo(
    () => combinedBuckets.find((cat) => cat.categoryId === modalCategory),
    [combinedBuckets, modalCategory],
  );

  const imagesCount = useMemo(
    () => modalCategoryObj?.images.length || 0,
    [modalCategoryObj],
  );

  // Set the first category as active when buckets load
  useEffect(() => {
    if (combinedBuckets.length > 0 && !activeCategory) {
      setActiveCategory(combinedBuckets[0]?.categoryId);
    }
  }, [combinedBuckets, activeCategory]);

  // Set modal category to match active category when opening modal
  useEffect(() => {
    if (isModalOpen) {
      setModalCategory(activeCategory);
    }
  }, [isModalOpen, activeCategory]);

  // Event handlers with useCallback
  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  }, []);

  const handlePrevImage = useCallback(() => {
    setDirection(-1);
    setSelectedImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
  }, [imagesCount]);

  const handleNextImage = useCallback(() => {
    setDirection(1);
    setSelectedImageIndex((prev) => (prev + 1) % imagesCount);
  }, [imagesCount]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x > dragThreshold) {
        handlePrevImage();
      } else if (info.offset.x < -dragThreshold) {
        handleNextImage();
      }
      x.set(0); // Reset position
    },
    [dragThreshold, handlePrevImage, handleNextImage, x],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleViewAllClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setModalCategory(categoryId);
    setSelectedImageIndex(0);
  }, []);

  if (isLoading) {
    return <SkeletonLoader height={300} />;
  }

  if (isError || combinedBuckets.length === 0) {
    return null;
  }

  return (
    <section className="w-full rounded-3xl">
      <article className="relative bg-base-100 rounded-3xl">
        <motion.h2
          className="py-2 mt-4 text-2xl font-bold text-center text-primary bg-base-100 rounded-t-3xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Photo Gallery
        </motion.h2>

        <Tabs
          defaultValue={combinedBuckets[0]?.categoryId}
          className="w-full"
          onValueChange={setActiveCategory}
        >
          <div className="px-4 overflow-x-auto">
            <TabsList className="h-auto p-1 mb-4">
              {combinedBuckets.map((category, idx) => (
                <motion.div
                  key={category.categoryId}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                >
                  <TabsTrigger
                    value={category.categoryId}
                    className="px-4 py-2 mx-2 shadow-md rounded-xl text-primary border-secondary capitalize"
                  >
                    {category.categoryName}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </div>

          {combinedBuckets.map((category) => {
            // Limit to 6 visible images (first one takes 4 spaces)
            const visibleImages = category.images.slice(0, 6);

            return (
              <TabsContent
                key={category.categoryId}
                value={category.categoryId}
                className="px-4 pb-6"
              >
                <motion.div
                  className="grid grid-cols-3 gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {visibleImages.map((image, index) => (
                    <GridItem
                      key={`grid-${category.categoryId}-${index}`}
                      image={image}
                      index={index}
                      categoryId={category.categoryId}
                      onClick={() => handleImageClick(index)}
                    />
                  ))}
                </motion.div>

                {category.images.length > 6 && (
                  <div className="flex justify-center mt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleViewAllClick}
                      >
                        View All {category.images.length} Photos
                      </Button>
                    </motion.div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Image Modal with Carousel */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="p-0 border-none bg-[#000000] w-full max-w-[30rem] mx-auto h-[100dvh] flex flex-col">
            {/* Top 20% - Header with navigation and category tabs */}
            <div className="h-[20%] flex flex-col">
              {/* Back button */}
              <div className="flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-black/50 hover:bg-black/70"
                  onClick={handleCloseModal}
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </div>

              {/* Category tabs */}
              <Tabs className="px-4 overflow-x-auto">
                <TabsList className="h-auto p-1 bg-black/50">
                  {combinedBuckets.map((category) => (
                    <TabsTrigger
                      key={`modal-${category.categoryId}`}
                      value={category.categoryId}
                      className={`px-3 py-1 mx-1 text-white ${
                        modalCategory === category.categoryId
                          ? "bg-primary/20"
                          : ""
                      }`}
                      onClick={() => handleCategoryChange(category.categoryId)}
                    >
                      {category.categoryName}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Middle 60% - Main image carousel */}
            <div className="relative h-[60%] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {modalCategoryObj?.images[selectedImageIndex] && (
                  <motion.div
                    key={`${modalCategory}-${selectedImageIndex}`}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={handleDragEnd}
                    style={{ x }}
                    className="absolute flex items-center justify-center w-full h-full"
                  >
                    <Image
                      src={
                        modalCategoryObj.images[selectedImageIndex].imageUrl ||
                        "/placeholder.svg"
                      }
                      alt={
                        modalCategoryObj.images[selectedImageIndex].name ||
                        "Gallery image"
                      }
                      width={1200}
                      height={800}
                      className="object-contain max-w-full max-h-full p-4"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

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

            {/* Bottom 20% - Thumbnails */}
            <div className="h-[20%] bg-black/80 p-4 overflow-hidden">
              <div className="flex items-center h-full gap-2 pb-2 overflow-x-auto">
                {modalCategoryObj?.images.map((image, index) => (
                  <ImageThumbnail
                    key={`thumb-${modalCategory}-${index}`}
                    image={image}
                    index={index}
                    isSelected={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </article>
    </section>
  );
}

// Export memoized component for tree-shaking
export default memo(BusinessImagesComponent);
