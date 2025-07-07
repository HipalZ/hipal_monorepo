"use client";
import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellDot, CheckCircle, X } from "lucide-react";
import CommonBottomButton from "@/components/atoms/bottomButton";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { Button } from "@/components/ui/button";
import { useCheckoutRequest } from "@/components/hooks/useHotel";
import { useMutation } from "@tanstack/react-query";
import { useLogin } from "@/components/store/useLogin";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import type { IThemes } from "@/components/types/businessData";
import { updateTheme } from "@/components/utils/themes";
import { CardContent } from "@/components/ui/card";

const MemoCheckOutRequest = ({
  businessId,
  themeData,
}: { businessId: string; themeData: IThemes }) => {
  const userDetails = useLogin((s) => s.userDetails);
  const {
    isSubmitting,
    setIsSubmitting,
    showConfirmation,
    setShowConfirmation,
  } = useHotelTemp();
  const [isSuccess, setIsSuccess] = useState(false);
  const { checkoutRequest } = useCheckoutRequest();

  const { mutateAsync } = useMutation({
    mutationFn: checkoutRequest,
  });
  const proceedToCheckout = () => {
    setShowConfirmation(true);
  };

  const confirmCheckout = async () => {
    setIsSubmitting(true);
    mutateAsync({
      userId: userDetails?._id,
      businessId: businessId,
    });
  };
  useEffect(() => {
    updateTheme(themeData);
  }, [themeData]);

  return (
    <article>
      <div className="mx-4 my-3 rounded-xl shadow-lg px-4 py-4 flex items-center border border-blue-300 relative">
        <div className="flex-1 space-y-2">
          <h1 className="font-semibold text-h-primary text-base poppins">
            Fast checkout!
          </h1>
          <p className="font-light text-h-primary text-xs poppins">
            Avoid Long standing queues by initiating
          </p>
        </div>
        <button
          type="button"
          className="text-sm poppins ml-4 flex items-center px-3 py-2 bg-blue-500 text-white rounded-xl font-light transition shadow-lg"
          onClick={proceedToCheckout}
        >
          Checkout
        </button>
      </div>

      <BottomPopUp
        hide
        height="auto"
        show={showConfirmation}
        onClose={() => !isSubmitting && setShowConfirmation(false)}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-green-600 mb-2">
                Request Sent!
              </h2>
              <p className="text-gray-600">
                The help desk has been notified and will process your checkout
                request.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Button
                variant="secondary"
                onClick={() => !isSubmitting && setShowConfirmation(false)}
                className="absolute right-4 top-4 text-black hover:text-gray-600 rounded-xl"
                disabled={isSubmitting}
              >
                <X color="red" />
              </Button>
              <CardContent className="p-0">
                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BellDot className="w-8 h-8 text-primary" />
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-normal text-gray-900 mb-2 inter">
                    Ready to Check Out?
                  </h2>

                  <p className="text-gray-600 mb-6 inter text-sm">
                    We'll notify staff to prepare your checkout
                  </p>
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowConfirmation(false)}
                      disabled={isSubmitting}
                    >
                      Not Yet
                    </Button>
                    <CommonBottomButton
                      fixed={true}
                      maxWidth="30rem"
                      buttons={[
                        {
                          text: "Confirm To Checkout",
                          onClick: confirmCheckout,
                          className: "w-full rounded-xl h-[2.5rem]",
                          swipe: true,
                          disable: isSubmitting,
                        },
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </BottomPopUp>
    </article>
  );
};

const CheckOutRequest = memo(MemoCheckOutRequest);
export default CheckOutRequest;
