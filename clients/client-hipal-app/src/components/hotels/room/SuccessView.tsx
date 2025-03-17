import Image from "next/image"
import { motion } from "framer-motion"
import SpringConfetti from "@/assets/cart/SpringConfetti.png"
import StockPot from "@/assets/cart/StockPot.png"
import OnlineFoodOrder from "@/assets/cart/OnlineFoodOrder.png"
import ConfettiHeader from "@/components/organisms/confettiHeader"
import TransitionImages from "@/components/organisms/cart/transitionImages"

interface ILinkHotels {
  _id: string
  name: string
  customLink: string
  logo: string
}

interface SuccessViewProps {
  restaurant: ILinkHotels | null
}

export const SuccessView = ({ restaurant }: SuccessViewProps) => {
  const images = [StockPot, OnlineFoodOrder, StockPot]

  return (
    <center>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.8 }}>
        <Image src={SpringConfetti || "/placeholder.svg"} alt="spring confetti" />
      </motion.div>

      <div className="relative bg-[#00880020] w-[250px] mt-24 aspect-square rounded-full overflow-hidden">
        <TransitionImages images={images} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 mt-6 max-w-md px-4"
      >
        <motion.div
          className="text-[#525252] font-semibold text-2xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Success! Your order is sent</h1>

          {restaurant && (
            <p className="text-lg text-gray-700 font-medium">
              Thank you for ordering from <span className="text-[#008800]">{restaurant.name}</span>
            </p>
          )}
        </motion.div>

        <motion.div
          className="text-gray-600 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-[#00880010] p-3 rounded-lg mb-3">
            <p className="font-medium">Estimated delivery window:</p>
            <p className="text-[#008800] font-bold text-lg">30-45 Min</p>
          </div>
        </motion.div>
      </motion.div>

      <ConfettiHeader direction="bottom" />
    </center>
  )
}

