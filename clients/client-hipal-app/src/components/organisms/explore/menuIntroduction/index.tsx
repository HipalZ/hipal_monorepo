"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Burger from "@/assets/menuIntro/Burger.png";
import Cola from "@/assets/menuIntro/cola.png";
import Loaf from "@/assets/menuIntro/loaf.png";
import Pizza from "@/assets/menuIntro/pizza.png";
import Sandwhich from "@/assets/menuIntro/sandwhich.png";
import MenuBackground from "@/assets/menuIntro/menuBackground.png";

const images = [Burger, Cola, Loaf, Pizza, Sandwhich];

// Safely wrap negative or large page offsets
function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

const variants = {
  enter: { x: "100%", opacity: 0, scale: 0.5 },
  center: { x: "0%", opacity: 1, scale: 1 },
  exit: { x: "-100%", opacity: 0, scale: 0.5 },
};

function getPositionStyles(offset: number) {
  switch (offset) {
    case -1:
      return {
        left: 0,
        right: "auto",
        top: "10%",
        transform: "none",
      };
    case 0:
      return {
        left: "25%",
        transform: "translateX(-30%)",
        right: "auto",
      };
    case 1:
      return {
        right: 0,
        left: "auto",
        top: "10%",
        transform: "none",
      };
    default:
      return {};
  }
}

function MenuIntroduction() {
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prevPage) => prevPage + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative ">
      <div className="absolute w-full h-full bg-primary">
        <Image src={MenuBackground} alt="Menu Background" layout="fill" />
      </div>
      <div className="relative flex items-center justify-center w-full h-[15rem] overflow-hidden mt-9 rounded-xl pb-12">
        <AnimatePresence initial={false}>
          {[-1, 0, 1].map((offset) => {
            const imageIndex = wrapIndex(page + offset, images.length);
            return (
              <motion.div
                key={`${imageIndex}-${offset}`}
                custom={offset}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 90, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { type: "spring", stiffness: 90, damping: 30 },
                }}
                className="absolute flex items-center justify-center h-full"
                style={{
                  ...getPositionStyles(offset),
                }}
              >
                <Image
                  src={images[imageIndex]}
                  alt={`Menu item ${imageIndex + 1}`}
                  width={offset === 0 ? 200 : 80}
                  height={offset === 0 ? 200 : 80}
                  className="object-contain transition-all duration-300"
                  priority={offset === 0}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default memo(MenuIntroduction);
