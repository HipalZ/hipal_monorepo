// import { motion, AnimatePresence } from "framer-motion";

// export function SuccessModal({
//   open,
//   onClose,
//   categoriesCount,
//   dishesCount,
// }: {
//   open: boolean;
//   onClose: () => void;
//   categoriesCount: number;
//   dishesCount: number;
// }) {
//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//         >
//           <motion.div
//             className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//           >
//             <h3 className="text-xl font-bold mb-2">All done! 🎉</h3>
//             <p className="text-gray-700 mb-4">
//               Created <b>{categoriesCount}</b> categories and{" "}
//               <b>{dishesCount}</b> dishes.
//             </p>
//             <div className="flex justify-end gap-2">
//               <button
//                 className="px-4 py-2 rounded-md bg-gray-100"
//                 onClick={onClose}
//               >
//                 Add more now
//               </button>
//               <button
//                 className="px-4 py-2 rounded-md bg-blue-600 text-white"
//                 onClick={onClose}
//               >
//                 Go to Menu
//               </button>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  categoriesCount: number;
  dishesCount: number;
}

export function SuccessModal({
  open,
  onClose,
  categoriesCount,
  dishesCount,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 overflow-hidden">
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    initial={{
                      x: Math.random() * 100 + "%",
                      y: Math.random() * 100 + "%",
                    }}
                    animate={{
                      y: [null, "-100%"],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex flex-col items-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    <CheckCircle2 className="w-20 h-20" />
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <CheckCircle2 className="w-20 h-20" />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-3xl font-bold mt-4 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  All Done! 🎉
                </motion.h2>

                <motion.p
                  className="text-white/90 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Your menu has been successfully created
                </motion.p>
              </div>
            </div>

            {/* Stats section */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Categories
                    </span>
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-emerald-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    {categoriesCount}
                  </motion.div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Created successfully
                  </p>
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      Dishes
                    </span>
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-purple-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    {dishesCount}
                  </motion.div>
                  <p className="text-xs text-purple-600 mt-1">Added to menu</p>
                </motion.div>
              </div>

              <motion.div
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm text-blue-800 text-center">
                  ✨ Your menu is now live and ready to use!
                </p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={onClose}
                >
                  Add More Items
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  onClick={onClose}
                >
                  View Menu
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
