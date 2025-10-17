import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshWarningDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RefreshWarningDialog({
  open,
  onCancel,
  onConfirm,
}: RefreshWarningDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
              <div className="flex items-center gap-3 text-white">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 2,
                  }}
                >
                  <AlertTriangle className="w-8 h-8" />
                </motion.div>
                <h3 className="text-xl font-bold">Leave this page?</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700 font-medium">
                Your extracted menu isn't saved yet. If you refresh or close
                now, you'll lose your changes.
              </p>
              <p className="text-sm text-gray-600">
                The AI is still processing your menu data. Please wait until the
                process is complete before leaving.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={onCancel}
                >
                  Stay on Page
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={onConfirm}
                >
                  Discard & Leave
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
