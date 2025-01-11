import React, { memo, useCallback } from 'react'
import BillPrint from "@/assets/cart/BillPrint.png";
import KotMachine from "@/assets/cart/KotMachine.png";
import BillImage from "@/assets/call/BillImage.png";
import TransitionImages from "./transitionImages";
import { motion } from "framer-motion";
import { usePaymentStore } from '@/components/store/usePaymentStore';
import { cn } from '@/components/utils/helpers';

const MemoFinalBillLoader = () => {
    const {
        setShowScan,
        displayTimer,
        isButtonDisabled,
    } = usePaymentStore();
    const images = [BillPrint, KotMachine, BillImage];
    // Scan and pay button handler
    const openScanAndPay = useCallback(() => {
        setShowScan(true);
    }, [setShowScan]);
    return (
        <>
            <center>
                <section className="relative bg-[#8DC1F120] w-[250px] aspect-square rounded-full overflow-hidden">
                    <TransitionImages images={images} />
                </section>
                <motion.div
                    className="poppins-regular w-full max-w-md text-center my-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-semibold text-black">Getting your final bill!</h2>
                    <p className="text-base mt-2 text-purple-500">Hold on while we get your final bill ready.</p>
                </motion.div>
                <div className="poppins-regular my-8 mx-6">
                    <button
                        type="button"
                        onClick={openScanAndPay}
                        className={cn("bg-[#008800] text-white border w-full text-base p-4 rounded-xl", {
                            "cursor-not-allowed": isButtonDisabled,
                        })}
                        disabled={isButtonDisabled}
                    >
                        {isButtonDisabled ? `Scan and pay in ${displayTimer}s` : "Scan and pay"}
                    </button>
                </div>
            </center>
        </>
    )
}

const FinalBillLoader = memo(MemoFinalBillLoader)
export default FinalBillLoader