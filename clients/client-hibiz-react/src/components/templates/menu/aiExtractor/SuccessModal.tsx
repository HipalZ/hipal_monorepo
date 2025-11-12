import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { memo } from 'react';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  categoriesCount: number;
  dishesCount: number;
}

const MemoSuccessModal = ({ open, onClose, categoriesCount, dishesCount }: SuccessModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8">
              <div className="absolute inset-0">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-white/30"
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                    }}
                    animate={{
                      y: [null, '-100%'],
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
                  <div className="relative">
                    <CheckCircle2 className="h-20 w-20" />
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
                      <CheckCircle2 className="h-20 w-20" />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h2
                  className="mb-2 mt-4 text-3xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  All Done! 🎉
                </motion.h2>

                <motion.p className="text-center text-white/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  Your menu has been successfully created
                </motion.p>
              </div>
            </div>

            {/* Stats section */}
            <div className="space-y-6 p-8">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Categories</span>
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-emerald-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                  >
                    {categoriesCount}
                  </motion.div>
                  <p className="mt-1 text-xs text-emerald-600">Created successfully</p>
                </motion.div>

                <motion.div
                  className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Dishes</span>
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-purple-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                  >
                    {dishesCount}
                  </motion.div>
                  <p className="mt-1 text-xs text-purple-600">Added to menu</p>
                </motion.div>
              </div>

              <motion.div
                className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-center text-sm text-blue-800">✨ Your menu is now live and ready to use!</p>
              </motion.div>

              {/* Action buttons */}
              <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                  Add More Items
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" onClick={onClose}>
                  View Menu
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SuccessModal = memo(MemoSuccessModal);
export default SuccessModal;
