"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BlueTickMobile from "@/assets/bluetick/bluetickmobile.png";
import Engagement from "@/assets/bluetick/engagment.png";
import Conversation from "@/assets/bluetick/Conversation.png";
import SevenDays from "@/assets/bluetick/sevenDays.png";
import Trust from "@/assets/bluetick/trust.png";
import { memo, useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const floatingVariants = {
  float1: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
  float2: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
      delay: 1,
    },
  },
  float3: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
  float4: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
      delay: 2,
    },
  },
};

const MemoBlueTickHero = () => {
  // State to control when animations start
  const [isVisible, setIsVisible] = useState(false);

  // Start animations after component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const openCalendar = useCallback(() => {
    window.open(
      "https://calendly.com/palnesto/1hour",
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  return (
    <section className="bg-[#F9F5EF] my-12 w-full flex flex-col items-center justify-start py-12 relative overflow-hidden">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="text-[#1BA406] font-semibold text-4xl md:text-6xl mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          WhatsApp Blue Tick
        </motion.div>
        <div className="text-[#1BA406] font-semibold text-4xl md:text-6xl leading-tight">
          <motion.span
            className="font-semibold"
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Mark in{" "}
          </motion.span>
          <motion.span
            className="font-semibold"
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            7 days
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{
          duration: 0.5,
          delay: 0.8,
          type: "spring",
          stiffness: 200,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={openCalendar}
          className="bg-[#703BF7] text-white h-14 px-8 rounded-xl mb-4 md:my-6 text-lg font-medium hover:bg-[#5a2ed6] transition-colors"
        >
          Book Free Consultation
          <ArrowRight size={28} className="text-xl" />
        </Button>
      </motion.div>

      <div className="relative flex justify-center items-center mt-12">
        <motion.div
          className="relative bg-[#6532FF50] rounded-3xl p-12 md:px-12 lg:px-36"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Image
            src={BlueTickMobile}
            alt="WhatsApp Blue Tick Mobile"
            width={453}
            height={669}
            className="w-40 h-auto md:w-80 z-10 relative rounded-2xl"
          />
        </motion.div>

        <motion.div
          className="hidden md:block absolute -top-8 -left-64 md:-left-36"
          initial={{ opacity: 0, x: -100, y: -50 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.2,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          variants={floatingVariants}
        >
          <Image
            src={Engagement}
            alt="Engagement"
            width={200}
            height={200}
            className="w-48 h-48 drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          className="hidden md:block absolute -top-4 -right-44 md:-right-36"
          initial={{ opacity: 0, x: 100, y: -50 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.4,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          variants={floatingVariants}
        >
          <Image
            src={Conversation}
            alt="Conversation"
            width={180}
            height={180}
            className="w-48 h-48 drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          className="hidden md:block absolute bottom-[4rem] -left-60 md:-left-36 lg:-left-24"
          initial={{ opacity: 0, x: -100, y: 50 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.6,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          variants={floatingVariants}
        >
          <Image
            src={SevenDays}
            alt="Seven Days"
            width={190}
            height={190}
            className="w-48 h-48 drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          className="hidden md:block absolute bottom-[4rem] md:bottom-[2rem] -right-32"
          initial={{ opacity: 0, x: 100, y: 50 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.8,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          variants={floatingVariants}
        >
          <Image
            src={Trust}
            alt="Trust"
            width={190}
            height={190}
            className="w-48 h-48 drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          className="md:hidden absolute -top-4 -left-8"
          initial={{ opacity: 0, x: -50, y: -25 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.2,
            type: "spring",
            stiffness: 100,
          }}
          variants={floatingVariants}
        >
          <Image
            src={Engagement}
            alt="Engagement"
            width={200}
            height={200}
            className="w-24 h-24 drop-shadow-lg rotate-12"
          />
        </motion.div>

        <motion.div
          className="md:hidden absolute -top-10 -right-0"
          initial={{ opacity: 0, x: 50, y: -25 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.4,
            type: "spring",
            stiffness: 100,
          }}
          variants={floatingVariants}
        >
          <Image
            src={Conversation}
            alt="Conversation"
            width={180}
            height={180}
            className="w-24 h-24 drop-shadow-lg"
          />
        </motion.div>

        <motion.div
          className="md:hidden absolute bottom-8 -left-8"
          initial={{ opacity: 0, x: -50, y: 25 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.6,
            type: "spring",
            stiffness: 100,
          }}
          variants={floatingVariants}
        >
          <Image
            src={SevenDays}
            alt="Seven Days"
            width={190}
            height={190}
            className="w-24 h-24 drop-shadow-lg -rotate-6"
          />
        </motion.div>

        <motion.div
          className="md:hidden absolute bottom-12 -right-4"
          initial={{ opacity: 0, x: 50, y: 25 }}
          animate={isVisible ? { opacity: 1, x: 0, y: 0 } : {}}
          transition={{
            duration: 0.8,
            delay: 1.8,
            type: "spring",
            stiffness: 100,
          }}
          variants={floatingVariants}
        >
          <Image
            src={Trust}
            alt="Trust"
            width={190}
            height={190}
            className="w-24 h-24 drop-shadow-lg "
          />
        </motion.div>
      </div>
    </section>
  );
};

const BlueTickHero = memo(MemoBlueTickHero);
export default BlueTickHero;
