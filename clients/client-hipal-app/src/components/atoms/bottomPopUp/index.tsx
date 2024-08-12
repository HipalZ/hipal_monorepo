import { memo } from "react";
import { Dialog } from "@headlessui/react";
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/utils/helpers";

const BottomPopUp = ({
  children,
  show,
  onClose,
  hide,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
}) => {
  const closeModalNothing = (e: any) => {
    // e.preventDefault()
  };

  return (
    <AnimatePresence>
      {show && (
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] overflow-y-auto"
          open={show}
          onClose={(e) => closeModalNothing(e)}
        >
          <div className="fixed inset-0 flex items-end justify-center bg-[#00000040] backdrop-blur-sm bg-opacity-70">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                "relative w-full max-w-md shadow-md bg-base-100",
                !hide && "rounded-t-[1rem]",
              )}
            >
              {!hide && (
                <div className="absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-12 left-[45%]">
                  <HiX
                    className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer"
                    onClick={onClose}
                  />
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

const MemoBottomPopUp = memo(BottomPopUp);
export default MemoBottomPopUp;
