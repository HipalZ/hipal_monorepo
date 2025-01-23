"use client";

import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useMemo, useCallback } from "react";
import { QrCode, Clock } from 'lucide-react';
import FoodType from "@/components/atoms/foodType";
import { format } from 'date-fns';
import { usePaymentStore } from "@/components/store/usePaymentStore"
import { cn } from "@/components/utils/helpers";
import NoBillFound from "./noBill";

const MemoEBill = () => {
    const searchParams = useSearchParams();
    const tableId = searchParams?.get("tableId");
    const { setShowScan } = usePaymentStore()
    const openScanner = useCallback(() => {
        setShowScan(true)
    }, [setShowScan])
    const getEBill = async () => {
        const response = await apiRpc.kot.table_kot[":tableId"].$get({
            param: {
                tableId,
            },
        });
        const res = await response.json();
        return res?.data || [];
    };

    const { data: cartHistory = [], isPending } = useQuery({
        queryKey: ["eBill"],
        queryFn: getEBill,
        enabled: !!tableId,
    });

    const allCartItems = useMemo(() => cartHistory.flatMap(order => order.cart), [cartHistory]);

    console.log("allCartItems", allCartItems);

    return (
        <main className="min-h-screen  pb-20 bg-gray-50">
            {isPending ? <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div> :
                <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
                    {/* Header */}
                    <header className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-semibold text-gray-900">E-Bill</h1>
                        </div>
                        {cartHistory[0] && (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-900">
                                <Clock className="w-4 h-4" />
                                <time dateTime={cartHistory[0].createdAt}>
                                    {format(new Date(cartHistory[0].createdAt), 'PPpp')}
                                </time>
                            </div>
                        )}
                    </header>

                    {/* Order Info */}
                    {cartHistory[0] && (
                        <article className="flex justify-between items-center bg-white rounded-lg text-black px-4 py-3 shadow-sm border border-gray-100">
                            <span>Table {cartHistory[0].tableName}</span>
                            <button
                                type="button"
                                className={cn(
                                    "inline-flex items-center gap-2 transition-all duration-300 transform hover:scale-105 text-black"
                                )}
                                onClick={openScanner}
                            >
                                <QrCode className="w-5 h-5" />
                                Scan To Pay
                            </button>
                        </article>
                    )}

                    {/* Items List */}
                    <section className="space-y-3">
                        <AnimatePresence mode="wait">
                            {allCartItems?.length > 0 ? allCartItems.map((item, index) => (
                                <motion.article
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 pt-1">
                                            <FoodType types={item.dish.dishTypes} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-medium text-gray-900">
                                                {item.dish.name}
                                            </h3>
                                            <div className="mt-1 space-y-1">
                                                {item.portion && (
                                                    <p className="italic text-sm text-gray-600">
                                                        {item.portion.name}
                                                        <span className="text-gray-500 ml-1">
                                                            (₹{item.portion.price})
                                                        </span>
                                                    </p>
                                                )}
                                                {item.extras.length > 0 && (
                                                    <p className="italic text-sm text-gray-600">
                                                        Add-ons: {item.extras.map(e => (
                                                            <span key={e.name} className="text-gray-500">
                                                                {e.name} (₹{e.price})
                                                            </span>
                                                        )).reduce((prev, curr) => [prev, ', ', curr])}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                            <div className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-full">
                                                × {item.quantity}
                                            </div>
                                            <p className="text-base font-semibold text-gray-900">
                                                ₹{((item.dish.price + (item.portion?.price || 0) +
                                                    item.extras.reduce((acc, e) => acc + e.price, 0)) *
                                                    item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.article>
                            )) : <NoBillFound />}
                        </AnimatePresence>
                    </section>

                    {/* Footer */}
                    <center className="fixed space-grotesk-700 bottom-0 left-0 right-0 p-4 text-center backdrop-blur-sm">
                        <strong className="text-gray-900 text-base">Powered by Hipalz</strong>
                    </center>
                </div>
            }
        </main>
    );
};

const EBill = memo(MemoEBill);
export default EBill;

