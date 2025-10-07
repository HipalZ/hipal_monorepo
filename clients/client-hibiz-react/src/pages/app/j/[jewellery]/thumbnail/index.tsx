import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderIcon,
  FolderOpenIcon,
  RefreshCwIcon,
  ImageIcon,
} from "lucide-react";
import { useGetBucketByBusinessId } from "@/hooks/useAdminUpload";
import { useNavigate } from "react-router-dom";
import { AddBusinessCategoryModal } from "@/components/businessImageUploader/AddImageCategory";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData.ts";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const Thumbnail = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { buckets, isLoading, isError } = useGetBucketByBusinessId(
    businessId as string,
  );
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 3D Icon component with shadow and transform effects
  const Icon3D = ({
    icon: IconComponent,
    color = "green",
  }: { icon: any; color?: string }) => (
    <motion.div
      className={`relative p-3 rounded-full bg-${color}-100 shadow-lg`}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05, rotate: 5 }}
      style={{
        boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 -3px 0 rgba(0, 0, 0, 0.1)`,
        transform: "perspective(500px) rotateX(10deg)",
      }}
    >
      <IconComponent className={`w-6 h-6 text-${color}-600`} />
    </motion.div>
  );

  useEffect(() => {
    if (!isLoading && !isError && buckets.length === 0) {
      setIsModalOpen(true);
    }
  }, [isLoading, isError, buckets.length]);

  const handleCardClick = (categoryId: string) => {
    navigate(`${categoryId}`);
  };

  const goBack = useCallback(() => {
    return navigate(`/app/j/${businessId}` , { replace: true });
  }, [navigate, businessId]);

  return (
    <main>
      <div className="sticky top-0 z-50 w-full">
        <article className="linear_gradient_background">
          <MemoizedHeader title={"Business Gallery"} onBack={goBack} />
        </article>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container px-4 py-8 mx-auto"
      >
        <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold md:text-3xl">
              Business Image Gallery
            </h1>
            <p className="text-muted-foreground">
              Manage your business images by category
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="overflow-hidden animate-pulse">
                    <CardHeader className="flex items-center justify-center h-24 rounded-t-lg bg-muted">
                      <motion.div
                        animate={{
                          rotate: 360,
                          transition: {
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2,
                            ease: "linear",
                          },
                        }}
                      >
                        <RefreshCwIcon className="w-8 h-8 text-muted-foreground/30" />
                      </motion.div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="w-3/4 h-4 mb-2 rounded bg-muted" />
                      <div className="w-1/2 h-3 rounded bg-muted" />
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
              >
                <Icon3D icon={FolderIcon} color="red" />
              </motion.div>
              <p className="mt-4 text-red-500">
                Failed to load categories. Please try again.
              </p>
              <motion.div
                className="mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline">
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </motion.div>
            </motion.div>
          ) : buckets.length === 0 ? (
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
              >
                <div className="relative mx-auto w-fit">
                  <FolderIcon className="w-16 h-16 mx-auto text-green-500/70" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      boxShadow: [
                        "0px 0px 0px rgba(0,0,0,0)",
                        "0px 10px 15px rgba(0,0,0,0.1)",
                      ],
                      y: [0, -5],
                      transition: {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 2,
                      },
                    }}
                  />
                </div>
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}
                className="mt-4 text-xl font-semibold"
              >
                No categories found
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
                className="text-muted-foreground"
              >
                Click here To add category
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {buckets.length > 0 &&
                buckets?.map((category) => (
                  <motion.div
                    key={category.categoryId}
                    variants={item}
                    onHoverStart={() => setHoveredCard(category.categoryId)}
                    onHoverEnd={() => setHoveredCard(null)}
                    whileHover={{
                      y: -5,
                      transition: { duration: 0.2 },
                    }}
                    onClick={() => handleCardClick(category.categoryId)}
                    className="cursor-pointer"
                  >
                    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 border-green-100">
                      <CardHeader className="relative bg-gradient-to-r from-green-50 to-green-100">
                        <motion.div
                          className="absolute top-4 right-4"
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{
                            scale:
                              hoveredCard === category.categoryId ? 1 : 0.8,
                            opacity:
                              hoveredCard === category.categoryId ? 1 : 0.5,
                            rotate: hoveredCard === category.categoryId ? 5 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {hoveredCard === category.categoryId ? (
                            <FolderOpenIcon className="w-6 h-6 text-green-500" />
                          ) : (
                            <FolderIcon className="w-6 h-6 text-green-400" />
                          )}
                        </motion.div>
                        <CardTitle>{category.categoryName}</CardTitle>
                        <CardDescription>
                          {category.images.length} image
                          {category.images.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow p-4">
                        <div className="grid grid-cols-3 gap-2">
                          {category.images.slice(0, 3).map((image, index) => (
                            <div
                              key={index}
                              className="overflow-hidden bg-gray-100 rounded-md aspect-square"
                            >
                              {image.imageUrl ? (
                                <img
                                  src={image.imageUrl || "/placeholder.svg"}
                                  alt={image.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                          ))}
                          {category.images.length > 3 && (
                            <div className="flex items-center justify-center overflow-hidden bg-gray-100 rounded-md aspect-square">
                              <span className="text-sm font-medium text-gray-500">
                                +{category.images.length - 3}
                              </span>
                            </div>
                          )}
                          {Array.from({
                            length: Math.max(0, 3 - category.images.length),
                          }).map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="flex items-center justify-center overflow-hidden rounded-md aspect-square bg-gray-50"
                            >
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Images
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AddBusinessCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </motion.div>
    </main>
  );
};

export default Thumbnail;
