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
import Pay from "@/assets/payment/PayToCaptain.png";
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
        billData,
    } = usePaymentStore();

    const total = calculateFinalBill(billValue, claimedCoinz, claimCouponz, tips);

    const paymentMode = useCallback(() => {
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
            image: Pay,
            title: "Pay Online",
            description: "UPI. Cards. Netbanking",
            bgColor: "#C497DC",
            footerText: "Instant coinz back",
            onClick: paymentMode,
            disabled: !merchantDetails?.razorpayMerchantId || !billData?.total || isLoading,
        },
        {
            image: BillPayment,
            title: "Pay To Captain",
            description: "Cash. Cards. Others",
            bgColor: "#DE9615",
            footerText: "Rewardz after captain confirmation",
            onClick: () => handleCreateOrder(billValue, "OFFLINE"),
            disabled: isLoading,
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
                    <h1 id="payment-heading" className="text-2xl text-black">
                        Choose mode of payment
                    </h1>
                    <p className="text-sm text-gray-600">
                        Choose your payment method and earn loyalty coins
                    </p>
                </article>

                <div className="flex flex-col w-full max-w-md gap-4 p-4 mx-auto mt-12 space-y-6">
                    {paymentMethods.map((method, index) => (
                        !method.disabled && (
                            <motion.button
                                key={index?.toString()}
                                onClick={method.onClick}
                                disabled={method.disabled}
                                className={"w-full h-[10rem] shadow-xl relative overflow-hidden rounded-2xl disabled:opacity-70"}
                                style={{ backgroundColor: method.bgColor }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <article className="relative flex items-start justify-between h-full">
                                    <Image src={method.image} alt={method.title} className="-mt-4" />
                                    <section className="p-2 px-4 pb-4 mb-2 space-y-2 text-right">
                                        <h1 className="text-[#5A3A00] font-semibold text-xl ">
                                            {method.title}
                                        </h1>
                                        <p className="text-[#845707] poppins-regular text-sm">
                                            {method.description}
                                        </p>
                                        <div className="flex items-center justify-end gap-1">
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
                        )
                    ))}
                </div>

                {/* Loading Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                        <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    </div>
                )}
            </section>
        </main>
    );
};

const PaymentModes = memo(MemoPaymentModes);
export default PaymentModes;
