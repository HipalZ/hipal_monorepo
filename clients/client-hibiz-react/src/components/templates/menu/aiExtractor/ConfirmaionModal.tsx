import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ConfirmProceedModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmProceedModal = ({ open, onConfirm, onCancel }: ConfirmProceedModalProps) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl"
          >
            {/* Warning Icon */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-amber-100 p-3">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-red-800">Please Review Before Proceeding</h2>

            {/* Description */}
            <p className="text-poppins mt-3 text-base font-semibold leading-6 text-slate-600">
              Kindly ensure that all <span className="text-xl font-semibold capitalize text-indigo-600">categories</span> and{' '}
              <span className="text-xl font-semibold capitalize text-indigo-600">dishes</span> are verified before continuing. Once published, this
              menu will be visible to your customers.
            </p>
            <p className="mt-2 text-sm font-semibold italic text-red-900 opacity-70">
              Hipalz processes your data using AI and automation — we do not take responsibility for any incorrect names, prices, or wording displayed
              to end users.
            </p>

            {/* Checkbox */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="confirm-check"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-emerald-600"
              />
              <label htmlFor="confirm-check" className="text-secondary cursor-pointer select-none text-sm font-semibold">
                I have reviewed all categories and dishes carefully.
              </label>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={onCancel} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                Go Back
              </Button>

              <Button
                onClick={onConfirm}
                disabled={!isChecked}
                className={`text-white shadow-md ${
                  isChecked
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                    : 'cursor-not-allowed bg-slate-300'
                }`}
              >
                Yes, Proceed
              </Button>
            </div>

            {/* Subtle hint */}
            {!isChecked && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-medium text-amber-600">
                Please check the box above to confirm before proceeding.
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
