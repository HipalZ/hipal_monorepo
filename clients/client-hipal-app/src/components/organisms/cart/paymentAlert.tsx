"use client"

import { memo, useCallback } from "react"
import { motion } from "framer-motion"
import { FaExclamationTriangle, FaShoppingBag, FaCreditCard } from "react-icons/fa"
import { useCart } from "@/components/store/useCart"

const MemoPaymentAlert = ({ onClick }: { onClick: () => void }) => {
  const { setCartPage, setShowCart } = useCart()

  const proceedToPayment = () => {
    setCartPage("payment")
    onClick()
  }

  const orderMore = useCallback(() => {
    onClick()
    setShowCart(false)
  }, [setShowCart, onClick])

  return (
    <>
      <div className="bg-red-500 m-6 p-6 text-white text-center">
        <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4 text-white" />
        <h2 className="text-2xl font-bold mb-2">Warning: Order Finalization</h2>
        <p className="text-white/90">Please review before proceeding</p>
      </div>
      <div className="flex flex-col justify-center mt-10">
        {/* Warning Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md rounded-3xl overflow-hidden bg-white"
        >
          {/* Warning Points */}
          <div className="p-6 space-y-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex items-center gap-3 p-4 bg-red-50 rounded-lg"
              >
                <FaShoppingBag className="w-6 h-6 text-red-500" />
                <p className="text-red-700">No more items can be added to this order</p>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mt-3"
              >
                <FaCreditCard className="w-6 h-6 text-red-500" />
                <p className="text-red-700">Your friends won't be able to place new orders</p>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={proceedToPayment}
                className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Continue to Payment
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={orderMore}
                className="w-full py-4 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors"
              >
                Go Back & Order More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

const PaymentAlert = memo(MemoPaymentAlert)
export default PaymentAlert

