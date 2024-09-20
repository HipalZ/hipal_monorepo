import { cn } from "@/components/utils/helper";
import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import { HiX } from "react-icons/hi";

function MemoizedPopUp({
  children,
  show,
  onClose,
  hide,
  width,
  height,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
  width?: string;
  height?: string;
}) {
  const stopClosing = (e: any) => {
    if (hide) {
      return onClose();
    }
    e.preventDefault();
  };

  return (
    <AnimatePresence>
      {show && (
        <Dialog
          open={show}
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={stopClosing}
        >
          <div className="fixed inset-0 flex items-end justify-center bg-black lg:items-center bg-opacity-50 backdrop-blur-sm lg:pt-[4rem]">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                "bg-base-100 shadow-md relative",
                width ? width : "w-full max-w-[48rem]",
                height ? height : "h-auto",
                !hide ? "rounded-t-[1.5rem] lg:rounded-2xl" : "lg:rounded-2xl",
              )}
            >
              {!hide && (
                <div className="absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-8 left-1/2">
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
}

const PopUp = memo(MemoizedPopUp);

export default PopUp;
