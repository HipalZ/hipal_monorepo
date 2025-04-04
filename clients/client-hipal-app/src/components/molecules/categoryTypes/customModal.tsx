import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@hi/common";

interface CustomModalProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
  primaryColor?: string;
}

const CustomModal = ({ 
  show, 
  onClose, 
  children, 
  backgroundColor = "#ec4899" ,
  primaryColor = "#fce7f3"
}: CustomModalProps) => {
  // Convert hex to rgba for background with opacity
 

  

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{ y: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: 0, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={cn(
              "absolute -bottom-[1rem] w-11/12 backdrop-blur-sm max-w-md shadow-lg rounded-xl",
              "border"
            )}
            style={{ 
              backgroundColor: backgroundColor,
              borderColor: backgroundColor
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomModal;