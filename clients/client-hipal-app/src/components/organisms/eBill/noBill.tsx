import { motion } from "framer-motion"
import { CheckCircle2, ShoppingCart } from "lucide-react";

export default function NoBillFound() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white rounded-lg shadow-sm border border-gray-100"
        >
            <div className="relative">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center"
                >
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                </motion.div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="absolute -top-1 -right-1"
                >
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                </motion.div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">No Active Orders</h3>
                <p className="text-sm text-gray-500 max-w-[250px]">
                    Your bill might have been settled or your session has expired
                </p>
            </div>
        </motion.div>
    )
}

