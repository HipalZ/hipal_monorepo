'use client'
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { calculateFinalBill } from "@/components/utils/helpers"
import { FaCaretRight } from "react-icons/fa"
import { memo, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { usePayments } from "@/components/hooks/usePayments"
import { usePaymentStore } from "@/components/store/usePaymentStore"
import BillPayment from "@/assets/payment/BillPayment.png"
import HandPayCash from "@/assets/payment/HandCashPay.png";
import Image from "next/image";
import MobileQrCode from "@/assets/payment/MobileQRCode.png";
import PayToCaptain from "@/assets/payment/PayToCaptain.png"
import SmartWatch from "@/assets/payment/SmartWatch.png"
import TransitionImages from "@/components/organisms/cart/transitionImages"
import type { PageStates } from "."

const MemoNewPaymentComponent = () => {
    const { handleCreateOrder } = usePayments()
    const images = [MobileQrCode, HandPayCash, SmartWatch]
    const {
        isLoading,
        billValue,
        claimedCoinz,
        claimCouponz,
        tips,
        setSelectedMode,
        merchantDetails,
    } = usePaymentStore()

    const total =
        calculateFinalBill(
            billValue,
            claimedCoinz,
            claimCouponz,
            tips,
        )

    const createOrder = useCallback(
        (amount: number, mode: PageStates) => {
            setSelectedMode(mode)
            handleCreateOrder(amount, mode)
        },
        [handleCreateOrder, setSelectedMode]
    )

    const handleOnlineMode = useCallback(
        (billValue: number) => {
            if (total <= 0) {
                return toast.error(
                    "You cannot pay 0 amount through online. Please pay by cash mode"
                )
            }
            if (
                Object.keys(merchantDetails).length === 0 ||
                !merchantDetails?.razorpayMerchantId
            ) {
                return toast.error(
                    "Online Pay is not available for this business, pay through offline mode"
                )
            }
            createOrder(billValue, "ONLINE")
        },
        [total]
    )

    return (
        <main className="min-h-screen pt-4 bg-gray-50">
            <section className="relative flex justify-center text-center h-[250px] items-center mt-8 rounded-full overflow-hidden">
                <TransitionImages images={images} />
            </section>
            <section className="w-full text-primary" aria-labelledby="payment-heading">
                <article className="text-center space-y-2 pt-4 transform bg-transparent w-full h-[5rem]">
                    <h1 id="payment-heading" className="text-black text-2xl">Choose mode of payment</h1>
                    <p className="text-sm text-gray-600">
                        Choose your payment method and earn loyalty coins
                    </p>
                </article>

                <div className="flex flex-col gap-4 w-full max-w-md space-y-6 mt-12 mx-auto p-4">
                    {/* Pay to Captain Card */}
                    <motion.button
                        onClick={() => createOrder(billValue, "OFFLINE")}
                        disabled={isLoading}
                        className="w-full bg-[#DE9615] h-[10rem] shadow-xl relative overflow-hidden rounded-2xl disabled:opacity-70"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <article className="relative flex justify-between items-start">
                            <Image src={BillPayment} alt="BillPayment" className="-mt-4" />
                            <section className="px-4 pb-4 space-y-2 mb-2">
                                <h1 className="text-[#5A3A00] font-semibold text-2xl">Pay To Captain</h1>
                                <p className="text-[#845707] poppins-regular text-base">Cash. Cards. Others</p>
                                <div className="flex items-center gap-1 justify-end">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                x: [0, 4, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.2,
                                            }}
                                        >
                                            <FaCaretRight size={24} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                            <div className="inter absolute -bottom-6 h-10 w-full bg-black/20 flex items-center justify-end pr-4">
                                Rewardz after captain confirmation
                            </div>
                        </article>
                    </motion.button>

                    {/* Pay Online Card */}
                    <motion.button
                        onClick={() => handleOnlineMode(billValue)}
                        disabled={!merchantDetails?.razorpayMerchantId || isLoading}
                        className="w-full bg-[#C497DC] shadow-xl h-[10rem] relative overflow-hidden rounded-2xl disabled:opacity-70"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <article className="relative flex justify-between items-start">
                            <Image src={PayToCaptain} alt="PayToCaptain" className="-mt-4" />
                            <section className="px-4 pb-4 space-y-2 mb-2">
                                <h1 className="text-[#5A3A00] font-semibold text-2xl">Pay Online</h1>
                                <p className="text-[#845707] poppins-regular text-base">UPI. Cards. Netbanking</p>
                                <div className="flex items-center gap-1 justify-end">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                x: [0, 4, 0],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.2,
                                            }}
                                        >
                                            <FaCaretRight size={24} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                            <div className="inter absolute -bottom-4 h-10 w-full bg-[#33004E] flex items-center justify-end pr-4">
                                Instant coinz back
                            </div>
                        </article>
                    </motion.button>

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            </section>

        </main>
    )
}

const NewPaymentComponent = memo(MemoNewPaymentComponent)
export default NewPaymentComponent

