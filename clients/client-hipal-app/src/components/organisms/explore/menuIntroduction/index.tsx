"use client";

import React, { memo, useState, useEffect } from "react";
import Image from "next/image";
import Burger from "@/assets/menuIntro/Burger.png";
import Cola from "@/assets/menuIntro/cola.png";
import Loaf from "@/assets/menuIntro/loaf.png";
import Pizza from "@/assets/menuIntro/pizza.png";
import Sandwhich from "@/assets/menuIntro/sandwhich.png";
import MenuBackground from "@/assets/menuIntro/c.png";
import { cn } from "@/components/utils/helpers";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidChevronRight } from "react-icons/bi";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

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
        top: "-3%",
      };
    case 0:
      return {
        left: "33%",
        transform: "translateX(-30%)",
        right: "auto",
        top: "12%",
      };
    case 1:
      return {
        right: 0,
        left: "auto",
        transform: "none",
        top: "-3%",
      };
    default:
      return {};
  }
}

function MenuIntroduction() {
  const [page, setPage] = useState(0);
  const customLink = useParams()?.businessId || "";
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prevPage) => prevPage + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const shineVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };

  if (outletInfo.outLetType === "OTHER") {
    return null;
  }

  return (
    <section className="relative">
      <div className="absolute w-full h-full">
        <Image
          src={MenuBackground}
          alt="Menu Background"
          className="object-cover"
          width={720}
          height={720}
        />
      </div>
      <div
        style={{
          borderRadius: "50%",
        }}
        className="absolute -top-2 bg-base-100  w-full max-w-[30rem] h-[1rem]"
      />
      <Link
        href={`/${customLink}/category`}
        className="relative flex items-center justify-center w-full h-[22rem] overflow-hidden mt-9 rounded-xl pb-12"
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
                    width={offset === 0 ? 300 : 90}
                    height={offset === 0 ? 300 : 90}
                    className={cn(
                      "object-contain transition-all duration-300 aspect-square ",
                      offset === 0 ? "w-[9.4rem]" : "",
                    )}
                    priority={offset === 0}
                  />
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </Link>
      <Link
        href={`/${customLink}/category`}
        className="flex items-center justify-center w-full"
      >
        <button
          type="button"
          className="h-12 relative overflow-hidden flex items-center px-4 mt-4 text-base font-medium text-center text-white bg-[#A40001] rounded-3xl"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none w-full max-w-[30rem]"
            variants={shineVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 2,
              repeat: Infinity,
              // repeatDelay: 1,
              ease: "backInOut",
            }}
            style={{
              background: "var(--shine-effect)",
            }}
          />
          Checkout menu
          <BiSolidChevronRight strokeWidth={1} size={24} />
        </button>
      </Link>
    </section>
  );
}

export default memo(MenuIntroduction);
