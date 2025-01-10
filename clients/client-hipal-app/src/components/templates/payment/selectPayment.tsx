'use client'
import { memo, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "react-toastify"
import { cn } from "@/components/utils/helpers"
import QRcodeImg from "@/assets/payment/mobileqr.png"
import HandPay from "@/assets/payment/handcash.png"
import online from "@/assets/payment/mobilepay.png"
import background from "@/assets/payment/background-rainbow.png"
import type { PageStates } from "."
import { usePaymentStore } from "@/components/store/usePaymentStore"
import { _useAllBusiness } from "@/components/store/useAllBusiness";

interface PaymentComponentProps {
  handleCreateOrder: (amount: number, mode: string) => void
  total: number
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  total,
  handleCreateOrder,
}) => {
  const loyalty = _useAllBusiness((s) => s.data?.loyalty)
  const [currentImage, setCurrentImage] = useState<string>(QRcodeImg.src)
  const {
    isLoading,
    billValue,
    selectedMode,
    setSelectedMode,
    merchantDetails,
  } = usePaymentStore((s) => ({
    isLoading: s.isLoading,
    billValue: s.billValue,
    selectedMode: s.selectedMode,
    setSelectedMode: s.setSelectedMode,
    merchantDetails: s.merchantDetails,
  }))

  useEffect(() => {
    const images = [QRcodeImg.src, HandPay.src, online.src]
    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length
      setCurrentImage(images[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const createOrder = useCallback(
    (amount: number, mode: PageStates) => {
      setSelectedMode(mode)
      handleCreateOrder(amount, mode)
    },
    [selectedMode, handleCreateOrder]
  )

  const handleOnlineMode = useCallback(
    (billValue: number) => {
      if (total <= 0) {
        return toast.error(
          "You cannot pay 0 amount through online. Please pay by cash mode"
        )
      }
      if (
        Object.keys(merchantDetails).length === 0 ||
        !merchantDetails?.razorpayMerchantId
      ) {
        return toast.error(
          "Online Pay is not available for this business, pay through offline mode"
        )
      }
      createOrder(billValue, "ONLINE")
    },
    [total]
  )

  return (
    <main className="min-h-screen pt-4 bg-white">
      <header
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          height: "30vh",
          position: "relative",
          maxWidth: "30rem",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <Image
            className="card_up_down"
            src={currentImage}
            alt="Payment method illustration"
            width={200}
            height={200}
          />
        </div>
        {/* <div
          style={{
            position: "absolute",
            bottom: "-13rem",
            left: "50%",
            transform: "translate(-50%, -10%)",
            width: "100vw",
            zIndex: -1,
          }}
        >
          <Image width={480} height={200} src={Grid} alt="Decorative grid pattern" />
        </div> */}
      </header>

      <section className="absolute w-full text-primary" aria-labelledby="payment-heading">
        <div className="text-center space-y-2 pt-4 transform bg-transparent w-full h-[5rem]">
          <h1 id="payment-heading" className="text-black text-2xl">How do you want to settle?</h1>
          <p className="text-sm text-gray-600">
            Choose your payment method and earn loyalty coins
          </p>
        </div>

        <div className="flex w-[92%] gap-4 mx-4 my-6" role="list">
          {/* Cash Payment Option */}
          <article
            className="group w-full max-w-[12.625rem] h-[25rem] relative bg-gray-50 rounded-2xl overflow-hidden shadow-xl transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-black"
            role="listitem"
          >
            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
              {loyalty?.setCashBackPercentage}% Cashback
            </span>

            <div
              style={{
                backgroundImage: `url(${HandPay.src})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="bg-[#EACBBF] rounded-b-[3rem] h-1/2"
              role="img"
              aria-label="Cash payment illustration"
            />

            <div className="px-4 pt-2 space-y-2">
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-medium text-black">
                  Pay Cash to Staff
                </h2>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full p-1"
                  aria-label="Learn more about cash payment loyalty coins"
                  onClick={() => toast.info("Loyalty coins will be added after the captain confirms your payment")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Loyalty coins added after payment confirmation
              </p>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span>Staff will confirm to credit coins</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => createOrder(billValue, "OFFLINE")}
              className="absolute px-4 py-1 w-[90%] text-white bg-black rounded-full bottom-2 left-2 transition-transform group-hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader_spinner !border-t-white" aria-hidden="true" />
              ) : (
                "Pay Cash"
              )}
              <span className="sr-only">
                Pay with cash and receive loyalty coins after staff confirmation
              </span>
            </button>
          </article>

          {/* Online Payment Option */}
          <article
            className="group w-full max-w-[12.625rem] h-[25rem] relative bg-gray-50 rounded-2xl overflow-hidden shadow-xl transition-all hover:shadow-2xl focus-within:ring-2 focus-within:ring-black"
            role="listitem"
          >
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
              {loyalty?.setCashBackPercentage}% Cashback
            </span>

            <div
              style={{
                backgroundImage: `url(${online.src})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="bg-[#F7C846] rounded-b-[3rem] h-1/2"
              role="img"
              aria-label="Online payment illustration"
            />

            <div className="px-4 pt-2 space-y-2">
              <div className="flex items-start justify-between">
                <h2 className="text-sm font-medium text-black">
                  Hassle free & easy payments
                </h2>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-full p-1"
                  aria-label="Learn more about online payment loyalty coins"
                  onClick={() => toast.info("Loyalty coins will be instantly credited after successful payment")}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Instant loyalty coins on payment success
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span>Instantly credited after payment</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOnlineMode(billValue)}
              className={cn(
                "absolute w-[90%] px-4 py-1 text-white bg-black rounded-full bottom-2 left-2 transition-transform group-hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                !merchantDetails?.razorpayMerchantId && "opacity-50 pointer-events-none"
              )}
              disabled={!merchantDetails?.razorpayMerchantId || isLoading}
              aria-disabled={!merchantDetails?.razorpayMerchantId || isLoading}
            >
              {isLoading ? (
                <span className="loader_spinner !border-t-white" aria-hidden="true" />
              ) : (
                "Pay Online"
              )}
              <span className="sr-only">
                Pay online and receive instant loyalty coins after successful payment
              </span>
            </button>
          </article>
        </div>
      </section>
    </main>
  )
}

const MemoPaymentComponent = memo(PaymentComponent)
export default MemoPaymentComponent

