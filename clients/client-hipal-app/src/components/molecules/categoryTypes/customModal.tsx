import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface CustomModalProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
}

const CustomModal = ({ show, onClose, children }: CustomModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#000000] bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 0, opacity: 0, scale: 0 }}
            animate={{ y: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: 0, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute -bottom-[1rem] w-11/12 bg-[#00000080] border backdrop-blur-sm border-[#000000] max-w-md shadow-lg rounded-xl"
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
