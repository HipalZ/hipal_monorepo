"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomModalProps {
  show: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
  primaryColor?: string;
  title?: string;
}

const CustomModal = ({
  show,
  onClose,
  children,
  backgroundColor = "#ffffff",
  primaryColor = "#641626",
  title = "Choose Category",
}: CustomModalProps) => {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px] p-0 gap-0 overflow-hidden"
        style={{
          backgroundColor,
          borderRadius: "1rem",
          maxHeight: "85vh",
        }}
      >
        <DialogHeader
          className="px-4 py-2 border-b"
          style={{ color: primaryColor }}
        >
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="max-h-[70vh] overflow-y-auto pb-6"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default memo(CustomModal);
