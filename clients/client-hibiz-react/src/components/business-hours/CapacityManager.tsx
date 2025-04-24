import { useState, useCallback, memo } from "react";
import { Users, Save, Edit2, X, UserPlus, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUpdateCapacity } from "@/hooks/useBusinessDayConfig";

interface CapacityManagerProps {
  businessId: string;
  currentCapacity: number;
}

// 3D Icon component
const Icon3D = ({
  icon: Icon,
  size = 18,
}: { icon: any; color?: string; size?: number }) => {
  return (
    <div className="relative z-0 text-primary">
      <Icon size={size} strokeWidth={2} />
    </div>
  );
};

const CapacityManager = ({
  businessId,
  currentCapacity,
}: CapacityManagerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [capacity, setCapacity] = useState(currentCapacity);
  const [isHovered, setIsHovered] = useState(false);
  const { isUpdating, updateCapacity } = useUpdateCapacity();

  // Update capacity when editing is done
  const handleSaveCapacity = useCallback(async () => {
    if (capacity === currentCapacity) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCapacity({ businessId, capacity });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update capacity:", error);
    }
  }, [capacity, currentCapacity, businessId, updateCapacity]);

  // Handle capacity input change
  const handleCapacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value);
      if (!Number.isNaN(value) && value >= 1) {
        setCapacity(value);
      }
    },
    [],
  );

  // Increment/decrement capacity
  const adjustCapacity = useCallback((amount: number) => {
    setCapacity((prev) => Math.max(1, prev + amount));
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setCapacity(currentCapacity);
    setIsEditing(false);
  }, [currentCapacity]);

  return (
    <Card className="overflow-hidden min-h-[6rem]">
      <CardContent className="p-0">
        <motion.div
          className="p-4 sm:p-5"
          initial={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
          animate={{
            backgroundColor: isHovered
              ? "rgba(249, 250, 251, 0.5)"
              : "rgba(255, 255, 255, 0)",
          }}
          transition={{ duration: 0.2 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {/* Header section - responsive layout */}
          <div className="flex flex-col gap-4 ">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex items-center justify-center flex-shrink-0 w-12 h-12 shadow-md rounded-xl bg-primary/10"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d",
                }}
              >
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: [0, 10, 0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                >
                  <Icon3D icon={Users} size={22} />
                </motion.div>
              </motion.div>
              <div>
                <h3 className="text-base font-medium text-gray-800">
                  Business Capacity
                </h3>
                <p className="text-xs text-gray-500">
                  Maximum number of bookings allowed at the same time
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-start w-full gap-3 sm:flex-row sm:items-center sm:w-auto"
                >
                  {/* Mobile-friendly input controls */}
                  <div className="flex items-center w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative w-12 h-12 overflow-hidden rounded-r-none shadow-md sm:h-10 sm:w-10 rounded-l-xl group"
                      onClick={() => adjustCapacity(-1)}
                      disabled={capacity <= 1 || isUpdating}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Icon3D icon={UserMinus} size={18} />
                      </motion.div>
                    </Button>
                    <Input
                      type="number"
                      value={capacity}
                      onChange={handleCapacityChange}
                      min="1"
                      className="h-12 sm:h-10 w-full sm:w-20 rounded-none text-center text-lg font-medium shadow-md border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isUpdating}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="relative w-12 h-12 overflow-hidden rounded-l-none shadow-md sm:h-10 sm:w-10 rounded-r-xl group"
                      onClick={() => adjustCapacity(1)}
                      disabled={isUpdating}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Icon3D icon={UserPlus} size={18} />
                      </motion.div>
                    </Button>
                  </div>

                  {/* Action buttons - full width on mobile */}
                  <div className="flex items-center w-full gap-2 mt-3 sm:w-auto sm:mt-0">
                    <Button
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="flex-1 h-12 px-4 shadow-sm sm:h-10 sm:flex-none rounded-xl"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                      >
                        <Icon3D icon={X} size={18} />
                        <span className="ml-2 text-sm">Cancel</span>
                      </motion.div>
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveCapacity}
                      disabled={isUpdating || capacity === currentCapacity}
                      className="flex-1 h-12 px-4 shadow-md sm:h-10 sm:flex-none rounded-xl"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center"
                      >
                        {isUpdating ? (
                          <div className="w-5 h-5 mr-2 border-2 border-white rounded-full sm:w-4 sm:h-4 border-t-transparent animate-spin"></div>
                        ) : (
                          <Icon3D icon={Save} size={18} />
                        )}
                        <span className="ml-2 text-sm">Save</span>
                      </motion.div>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between w-full gap-3 sm:w-auto sm:justify-start"
                >
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 sm:py-1.5 text-base sm:text-sm font-medium rounded-xl shadow-md"
                  >
                    <motion.span
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2,
                        repeatDelay: 1,
                      }}
                    >
                      {currentCapacity}{" "}
                      {currentCapacity === 1 ? "booking" : "bookings"}
                    </motion.span>
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="h-12 px-4 shadow-md sm:h-10 sm:px-3 rounded-xl"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center"
                    >
                      <Icon3D icon={Edit2} size={18} />
                      <span className="ml-2 text-sm">Edit</span>
                    </motion.div>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default memo(CapacityManager);
