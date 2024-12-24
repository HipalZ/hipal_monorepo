"use client";
import type { TimingType } from "@/components/types/businessData";
import { type FC, memo, useRef } from "react";
import EmblaCarouselPreview from "../category/embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";
import { useSearch } from "@/components/store/useSearch";
import { motion } from "framer-motion";

interface IDishesProps {
  timings: TimingType;
}

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

const MemoMenuBannerPage: FC<IDishesProps> = (props) => {
  const { timings } = props;
  console.log(timings);
  const { isSearchActive } = useSearch();
  const ref = useRef(null);

  if (isSearchActive) return null;

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
