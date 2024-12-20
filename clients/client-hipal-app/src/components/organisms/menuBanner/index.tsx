"use client";
import type { TimingType } from "@/components/types/businessData";
import { type FC, memo, useRef } from "react";
import EmblaCarouselPreview from "../category/embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";
import { useSearch } from "@/components/store/useSearch";
import { motion, useScroll, useTransform, animate } from "framer-motion";
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

  const gradientVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  const headingVariants = {
    initial: {
      y: -20,
      opacity: 0,
      textShadow: "0 0 0px rgba(255, 255, 255, 0)",
    },
    animate: {
      y: 0,
      opacity: 1,
      textShadow: [
        "0 0 4px rgba(255, 255, 255, 0.7)",
        "0 0 8px rgba(255, 255, 255, 0.5)",
        "0 0 4px rgba(255, 255, 255, 0.7)",
      ],
      transition: {
        delay: 0.5,
        duration: 0.8,
        ease: "easeOut",
        textShadow: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        },
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

  return (
    <div ref={ref}>
      {/* <ul className=" lightrope">
        {Array.from({ length: 40 }).map((_, index) => (
          <li key={index}></li>
        ))}
      </ul> */}
      {Object.keys(timings)?.length > 0 && timings?.dishIds?.length > 0 && (
        <section className="relative flex items-center justify-center w-full bg-[#ffffff] overflow-hidden">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-[1.5rem] overflow-hidden pb-[2rem] md:pb-[2rem] bg-[#ffffff] relative">
            <motion.h1
              className="relative -top-[0.5rem] z-20 text-[1.75rem] bungee-inline"
              variants={headingVariants}
              initial="initial"
              animate="animate"
            >
              <p
                style={{
                  textShadow: "0 0 4px #ffffff",
                }}
                className="text-[#CE2222]"
              >
                {timings?.heading || "Specials"}
              </p>
            </motion.h1>
            <motion.div
              className="absolute -top-[5rem] w-[110%] h-[18rem] rounded-full"
              // variants={gradientVariants}
              initial="initial"
              animate="animate"
              // style={{
              //   originY: 1,
              //   background:
              //     "radial-gradient(311.78% 108.64% at 50% -8.64%, #455672 0%, #FFFFFF 100%)",
              // }}
            >
              {/* <motion.div
                className="w-full h-full rounded-full"
                animate={{
                  background: [
                    "radial-gradient(311.78% 108.64% at 50% -8.64%, #455672 0%, #FFFFFF 100%)",
                    "radial-gradient(311.78% 108.64% at 50% -8.64%, #FFFFFF 0%, #455672 100%)",
                    "radial-gradient(311.78% 108.64% at 50% -8.64%, #455672 0%, #FFFFFF 100%)",
                  ],
                }}
              /> */}
            </motion.div>
            {/* <motion.div
              className="absolute top-0 z-10 w-full h-[18rem]"
              style={{ y: imageY, opacity }}
            >
              <Image
                src="/top.gif"
                alt="Top"
                layout="fill"
                objectFit="cover"
                className="pointer-events-none"
              />
            </motion.div> */}
            <motion.div
              variants={carouselVariants}
              initial="initial"
              animate="animate"
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
export { MenuBannerPage };
