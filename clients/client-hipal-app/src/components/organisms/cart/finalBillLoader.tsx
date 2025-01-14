'use client'

import dynamic from 'next/dynamic'
import { memo, useCallback } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Timer, CheckCircle } from 'lucide-react'
import { cn } from '@/components/utils/helpers'
import { usePaymentStore } from '@/components/store/usePaymentStore'
import BillPrint from "@/assets/cart/BillPrint.png";
import KotMachine from "@/assets/cart/KotMachine.png";
import BillImage from "@/assets/call/BillImage.png";
import { useGetBill } from '@/components/hooks/usePayments'

const TransitionImages = dynamic(() => import("./transitionImages"));
const CallTheCaptain = dynamic(() => import('./callTheCaptain'));

const MemoFinalBillLoader = () => {
    const {
        setShowScan,
        displayTimer,
        isButtonDisabled,
    } = usePaymentStore()
    // Bill query
    useGetBill();
    const images = [BillPrint, KotMachine, BillImage]

    const openScanAndPay = useCallback(() => {
        setShowScan(true)
    }, [setShowScan])

    return (
        <div className="flex flex-col items-center p-6 max-w-md mx-auto">
            {/* Animated circle background */}
            <section className="relative bg-[#8DC1F120] w-[250px] aspect-square rounded-full overflow-hidden mb-6">
                <TransitionImages images={images} />
            </section>

            {/* Title and status */}
            <motion.div
                className="text-center space-y-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className={cn("text-2xl font-semibold text-black",
                )}>
                    {isButtonDisabled
                        ? "Getting your final bill!"
                        : "Trouble getting your bill"}
                </h2>
                <p className={cn(isButtonDisabled ? 'text-black' : 'text-red-500', "text-base")}>
                    {isButtonDisabled
                        ? "Your bill is being processed"
                        : "Need assistance? Our captain will help generate your payment QR"}
                </p>
            </motion.div>

            {/* Timer section */}
            <AnimatePresence mode="wait">
                {isButtonDisabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-center gap-2 mb-6"
                    >
                        <Timer className="w-5 h-5 text-black animate-pulse" />
                        <span className="text-lg font-medium text-black">
                            {displayTimer}s remaining
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action button */}
            <motion.div
                className="w-full space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    type="button"
                    onClick={openScanAndPay}
                    className={cn(
                        "relative w-full p-4 rounded-md text-base font-medium transition-all duration-300",
                        isButtonDisabled
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#008800] text-white hover:bg-[#007700] transform hover:scale-[1.02] active:scale-[0.98]"
                    )}
                    disabled={isButtonDisabled}
                >
                    <span className="flex items-center justify-center gap-2">
                        {!isButtonDisabled && <CheckCircle className="w-5 h-5" />}
                        {isButtonDisabled ? "Please wait..." : "Scan and pay"}
                    </span>
                </button>
                {!isButtonDisabled ?
                    <CallTheCaptain />
                    :
                    null}
            </motion.div>
        </div>
    )
}

const FinalBillLoader = memo(MemoFinalBillLoader)
export default FinalBillLoader

