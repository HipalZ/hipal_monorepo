"use client"

import { motion } from "framer-motion"
import { CoinsIcon as Coin, Receipt, User } from 'lucide-react'
import { memo } from "react"

interface Extra {
    name: string
    price: number
    quantity: number
}

interface DishItem {
    dish: {
        name: string
        price: number
        quantity: number
    }
    extras: Extra[]
}

interface BillData {
    billing_user_name: string
    serviceCharge: number
    discount: number
    tax: number
    total: number
    customerPhone: string
    customerName: string
    tableName: string
    subTotal: number
    billRequestId: string
    items: DishItem[]
}

const MemoBillPage = ({ billData }: { billData: BillData }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    if (!billData) return <>No Data</>

    return (
        <main className="bg-gray-50 py-8 px-4">
            <motion.div
                className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header Section */}
                <header className="p-4 border-b">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Bill Details</h1>
                            <p className="text-gray-500 text-sm">Bill ID: {billData?.billRequestId || "Id"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-semibold">Table {billData?.tableName || "table"}</p>
                            <p className="text-gray-500 text-sm">Biller: {billData?.billing_user_name || "User"}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <User size={16} />
                            <span>{billData?.customerName || "Customer"}</span>
                        </div>
                    </div>
                </header>

                {/* Coin Promotion */}
                <motion.div
                    className="p-3 bg-amber-50 m-6 rounded-xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-full">
                            <Coin className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900">Earn Coins on this Bill!</h3>
                            <p className="text-sm text-amber-700">Get 1 coin for every rupee spent. Redeem coins on your next visit!</p>
                        </div>
                    </div>
                </motion.div>

                {/* Items List */}
                <motion.section
                    className="p-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                                        <h3 className="font-medium text-gray-500">{item?.dish?.name}</h3>
                                        <p className="text-sm text-gray-500">Quantity: {item?.dish?.quantity}</p>
                                    </div>
                                    <p className="font-medium text-gray-500">₹{item?.dish?.price * item?.dish?.quantity}</p>
                                </div>

                                {item?.extras?.length > 0 && (
                                    <div className="mt-2 pl-4 border-l-2 border-gray-100">
                                        {item?.extras.map((extra, idx) => (
                                            <div key={idx?.toString()} className="flex justify-between text-sm text-gray-600">
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
                    className="p-4 bg-white border-t rounded-b-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{billData?.subTotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Service Charge</span>
                            <span>₹{billData?.serviceCharge}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
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
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>₹{billData?.total}</span>
                        </div>
                    </div>
                </motion.footer>
            </motion.div>
        </main>
    )
}

const BillPage = memo(MemoBillPage)
export default BillPage