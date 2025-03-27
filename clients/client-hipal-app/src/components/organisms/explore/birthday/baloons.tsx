import React, { memo } from 'react'
import { motion } from "framer-motion"
import Image from 'next/image'
import baloons from "@/assets/img/baloonsCombo.png"

const MemoBaloons = () => {
    const windowSize = typeof window !== "undefined" ? window.innerHeight : 800
    return (
        <>
            <div className="absolute inset-0 w-full pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i?.toString() || ""}
                        className="absolute"
                        initial={{
                            y: windowSize || 800, // Start below the screen
                            opacity: 0, // Start invisible
                        }}
                        animate={{
                            y: -100, // Move completely to the top
                            opacity: [0, 1, 1, 0], // Fade in and fade out naturally
                        }}
                        transition={{
                            duration: 2 + i, // Different speeds for variation
                            ease: "linear",
                        }}
                        style={{
                            left: `${(i + 1) * 12}%`, // Distribute balloons evenly
                        }}
                    >
                        <Image src={baloons} alt="balloons" width={100} height={100} />
                    </motion.div>
                ))}
            </div>
        </>
    )
}

const Baloons = memo(MemoBaloons)
export default Baloons