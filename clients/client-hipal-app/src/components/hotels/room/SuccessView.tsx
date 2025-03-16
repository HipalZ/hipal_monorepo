import Image from 'next/image'
import { motion } from 'framer-motion'
import SpringConfetti from '@/assets/cart/SpringConfetti.png'
import StockPot from '@/assets/cart/StockPot.png'
import OnlineFoodOrder from "@/assets/cart/OnlineFoodOrder.png"
import { _useAllBusiness } from '@/components/store/useAllBusiness'
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
  const images = [StockPot, OnlineFoodOrder, StockPot];
  return (
    <center>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
      >
        <Image src={SpringConfetti} alt="spring confetti" />
      </motion.div>

      <div className='relative bg-[#00880020] w-[250px] mt-24 aspect-square rounded-full overflow-hidden'>
        <TransitionImages images={images} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-1 mt-6"
      >
        <motion.h1
          className='text-[#525252] font-semibold text-2xl'
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          {restaurant && (
            <p className="mb-3 text-center text-gray-700">
              Your order from <span className="font-medium">{restaurant.name}</span> has been sent.
            </p>
          )}
        </motion.h1>
        <motion.p
          className='text-[#52525280] text-sm'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span>Estimated delivery: 30-45 minutes</span>
        </motion.p>
      </motion.div>

      <ConfettiHeader direction="bottom" />
    </center>
  )
}

