"use client"

import Image from 'next/image'
import React, { memo } from 'react'
import { motion } from 'framer-motion'
import SpringConfetti from '@/assets/cart/SpringConfetti.png'
import StockPot from '@/assets/cart/StockPot.png'
import OnlineFoodOrder from "@/assets/cart/OnlineFoodOrder.png"
import dynamic from 'next/dynamic'

const TransitionImages = dynamic(() => import('./transitionImages'), { ssr: false })
const ConfettiHeader = dynamic(() => import('../confettiHeader'), { ssr: false })

const MemoOrderPlaced = () => {
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
                    Yay your order is placed
                </motion.h1>
                <motion.p
                    className='text-[#52525280] text-sm'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    Congratulations your order is been prepared
                </motion.p>
            </motion.div>

            <ConfettiHeader direction="bottom" />
        </center>
    )
}

const OrderPlaced = memo(MemoOrderPlaced)
export default OrderPlaced

