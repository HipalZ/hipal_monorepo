"use client";
import Image from "next/image";
import Trustcred from "@/assets/bluetick/Trustcred.png";
import Star from "@/assets/bluetick/Star.png";
import Popular from "@/assets/bluetick/Popular.png";
import Compare from "@/assets/bluetick/compare.png";
import p1 from "@/assets/bluetick/p1.png";
import p2 from "@/assets/bluetick/p2.png";
import p3 from "@/assets/bluetick/p3.png";
import p4 from "@/assets/bluetick/p4.png";
import p5 from "@/assets/bluetick/p5.png";
import kritaNagar from "@/assets/bluetick/kritanagar.png";
import { motion, useInView } from "framer-motion";
import { memo, useRef } from "react";

const MemoNewWay = () => {
  const logos = [
    { src: p1, alt: "Company 1" },
    { src: p2, alt: "Company 2" },
    { src: p3, alt: "Company 3" },
    { src: p4, alt: "Company 4" },
    { src: p5, alt: "Company 5" },
    { src: kritaNagar, alt: "Company 6" },
  ];

  const cardsRef = useRef(null);
  const isInView = useInView(cardsRef, { once: true, margin: "-100px" });

  const cardData = [
    {
      image: Trustcred,
      title: "Employee Experience First",
      description:
        "Ensuring a helpful remote experience for employees is our top priority. We create a personalized space to discuss when moving your remote talented. Some companies like it.",
      bgColor: "bg-[#323232]",
    },
    {
      image: Star,
      title: "Enable & Support HR Team",
      description:
        "Helping all valuable time and resources of your HR team through our relocation solution allows them to focus on core business duties.",
      bgColor: "bg-[#1E1E1E]",
    },
    {
      image: Popular,
      title: "Scale Your Business with Ease",
      description:
        "Planning to expand your team across borders? Our solution helps scale your business as it grows, making sure your best talent is in the right place at the right time.",
      bgColor: "bg-[#323232]",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "backOut",
        delay: 0.2,
      },
    },
  };

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-12 py-16 bg-[#232323]">
        <div className="mb-16 overflow-hidden">
          <div className="md:hidden">
            <div className="flex animate-scroll gap-8 whitespace-nowrap">
              {logos.map((logo, index) => (
                <div key={`first-${index}`} className="flex-shrink-0">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ))}
              {logos.map((logo, index) => (
                <div key={`second-${index}`} className="flex-shrink-0">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex justify-center md:justify-between items-center gap-8">
            {logos.map((logo, index) => (
              <div key={index} className="flex-shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between pt-12 lg:pt-20 gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight">
              Why Blue
              <br />
              <span className="text-[#703bf7] text-2xl sm:text-3xl md:text-4xl">
                Tick Matters
              </span>
            </h1>
          </div>

          <div className="flex-1 flex justify-center items-center max-w-md lg:max-w-lg xl:max-w-xl">
            <figure className="w-full">
              <Image
                src={Compare}
                alt="WhatsApp Blue Tick Comparison"
                className="w-full h-auto object-contain"
                priority
              />
            </figure>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl text-gray-300 leading-relaxed max-w-md lg:max-w-none mx-auto lg:mx-0">
              WhatsApp Blue Tick verification
              <span className="block mt-2 text-[#703bf7] font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">
                transforms your business communication
              </span>
            </p>
          </div>
        </div>
      </section>

      <header className=" text-black text-center gap-8 mt-16 mb-8 bg-[#f9f5f0] p-4">
        <h1 className="flex flex-col lg:flex-row items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold leading-tight block">
            Unlock Powerful &ensp;
          </span>
          <span className="text-3xl sm:text-4xl font-bold leading-tight block">
            Business Advantages
          </span>
        </h1>
        <p className="text-black text-sm sm:text-base flex justify-center items-center mt-4">
          Get exclusive features that transform your WhatsApp business
          communication
        </p>
      </header>

      <motion.div
        ref={cardsRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-4 sm:px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {cardData.map((card, index) => (
          <motion.article
            key={index}
            className={`p-8 flex flex-col items-center text-center h-full ${card.bgColor} border border-dashed border-gray-600 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300`}
            variants={cardVariants}
            whileHover={{
              y: -10,
              transition: { duration: 0.3 },
            }}
          >
            <motion.div
              className="w-40 h-40 mb-6 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10"
              variants={imageVariants}
            >
              <Image
                src={card.image}
                alt={card.title}
                width={80}
                height={80}
                className="w-20 h-20 object-contain filter drop-shadow-lg"
              />
            </motion.div>

            <motion.h2
              className="text-xl font-bold mb-4 text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              {card.title}
            </motion.h2>

            <motion.p
              className="text-sm text-gray-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            >
              {card.description}
            </motion.p>
          </motion.article>
        ))}
      </motion.div>
    </>
  );
};

const NewWay = memo(MemoNewWay);
export default NewWay;
