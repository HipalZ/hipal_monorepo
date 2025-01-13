import { memo, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/utils/helpers";

const MemoBottomPopUp = ({
  children,
  show,
  onClose,
  hide,
  linearGradTheme,
  bottomCross,
  height,
  width,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
  linearGradTheme?: boolean;
  bottomCross?: boolean;
  height?: string;
  width?: string;
}) => {
  useEffect(() => {
    if (show) {
      const originalHash = window.location.hash;

      window.location.hash = "#popup";

      const handleHashChange = () => {
        if (window.location.hash !== "#popup") {
          onClose();
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);

        if (window.location.hash === "#popup") {
          if (originalHash) {
            window.location.hash = originalHash;
          } else {
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search
            );
          }
        }
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 1000 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 60 }}
            className={cn(
              "relative shadow-md lg:rounded-2xl lg:mb-[3rem] ",
              !hide && "rounded-t-[1rem]",
              linearGradTheme ? "background-gradient" : "bg-[#ffffff]",
              width || "w-full max-w-[48rem]",
              height || "h-[100dvh] lg:h-[80dvh]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {!hide && (
              <div className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-12 left-1/2">
                <HiX
                  className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer"
                  onClick={onClose}
                />
              </div>
            )}
            {children}
            {bottomCross && (
              <button
                type="button"
                onClick={
                  onClose}
                className="absolute bottom-0 p-4 rounded-full bg-[#00000050] text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2"
              >
                <HiX />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const BottomPopUp = memo(MemoBottomPopUp);
export default BottomPopUp;
