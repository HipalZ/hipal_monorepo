"use client";
import type { TimingType } from "@/components/types/businessData";
import { type FC, memo, useRef } from "react";
import EmblaCarouselPreview from "../category/embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";
import { useSearch } from "@/components/store/useSearch";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface IDishesProps {
  timings: TimingType;
}

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

const MemoMenuBannerPage: FC<IDishesProps> = (props) => {
  const { timings } = props;
  const { isSearchActive } = useSearch();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  if (isSearchActive) return null;

  const circleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  const headingVariants = {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const carouselVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1,
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const backgroundVariants = {
    animate: {
      background: [
        "linear-gradient(90deg, #781714, #781714)",
        "linear-gradient(90deg, #781714, #D4AF37)",
        "linear-gradient(90deg, #D4AF37, #781714)",
      ],
      transition: {
        duration: 10,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <div ref={ref}>
      {Object.keys(timings)?.length > 0 && timings?.dishIds?.length > 0 && (
        <section className="relative flex items-center justify-center w-full bg-[#ffffff] overflow-hidden rounded-t-[2rem] -mt-4">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-[1.5rem] overflow-hidden pb-[2rem] md:pb-[2rem] bg-[#ffffff] relative">
            <motion.h1
              className="relative top-[5rem] z-10 text-[1.75rem] bungee-inline"
              variants={headingVariants}
              initial="initial"
              animate="animate"
            >
              <h3
                style={{
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                  color: "#FFD700",
                  fontWeight: "bold",
                }}
                className="christmas-text"
              >
                {timings?.heading || "Christmas Specials"}
              </h3>
            </motion.h1>
            <motion.div
              className="absolute -top-[2rem] w-[110%] h-[18rem] rounded-full"
              variants={circleVariants}
              initial="initial"
              animate="animate"
              style={{
                originY: 1,
              }}
            >
              <motion.div
                className="w-full h-full rounded-full"
                variants={backgroundVariants}
                animate="animate"
              />
            </motion.div>
            <motion.div
              className="absolute top-0 z-50 w-full h-[18rem]"
              style={{ y: imageY, opacity }}
            >
              <Image
                src="/top.gif"
                alt="Christmas Decorations"
                layout="fill"
                objectFit="cover"
                className="pointer-events-none filter saturate-125 brightness-110"
              />
            </motion.div>
            <motion.div
              variants={carouselVariants}
              initial="initial"
              animate="animate"
              className="mt-[5rem]"
            >
              <EmblaCarouselPreview timings={timings} options={OPTIONS} />
            </motion.div>
          </section>
        </section>
      )}
    </div>
  );
};

const MenuBannerPage = memo(MemoMenuBannerPage);
export default MenuBannerPage;
