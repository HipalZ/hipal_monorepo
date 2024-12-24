"use client";

import React, { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Burger from "@/assets/menuIntro/Burger.png";
import Cola from "@/assets/menuIntro/cola.png";
import Loaf from "@/assets/menuIntro/loaf.png";
import Pizza from "@/assets/menuIntro/pizza.png";
import Sandwhich from "@/assets/menuIntro/sandwhich.png";
import MenuBackground from "@/assets/menuIntro/menuBackground.png";
import Sunlight from "@/assets/Ellipse 1-min.png";
import { cn } from "@/components/utils/helpers";
import Link from "next/link";
import { useParams } from "next/navigation";

const images = [Burger, Cola, Loaf, Pizza, Sandwhich];

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
        transform: "none",
      };
    case 0:
      return {
        left: "33%",
        transform: "translateX(-30%)",
        right: "auto",
      };
    case 1:
      return {
        right: 0,
        left: "auto",
        transform: "none",
      };
    default:
      return {};
  }
}

function MenuIntroduction() {
  const [page, setPage] = useState(0);
  const customLink = useParams()?.businessId || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prevPage) => prevPage + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative">
      <div className="absolute w-full h-full bg-primary">
        <Image src={MenuBackground} alt="Menu Background" layout="fill" />
      </div>
      <Link
        href={`/${customLink}/category`}
        className="relative flex items-center justify-center w-full h-[20rem] overflow-hidden mt-9 rounded-xl pb-12"
      >
        <AnimatePresence initial={false}>
          {[-1, 0, 1].map((offset) => {
            const imageIndex = wrapIndex(page + offset, images.length);
            return (
              <React.Fragment key={offset}>
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
                  className="absolute z-10 flex items-center justify-center h-full mt-12"
                  style={{
                    ...getPositionStyles(offset),
                  }}
                >
                  <Image
                    src={images[imageIndex]}
                    alt={`Menu item ${imageIndex + 1}`}
                    width={offset === 0 ? 300 : 60}
                    height={offset === 0 ? 300 : 60}
                    className={cn(
                      "object-contain transition-all duration-300 aspect-square ",
                      offset === 0 ? "w-[9.4rem]" : "",
                    )}
                    priority={offset === 0}
                  />
                </motion.div>
                <section className="absolute inset-0 z-0 flex items-center justify-center opacity-20">
                  <center className="absolute w-[600px]">
                    <Image
                      className="animate-spin"
                      width={1080}
                      height={1080}
                      src={Sunlight}
                      alt="Sunlight"
                    />
                  </center>
                </section>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </Link>
    </section>
  );
}

export default memo(MenuIntroduction);
