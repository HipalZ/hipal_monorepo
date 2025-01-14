'use client'
import { usePaymentStore } from "@/components/store/usePaymentStore"
import useTableData from "@/components/store/useTableData"
import { cn } from "@/components/utils/helpers"
import { motion, AnimatePresence } from "framer-motion"
import { QrCode, Clock, X, AlertCircle } from 'lucide-react'
import { memo, useCallback } from "react"

export const MemoSessionTimeoutBanner = () => {
    const { tableName, tableNameTimeStamp, isVisible, setIsVisible } = useTableData();
    const { setShowScan } = usePaymentStore()
    const openScanner = useCallback(() => {
        setShowScan(true)
    }, [setShowScan])
    return (
        <AnimatePresence>
            {tableName?.length === 0 && tableNameTimeStamp === null && isVisible && (
                <div className="relative bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/20">
                    {/* Animated Warning Line */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%"],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse"
                        }}
                    />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            {/* Left Section with Enhanced Styling */}
                            <div className="flex items-center gap-4 flex-1">
                                <motion.div
                                    className="relative"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 shadow-sm">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    {/* Pulsing Effect */}
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-red-400/20"
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
                                        className="text-lg font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Session Timed Out
                                    </motion.h3>
                                    <motion.p
                                        className="text-base text-gray-600 hidden sm:block font-medium tracking-tight"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Please scan the table QR code to start a new session
                                    </motion.p>
                                </div>
                            </div>

                            {/* Action Buttons with Enhanced Styling */}
                            <div className="flex items-center gap-4 ml-4">
                                <button
                                    type="button"
                                    className={cn(
                                        "hidden sm:inline-flex items-center gap-2",
                                        "bg-gradient-to-r from-orange-600 to-red-600",
                                        "hover:from-orange-700 hover:to-red-700",
                                        "text-white font-medium shadow-lg shadow-orange-600/20",
                                        "transition-all duration-300 transform hover:scale-105"
                                    )}
                                    onClick={openScanner}
                                >
                                    <QrCode className="w-5 h-5" />
                                    Scan QR Code
                                </button>

                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsVisible(false)}
                                    className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                                    aria-label="Dismiss"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Message */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10"
                        aria-hidden="true"
                    >
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    )
}

const SessionTimeoutBanner = memo(MemoSessionTimeoutBanner)
export default SessionTimeoutBanner