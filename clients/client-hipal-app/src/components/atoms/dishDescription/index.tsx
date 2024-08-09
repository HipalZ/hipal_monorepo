import { Fragment, memo, type ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

function DishData({
  children,
  show,
  onClose,
}: {
  readonly children: ReactNode;
  readonly show: boolean;
  readonly onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <Dialog
          as="div"
          className="fixed inset-0 z-[100] overflow-y-auto"
          open={show}
          onClose={onClose}
        >
          <div className="fixed inset-0 flex items-end justify-center bg-[#00000060] backdrop-blur-sm bg-opacity-70">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }} // Adjust the duration and ease for smoother transition
              className="relative w-full max-w-md shadow-md bg-base-100 rounded-t-2xl"
            >
              <button
                type="button"
                onClick={() => onClose()}
                className="absolute z-50 flex items-center justify-center transform -translate-x-[50%] -translate-y-1/2 on_active_bounce -top-12 left-[45%]"
              >
                <HiX className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer " />
              </button>
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

const MemoDishData = memo(DishData);
export default MemoDishData;
