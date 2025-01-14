"use client"

import { motion } from "framer-motion"
import { CoinsIcon as Coin, Receipt, User } from 'lucide-react'
import { memo } from "react"
import { Coins, Gift } from 'lucide-react'
import useLoyaltyData from "@/components/store/useLoyaltyData"
import dynamic from "next/dynamic"
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader"
import { usePaymentStore } from "@/components/store/usePaymentStore"
const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
    ssr: false,
    loading: () => <SkeletonLoader height={200} />,
});

const MemoBillPage = () => {
    const { loyaltySetting } = useLoyaltyData();
    const { showBillPage, setShowBillPage, billData } = usePaymentStore();
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <BottomPopUp bottomCross hide show={showBillPage} onClose={() => setShowBillPage(false)}>
            <main className="bg-white">
                <motion.div
                    className="max-w-2xl mx-auto rounded-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header Section */}
                    <header className="p-4 rounded-t-lg">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Bill Details</h1>
                                <p className="text-black text-sm">Bill ID: {billData?.billRequestId || "Id"}</p>
                            </div>
                            <div className="text-right text-[#008800]">
                                <p className="text-lg font-semibold">Table {billData?.tableName || "table"}</p>
                                <p className="text-sm text-black">Biller: {billData?.billing_user_name || "User"}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 text-sm text-black">
                            <div className="flex items-center gap-1">
                                <User size={16} />
                                <span>{billData?.customerName || "Customer"}</span>
                            </div>
                        </div>
                    </header>

                    {loyaltySetting?.loyaltyId && <motion.div
                        className="w-full max-w-md mx-auto p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-3 border border-amber-200">
                            {/* Coin Value Proposition */}
                            <div className="flex items-center gap-4 mb-6">
                                <motion.div
                                    className="relative"
                                    initial={{ rotate: -10 }}
                                    animate={{ rotate: 10 }}
                                    transition={{
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                        duration: 1.5
                                    }}
                                >
                                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">₹1</span>
                                    </div>
                                    <motion.div
                                        className="absolute -right-1 -bottom-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1.1 }}
                                        transition={{
                                            repeat: Number.POSITIVE_INFINITY,
                                            repeatType: "reverse",
                                            duration: 1.5
                                        }}
                                    >
                                        <Coins className="w-4 h-4 text-white" />
                                    </motion.div>
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-amber-900">
                                        1 Rupee = 1 Coin
                                    </h3>
                                    <p className="text-amber-700 text-sm">
                                        Earn coins equal to your bill amount!
                                    </p>
                                </div>
                            </div>

                            {/* Process Steps */}
                            <div className="space-y-4">
                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                                        <Gift className="w-5 h-5 text-amber-700" />
                                    </div>
                                    <p className="text-sm text-amber-900">
                                        <span className="font-semibold">Redeem</span>
                                        <span className="text-amber-700"> for amazing rewards!</span>
                                    </p>
                                </motion.div>
                            </div>

                        </div>
                    </motion.div>}

                    {/* Items List */}
                    <motion.section
                        className="mx-4 p-4 border-t border-x rounded-t-2xl"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        <h2 className="text-black text-lg font-semibold mb-4 flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Order Details
                        </h2>

                        <div className="space-y-4">
                            {billData.items.map((item, index) => (
                                <motion.article
                                    key={index?.toString()}
                                    variants={item}
                                    className="border-b last:border-0 pb-4 last:pb-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-black">{item?.dish?.name}</h3>
                                            <p className="text-sm text-black">Quantity: {item?.dish?.quantity}</p>
                                        </div>
                                        <p className="font-medium text-black">₹{item?.dish?.price * item?.dish?.quantity}</p>
                                    </div>

                                    {item?.extras?.length > 0 && (
                                        <div className="mt-2 pl-4 border-l-2 border-gray-100">
                                            {item?.extras.map((extra, idx) => (
                                                <div key={idx?.toString()} className="flex justify-between text-sm text-black">
                                                    <span>+ {extra?.name}</span>
                                                    <span>₹{extra?.price * extra?.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.article>
                            ))}
                        </div>
                    </motion.section>

                    {/* Bill Summary */}
                    <motion.footer
                        className="mx-4 p-4 bg-white border rounded-b-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="space-y-2">
                            <div className="flex justify-between text-black">
                                <span>Subtotal</span>
                                <span>₹{billData?.subTotal}</span>
                            </div>
                            <div className="flex justify-between text-black">
                                <span>Service Charge</span>
                                <span>₹{billData?.serviceCharge}</span>
                            </div>
                            <div className="flex justify-between text-black">
                                <span>Tax</span>
                                <span>₹{billData?.tax}</span>
                            </div>
                            {billData?.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{billData?.discount}</span>
                                </div>
                            )}
                            <div className="h-px bg-gray-200 my-2" />
                            <div className="text-black flex justify-between text-lg">
                                <span className="font-bold">Total</span>
                                <span className="font-bold">₹{billData?.total}</span>
                            </div>
                        </div>
                    </motion.footer>
                </motion.div>
            </main>
        </BottomPopUp>
    )
}

const BillPage = memo(MemoBillPage)
export default BillPage