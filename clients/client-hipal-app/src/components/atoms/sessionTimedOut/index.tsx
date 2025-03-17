'use client';
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { usePaymentStore } from "@/components/store/usePaymentStore"
import useTableData from "@/components/store/useTableData"
import { motion, AnimatePresence } from "framer-motion"
import { QrCode, X, AlertCircle } from 'lucide-react';
import { usePathname } from "next/navigation";
import { memo, useCallback } from "react"

export const MemoSessionTimeoutBanner = () => {
    const pathName = usePathname()
    const outletInfo = _useAllBusiness((s)=>s.data?.outletInfo)
    const { tableName, tableNameTimeStamp, isVisible, setIsVisible } = useTableData();
    const { setShowScan } = usePaymentStore()
    const openScanner = useCallback(() => {
        setShowScan(true)
    }, [setShowScan])
    const shouldShowSessionTimedOut = (
        tableName?.length === 0 &&
        tableNameTimeStamp === null &&
        isVisible && !pathName?.includes("ebill") &&
        !pathName?.includes("posPayment") &&
        !pathName?.includes("review") && !pathName.includes("HOTEL")
    );
    return (
        <AnimatePresence >
            {shouldShowSessionTimedOut ? (
                <div className="fixed w-full top-0 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-md shadow-lg z-50">
                    {/* Animated Warning Line */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse"
                        }}
                    />

                    <div className="max-w-7xl mx-auto px-2 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            {/* Left Section with Enhanced Styling */}
                            <div className="flex items-center gap-4 flex-1">
                                <motion.div
                                    className="relative"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-md">
                                        <AlertCircle className="w-6 h-6 text-purple-600" />
                                    </div>
                                    {/* Pulsing Effect */}
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-purple-400/20"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.2, 0, 0.2],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                        }}
                                    />
                                </motion.div>

                                <div className="min-w-0 flex-1">
                                    <motion.h3
                                        className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Session Timed Out
                                    </motion.h3>
                                </div>
                            </div>

                            {/* Action Buttons with Enhanced Styling */}
                            <div className="flex items-center gap-4 ml-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={openScanner}
                                    className="text-sm inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-white font-medium
                          bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                          shadow-lg shadow-purple-500/20 transition-all duration-200"
                                >
                                    <QrCode className="w-5 h-5" />
                                    <span>Scan</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsVisible(false)}
                                    className="rounded-full p-2 hover:bg-purple-50 transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X className="w-6 h-6 text-purple-600" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-purple-900/5 backdrop-blur-sm -z-10"
                        aria-hidden="true"
                    />
                </div>
            )
                : null}
        </AnimatePresence >
    )
}

const SessionTimeoutBanner = memo(MemoSessionTimeoutBanner)
export default SessionTimeoutBanner