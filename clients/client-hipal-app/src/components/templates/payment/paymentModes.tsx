'use client';

import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { calculateFinalBill, cn } from "@/components/utils/helpers";
import { FaCaretRight } from "react-icons/fa";
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { usePayments } from "@/components/hooks/usePayments";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import Image from "next/image";
import TransitionImages from "@/components/organisms/cart/transitionImages";
import BillPayment from "@/assets/payment/BillPayment.png";
import HandPayCash from "@/assets/payment/HandCashPay.png";
import MobileQrCode from "@/assets/payment/MobileQRCode.png";
import PayToCaptain from "@/assets/payment/PayToCaptain.png";
import SmartWatch from "@/assets/payment/SmartWatch.png";

const MemoPaymentModes = () => {
    const { handleCreateOrder } = usePayments();
    const {
        isLoading,
        billValue,
        claimedCoinz,
        claimCouponz,
        tips,
        merchantDetails,
    } = usePaymentStore();

    const total = calculateFinalBill(billValue, claimedCoinz, claimCouponz, tips);

    const offlineMode = useCallback(() => {
        if (total <= 0) {
            return toast.error(
                "You cannot pay 0 amount through online. Please pay by cash mode"
            );
        }
        if (
            Object.keys(merchantDetails).length === 0 ||
            !merchantDetails?.razorpayMerchantId
        ) {
            return toast.error(
                "Online Pay is not available for this business, pay through offline mode"
            );
        }
        handleCreateOrder(billValue, "ONLINE");
    }, [billValue, total, handleCreateOrder, merchantDetails]);

    const paymentMethods = [
        {
            image: BillPayment,
            title: "Pay To Captain",
            description: "Cash. Cards. Others",
            bgColor: "#DE9615",
            footerText: "Rewardz after captain confirmation",
            onClick: () => handleCreateOrder(billValue, "OFFLINE"),
            disabled: isLoading,
        },
        {
            image: PayToCaptain,
            title: "Pay Online",
            description: "UPI. Cards. Netbanking",
            bgColor: "#C497DC",
            footerText: "Instant coinz back",
            onClick: offlineMode,
            disabled: !merchantDetails?.razorpayMerchantId || isLoading,
        },
    ];

    return (
        <main className="min-h-screen pt-4 bg-gray-50">
            {/* Sliding Images */}
            <section className="relative flex justify-center text-center h-[250px] items-center mt-8 rounded-full overflow-hidden">
                <TransitionImages images={[MobileQrCode, HandPayCash, SmartWatch]} />
            </section>

            {/* Payment Options */}
            <section className="w-full text-primary" aria-labelledby="payment-heading">
                <article className="text-center space-y-2 pt-4 bg-transparent w-full h-[5rem]">
                    <h1 id="payment-heading" className="text-black text-2xl">
                        Choose mode of payment
                    </h1>
                    <p className="text-sm text-gray-600">
                        Choose your payment method and earn loyalty coins
                    </p>
                </article>

                <div className="flex flex-col gap-4 w-full max-w-md space-y-6 mt-12 mx-auto p-4">
                    {paymentMethods.map((method, index) => (
                        <motion.button
                            key={index?.toString()}
                            onClick={method.onClick}
                            disabled={method.disabled}
                            className={"w-full h-[10rem] shadow-xl relative overflow-hidden rounded-2xl disabled:opacity-70"}
                            style={{ backgroundColor: method.bgColor }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <article className="relative h-full flex justify-between items-start">
                                <Image src={method.image} alt={method.title} className="-mt-4" />
                                <section className="px-4 pb-4 space-y-2 mb-2 p-2 text-right">
                                    <h1 className="text-[#5A3A00] font-semibold text-xl ">
                                        {method.title}
                                    </h1>
                                    <p className="text-[#845707] poppins-regular text-sm">
                                        {method.description}
                                    </p>
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
                                <div className={cn(`text-[${method?.bgColor}]`, "inter absolute bottom-0 h-10 w-full bg-black/20 flex items-center justify-end pr-4")}>
                                    {method.footerText}
                                </div>
                            </article>
                        </motion.button>
                    ))}
                </div>

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </section>
        </main>
    );
};

const PaymentModes = memo(MemoPaymentModes);
export default PaymentModes;
