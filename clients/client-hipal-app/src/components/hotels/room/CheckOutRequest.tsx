"use client";
import { memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCircle, Clock, HelpCircle, X } from "lucide-react"
import CommonBottomButton from "@/components/atoms/bottomButton"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import { Button } from "@/components/ui/button"
import { useCheckoutRequest } from "@/components/hooks/useHotel"
import { useMutation } from "@tanstack/react-query"
import { useLogin } from "@/components/store/useLogin"
import { useHotelTemp } from "@/components/store/useHotelTemp"

const MemoCheckOutRequest = ({ businessId }: { businessId: string }) => {

    const userDetails = useLogin((s) => s.userDetails)
    const { isSubmitting, setIsSubmitting, showConfirmation, setShowConfirmation } = useHotelTemp();
    const [isSuccess, setIsSuccess] = useState(false)
    const { checkoutRequest } = useCheckoutRequest();

    const { mutateAsync } = useMutation({
        mutationFn: checkoutRequest,
    })
    const proceedToCheckout = () => {
        setShowConfirmation(true)
    }

    const confirmCheckout = async () => {
        setIsSubmitting(true);
        mutateAsync({
            userId: userDetails?._id,
            businessId: businessId,
        });
    };


    return (
        <article className="max-w-[30rem] mx-auto">
            <CommonBottomButton
                fixed={true}
                maxWidth="30rem"
                buttons={[
                    {
                        text: "Proceed To Checkout",
                        onClick: proceedToCheckout,
                        className: "w-full rounded-md h-[3rem]",
                        swipe: true,
                    },
                ]}
            />

            <BottomPopUp hide height="auto" show={showConfirmation} onClose={() => !isSubmitting && setShowConfirmation(false)}>
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
                            <h2 className="text-xl font-semibold text-green-600 mb-2">Request Sent!</h2>
                            <p className="text-gray-600">The help desk has been notified and will process your checkout request.</p>
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
                                className="absolute right-4 top-4 text-black hover:text-gray-600 rounded-full"
                                disabled={isSubmitting}
                            >
                                <X className="h-5 w-5" />
                            </Button>

                            <div className="p-6 pt-10">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Bell className="h-10 w-10 text-green-500" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold text-center mb-3">Confirm Checkout Request</h2>

                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-700">
                                        Proceeding will send a notification to the help desk. A staff member will process your checkout
                                        request.
                                    </p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start">
                                        <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">
                                            Your request will be processed as soon as possible. You may be contacted for confirmation.
                                        </p>
                                    </div>

                                    <div className="flex items-start">
                                        <HelpCircle className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">
                                            If you have any questions, you can contact the front desk directly.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-gray-300 text-gray-700"
                                        onClick={() => setShowConfirmation(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-[var(--p)] text-white"
                                        onClick={confirmCheckout}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="mr-2">Sending</span>
                                                <span className="animate-pulse">...</span>
                                            </>
                                        ) : (
                                            "Confirm Request"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </BottomPopUp>
        </article>
    )
}

const CheckOutRequest = memo(MemoCheckOutRequest)
export default CheckOutRequest
