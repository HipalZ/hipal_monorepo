"use client"

import Image from 'next/image'
import React, { memo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SpringConfetti from '@/assets/cart/SpringConfetti.png'
import StockPot from '@/assets/cart/StockPot.png'
import OnlineFoodOrder from "@/assets/cart/OnlineFoodOrder.png"
import ConfettiHeader from '../confettiHeader'
import { useCart } from '@/components/store/useCart'

const MemoOrderPlaced = () => {
    const [currentImage, setCurrentImage] = useState<'pot' | 'order'>('pot')
    const { setOrderPlaced } = useCart();
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage(prev => prev === 'pot' ? 'order' : 'pot')
        }, 1500)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            setOrderPlaced(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [setOrderPlaced]);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
        }),
        center: {
            x: 0
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
        })
    }

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
                <AnimatePresence custom={currentImage === 'pot' ? -1 : 1}>
                    {currentImage === 'pot' ? (
                        <motion.div
                            key="pot"
                            custom={-1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 flex items-center justify-center"
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                        >
                            <Image
                                src={StockPot}
                                alt="stock pot"
                                className="object-contain"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="order"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="absolute inset-0 flex items-center justify-center"
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                        >
                            <Image
                                src={OnlineFoodOrder}
                                alt="online food order"
                                className="object-contain"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
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
                    Congratulation your order is been prepared
                </motion.p>
            </motion.div>

            <ConfettiHeader direction="bottom" />
        </center>
    )
}

const OrderPlaced = memo(MemoOrderPlaced)
export default OrderPlaced

