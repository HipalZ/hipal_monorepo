import { memo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { FaCaretRight } from "react-icons/fa"
import BottomPopUp from "@/components/atoms/bottomPopUp"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePaymentStore } from "../../store/usePaymentStore"
import { useJewelleryOfflinePaymentFlow, useJewelleryOnlinePaymentFlow } from "../../hooks/useOrderCreate"
import TransitionImages from "../../organisms/cart/transitionImages"
import BillPayment from "@/assets/payment/BillPayment.png";
import HandPayCash from "@/assets/payment/HandCashPay.png";
import MobileQrCode from "@/assets/payment/MobileQRCode.png";
import Pay from "@/assets/payment/PayToCaptain.png";
import SmartWatch from "@/assets/payment/SmartWatch.png";

interface PaymentFooterProps {
  total: number
  disabled?: boolean
}

const PaymentFooterComponent = ({ total,  disabled = false }: PaymentFooterProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const merchantDetails = usePaymentStore((s) => s.merchantDetails)
  const { handlePayment } = useJewelleryOnlinePaymentFlow()
  const { handleOfflinePayment} = useJewelleryOfflinePaymentFlow()

  const handlePayClick = useCallback(() => {
    try {
      if (total <= 0) {
        console.warn("Cannot process payment: invalid total amount")
        return
      }
      setShowPaymentModal(true)
    } catch (error) {
      console.error("Error opening payment modal:", error)
    }
  }, [total])

  const handleOnlinePayment = useCallback(() => {
    if (total <= 0) {
      return
    }
    if (!merchantDetails?.razorpayMerchantId) {
      return
    }
    handlePayment()
    setShowPaymentModal(false)
  }, [total, merchantDetails, handlePayment])

  const handleOfflinePaymentClick = useCallback(() => {
    handleOfflinePayment()
    setShowPaymentModal(false)
  }, [handleOfflinePayment])

  const handleCloseModal = useCallback(() => {
    setShowPaymentModal(false)
  }, [])

  const safeTotal = typeof total === "number" && !Number.isNaN(total) ? total : 0

  const paymentMethods = [
    {
      title: "Pay Online",
      description: "UPI. Cards. Netbanking",
      bgColor: "#C497DC",
      footerText: "Instant coinz back",
      onClick: handleOnlinePayment,
      disabled: !merchantDetails?.razorpayMerchantId ,
      image: Pay,
    },
    {
      title: "Pay To Captain",
      description: "Cash. Cards. Others",
      bgColor: "#DE9615",
      footerText: "Rewardz after captain confirmation",
      onClick: handleOfflinePaymentClick,
      image: BillPayment,
    },
  ]

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg poppins-regular">
        <Button
          onClick={handlePayClick}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg poppins-semibold"
          size="lg"
          disabled={disabled || safeTotal <= 0}
        >
          Pay ₹{safeTotal.toFixed(2)}
        </Button>
      </div>

      {showPaymentModal && (
        <BottomPopUp rightTopBack hide show={showPaymentModal} onClose={handleCloseModal} height="100dvh">
          <div className="bg-gray-50 poppins-regular pt-12 h-[100dvh] overflow-y-auto">
            <section className="relative flex justify-center text-center h-[200px] items-center rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
              <TransitionImages images={[MobileQrCode, HandPayCash, SmartWatch]} />
            </section>

            <article className="text-center space-y-2 pt-6 pb-4 bg-transparent w-full">
              <h1 className="text-2xl text-black poppins-semibold">Choose mode of payment</h1>
              <p className="text-sm text-gray-600 poppins-regular">Choose your payment method and earn loyalty coins</p>
            </article>

            <div className="flex flex-col w-full gap-4 p-4 pb-6">
              {paymentMethods.map((method, index) => (
                <motion.button
                  key={index}
                  onClick={method.onClick}
                  disabled={method.disabled}
                  className={cn(
                    "w-full h-[10rem] shadow-xl relative overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  style={{ backgroundColor: method.bgColor }}
                  whileHover={{ scale: method.disabled ? 1 : 1.02 }}
                  whileTap={{ scale: method.disabled ? 1 : 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <article className="relative flex items-start justify-between h-full">
                    <div className="relative w-[120px] h-full flex items-center justify-center">
                      <Image
                        src={method.image}
                        alt={method.title}
                        width={120}
                        height={160}
                        className="object-contain"
                      />
                    </div>

                    {/* Right side - Content */}
                    <section className="flex-1 p-4 pr-6 pb-4 space-y-2 text-right flex flex-col justify-between h-full">
                      <div className="space-y-2 mt-4">
                        <h1 className="text-[#5A3A00] font-semibold text-xl poppins-semibold">{method.title}</h1>
                        <p className="text-[#845707] poppins-regular text-sm">{method.description}</p>
                      </div>

                      {/* Animated arrows */}
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
                            <FaCaretRight size={24} className="text-[#5A3A00]" />
                          </motion.div>
                        ))}
                      </div>
                    </section>

                    {/* Footer overlay */}
                    <div
                      className={cn(
                        "text-white poppins-regular absolute bottom-0 h-10 w-full bg-black/20 flex items-center justify-end pr-4 text-sm",
                      )}
                    >
                      {method.footerText}
                    </div>
                  </article>
                </motion.button>
              ))}
            </div>

          </div>
        </BottomPopUp>
      )}
    </>
  )
}

export const PaymentFooter = memo(PaymentFooterComponent)
