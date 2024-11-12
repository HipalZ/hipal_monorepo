import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiClock } from "react-icons/fi";
import MiddlePopUp from "@/components/atom/middlePopUp";
import { cn } from "@/components/utils/helper";

interface SuccessPopupProps {
  show: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const MemoSuccessPopup: React.FC<SuccessPopupProps> = ({
  show,
  onClose,
  onProceed,
}) => {
  const [timer, setTimer] = useState(15);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (!isTimerStarted) {
      setIsTimerStarted(true);
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
  }, [isTimerStarted]);

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(intervalRef.current!);
    };
  }, []);

  return (
    <MiddlePopUp onlyPopUp show={show} onClose={onClose}>
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {timer > 0 ? (
            <div className="flex items-center justify-center w-20 h-20 mb-4 bg-yellow-100 rounded-full">
              <FiClock className="text-4xl text-yellow-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-20 h-20 mb-4 bg-green-100 rounded-full">
              <FiCheck className="text-4xl text-green-500" />
            </div>
          )}
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            {timer > 0 ? "Pending..." : "Success!"}
          </h2>
          <p className="mb-6 text-center text-gray-600">
            {timer > 0
              ? "Please wait while we process your request"
              : "Your template has been created successfully."}
          </p>
          {timer > 0 ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <motion.div
                className="bg-green-500 h-2.5 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          ) : null}
          {timer > 0 ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <FiClock className="text-xl" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={timer}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg font-semibold"
                >
                  {timer}s
                </motion.span>
              </AnimatePresence>
            </div>
          ) : null}
        </motion.div>
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={onProceed}
            disabled={timer !== 0}
            className={cn(
              timer > 0 ? "opacity-50" : "bg-green-500",
              "px-4 py-2 font-semibold text-white transition duration-300 ease-in-out transform rounded-full hover:scale-105",
            )}
          >
            Proceed Now
          </button>
        </div>
      </div>
    </MiddlePopUp>
  );
};

const SuccessPopup = memo(MemoSuccessPopup);
export default SuccessPopup;
