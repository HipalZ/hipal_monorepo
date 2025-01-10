import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image";
import React, { memo, useEffect, useState } from 'react'

const MemoTransitionImages = ({ images }: { images: any[] }) => {
    const [currentImage, setCurrentImage] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [images.length]);

    // Slide animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
        }),
        center: {
            x: 0,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
        }),
    };
    return (
        <AnimatePresence custom={currentImage}>
            {images.map((image, index) => (
                index === currentImage && (
                    <motion.div
                        key={image.src}
                        custom={currentImage}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute flex items-center justify-center"
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                    >
                        <Image
                            src={image}
                            alt={`Slide ${index + 1}`}
                            className="object-contain scale-75"
                        />
                    </motion.div>
                )
            ))}
        </AnimatePresence>
    )
}

const TransitionImages = memo(MemoTransitionImages)
export default TransitionImages