"use client";
import { memo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { GiHamburger } from "react-icons/gi";
import { PiCookingPotBold } from "react-icons/pi"
import { useCart } from "@/components/store/useCart";
import { FaHandHoldingUsd } from "react-icons/fa";
import { AiFillDollarCircle } from "react-icons/ai";
import { cn } from "@/components/utils/helpers";
import { HiOutlineShoppingBag } from "react-icons/hi";

const MemoSwipeToPlaceOrder = ({ placeOrder }: { placeOrder: () => void }) => {
    const { cartPage } = useCart()
    const [isComplete, setIsComplete] = useState(false)
    const [showBowlDrop, setShowBowlDrop] = useState(false)
    const x = useMotionValue(0)
    const [showText, setShowText] = useState(true)
    // Animation values
    const width = useTransform(x, [0, 300], ["0%", "100%"])
    const personGlow = useTransform(x, [0, 300], [0, 20])
    const personScale = useTransform(x, [200, 300], [1, 1.1])
    const truckOpacity = useTransform(x, [200, 300], [1, 0])

    const handleDragEnd = () => {
        if (x.get() > 200) {
            // Animate to complete state
            animate(x, 300, { duration: 0.2 })
            setIsComplete(true)
            setShowText(false) // Hide the text
            // Start bowl drop animation after a delay
            setTimeout(() => {
                setShowBowlDrop(true)
            }, 300)

            setTimeout(() => {
                placeOrder?.()
            }, 1500)
        } else {
            // Reset position
            animate(x, 0, { type: "spring", stiffness: 500, damping: 30 })
        }
    }

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative w-full bg-white rounded-full h-[58px] shadow-sm border-2 border-[#008800] overflow-hidden">
                {/* Progress bar */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-green-50"
                    style={{ width }}
                />

                {/* Sliding handle */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 300 }}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={(_, info) => {
                        x.set(info.point.x)
                    }}
                    onDragEnd={handleDragEnd}
                    className="absolute top-0 left-0 flex items-center justify-center w-14 h-14 cursor-grab active:cursor-grabbing"
                    style={{ x }}
                >
                    <motion.div
                        className="flex items-center justify-center w-11 h-11 bg-[#008800] rounded-full shadow-lg"
                        whileTap={{ scale: 0.95 }}
                        style={{ opacity: truckOpacity }}
                    >
                        {cartPage === "confirmPayment" ? <FaHandHoldingUsd className="w-6 h-6 text-white" /> : <GiHamburger className="w-6 h-6 text-white" />}
                    </motion.div>
                </motion.div>

                {/* Text */}
                {showText && (
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full pointer-events-none">
                        <span
                            className={`poppins-regular text-base text-[#008800] transition-opacity ${truckOpacity}`}
                        >
                            {cartPage === "confirmPayment" ? "Slide To Confirm" : "Slide to Place Order"}
                        </span>
                    </div>
                )}

                {/* Person animation */}
                <motion.div
                    className="absolute right-4 top-2 -translate-y-1/2 pointer-events-none"
                    style={{
                        scale: personScale,
                        filter: `drop-shadow(0 0 ${personGlow}px rgb(34 197 94))`
                    }}
                >
                    {cartPage === "confirmPayment" ? <HiOutlineShoppingBag className={`w-10 h-10 ${isComplete ? "text-[#008800]" : "text-black"}`} /> : <PiCookingPotBold
                        className={`w-10 h-10 ${isComplete ? "text-[#008800]" : "text-black"}`}
                    />}
                </motion.div>
            </div>

            {/* Falling bowl animation */}
            {showBowlDrop && (
                <motion.div
                    className={cn(cartPage === "confirmPayment" ? "top-4" : "top-2", "right-[22px] absolute pointer-events-none")}
                    initial={{ y: -50, rotate: -45 }}
                    animate={{
                        y: [-50, 0],
                        rotate: [-45, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        y: {
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                        },
                        rotate: {
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                        }
                    }}
                >
                    {cartPage === "confirmPayment" ? <AiFillDollarCircle className="w-8 h-8 text-[#008800]" /> : <GiHamburger className="w-8 h-8 text-[#008800]" />}
                </motion.div>
            )}
        </div>
    )
}

const SwipeToPlaceOrder = memo(MemoSwipeToPlaceOrder)
export default SwipeToPlaceOrder



