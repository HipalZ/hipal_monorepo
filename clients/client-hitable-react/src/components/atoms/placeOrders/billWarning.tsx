import { memo, useCallback, useState } from "react";
import { useOrderStore } from "@/components/store/useOrderData";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ArrowRight,
  AlertTriangle, XCircle
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import CommonBottomButton from "../bottomButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import { BiDish, BiRupee } from "react-icons/bi";

const MemoBillWarning = () => {
  const screenSize = useScreenSize();
  const { selectedTable, setPaymentSteps, setOpenOrderModal } = useOrderStore();
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const xInput = [0, 300];
  const background = useTransform(x, xInput, [
    "linear-gradient(90deg, #000000 0%, #000000 0%, #e5e7eb 0%, #e5e7eb 100%)",
    "linear-gradient(90deg, #000000 0%, #000000 100%, #000000 100%, #000000 100%)",
  ]);

  const guideX = useMotionValue(0);
  const guideOpacity = useTransform(x, [0, 10], [0.5, 0]);

  const handleDragEnd = () => {
    setIsDragging(false);
    if (x.get() > 200) {
      setPaymentSteps(1);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  return (
    <section className="py-[5rem] min-h-[90dvh] flex items-center justify-center md:py-[8rem] px-4 max-w-md mx-auto">
      <Card className="w-full border-none shadow-xl rounded-xl bg-white overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-black to-gray-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Fetch Bill</h2>
              <p className="text-gray-300 mt-1">Table: {selectedTable?.name}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <BiRupee className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <CardContent className="!p-4 space-y-8 pt-6">
          {/* Visual Warning */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h4 className="text-lg font-semibold text-gray-800">
                Important Notice
              </h4>
            </div>
            <br />
            {/* Pictorial Representation */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Before */}
              <div className="relative bg-white rounded-lg p-4 shadow-md">
                <div className="absolute -top-3 -left-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                  BEFORE
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <BiDish className="w-8 h-8 text-black" />
                  </div>
                  <motion.div className="text-center">
                    <p className="text-sm font-medium text-gray-800">
                      Orders Allowed
                    </p>
                    <p className="text-xs text-gray-500">Add items anytime</p>
                  </motion.div>
                </div>
              </div>

              {/* After */}
              <div className="relative bg-white rounded-lg p-4 shadow-md">
                <div className="absolute -top-3 -left-3 bg-orange-500 text-black text-xs font-bold px-2 py-1 rounded">
                  AFTER
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2 relative">
                    <XCircle className="absolute w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-800">
                      Orders Locked
                    </p>
                    <p className="text-xs text-gray-500">
                      No new items can be added
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div className="relative w-full overflow-hidden bg-gray-100 rounded-full h-16 mt-8">
            {/* Guide Animation */}
            <motion.div
              className="absolute top-0 flex items-center h-full pointer-events-none left-16"
              style={{ x: guideX, opacity: guideOpacity }}
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{ background }}
            />

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 300 }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              className="absolute top-0 left-0 flex items-center justify-center w-16 h-16 cursor-grab active:cursor-grabbing"
              style={{ x }}
            >
              <div className="flex items-center justify-center w-14 h-14 bg-black rounded-full shadow-md hover:bg-gray-800 transition-colors">
                <ArrowRight className="w-7 h-7 text-white" />
              </div>
            </motion.div>

            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none">
              <span
                className={`text-base font-medium text-gray-600 transition-opacity ${
                  isDragging ? "opacity-0" : "opacity-100"
                }`}
              >
                Slide to fetch bill
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-center pb-6">
          <p className="text-xs text-gray-500">
            Drag the button all the way to confirm
          </p>
        </CardFooter>
      </Card>
      <CommonBottomButton
        fixed={true}
        maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
        backgroundColor={screenSize === "xs" ? "" : "white"}
        buttons={[
          {
            text: "Back",
            onClick: closeOrderModalHandler,
            className:
              "rounded-md w-full bg-black hover:bg-gray-800 text-white",
          },
        ]}
      />
    </section>
  );
};

const BillWarning = memo(MemoBillWarning);
export default BillWarning;
