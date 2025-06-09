"use client";
import { motion, useInView } from "framer-motion";
import { memo, useRef } from "react";
import { Medal, CheckCircle, TrendingUp, Shield, Zap } from "lucide-react";
import Image from "next/image";
import mobile from "@/assets/bluetick/flowermobile.png";

const MemoCompetentTalent = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Shield,
      title: "Instant Trust",
      description:
        "Customers trust verified businesses 3x more than unverified ones",
      stat: "3x More Trust",
    },
    {
      icon: TrendingUp,
      title: "Higher Engagement",
      description: "Verified accounts see 70% more customer interactions",
      stat: "70% More Engagement",
    },
    {
      icon: Medal,
      title: "Professional Credibility",
      description: "Stand out from competitors with official verification",
      stat: "100% Authentic",
    },
    {
      icon: Zap,
      title: "Better Reach",
      description: "WhatsApp prioritizes verified business messages",
      stat: "Priority Delivery",
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

  const leftSectionVariants = {
    hidden: {
      opacity: 0,
      x: -100,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const rightSectionVariants = {
    hidden: {
      opacity: 0,
      x: 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const featureVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const mobileImageVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      rotate: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.5,
      },
    },
  };

  const badgeVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut",
        delay: 0.3,
      },
    },
  };

  const titleVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4,
      },
    },
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-16 pb-16" ref={sectionRef}>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-12 items-center max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div
          className="flex justify-center lg:justify-start"
          variants={leftSectionVariants}
        >
          <div
            style={{
              borderRadius: "0 50% 0 0",
            }}
            className="relative w-[20rem] h-[28rem] sm:w-[24rem] sm:h-[32rem] md:w-[28rem] md:h-[36rem] lg:w-[22rem] lg:h-[28rem] xl:w-[28rem] xl:h-[36rem] 2xl:w-[35rem] 2xl:h-[44rem] bg-[#6532FF] z-0 overflow-hidden"
          >
            <motion.div
              className="absolute w-[5rem] h-[10rem] sm:w-[6rem] sm:h-[12rem] md:w-[8rem] md:h-[16rem] lg:w-[6rem] lg:h-[12rem] xl:w-[8rem] xl:h-[16rem] 2xl:w-[10rem] 2xl:h-[20rem] left-0 bg-[#F9F5F0] top-0 z-10"
              initial={{ x: -100, opacity: 0 }}
              animate={
                isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }
              }
              transition={{ duration: 0.8, delay: 0.2 }}
            />
            <motion.div
              className="absolute w-[10rem] h-[5rem] sm:w-[12rem] sm:h-[6rem] md:w-[16rem] md:h-[8rem] lg:w-[12rem] lg:h-[6rem] xl:w-[16rem] xl:h-[8rem] 2xl:w-[20rem] 2xl:h-[10rem] left-0 bg-[#6532FF] top-0 z-20 rounded-b-full"
              initial={{ scale: 0, rotate: -90 }}
              animate={
                isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }
              }
              transition={{ duration: 0.8, delay: 0.4, ease: "backOut" }}
            />
            <motion.div
              className="absolute w-[10rem] h-[5rem] sm:w-[12rem] sm:h-[6rem] md:w-[16rem] md:h-[8rem] lg:w-[12rem] lg:h-[6rem] xl:w-[16rem] xl:h-[8rem] 2xl:w-[20rem] 2xl:h-[10rem] left-0 bg-[#6532FF] top-[5rem] sm:top-[6rem] md:top-[8rem] lg:top-[6rem] xl:top-[8rem] 2xl:top-[10rem] z-20 rounded-t-full"
              initial={{ scale: 0, rotate: 90 }}
              animate={
                isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 90 }
              }
              transition={{ duration: 0.8, delay: 0.6, ease: "backOut" }}
            />

            <motion.figure
              className="absolute w-[12rem] h-[20rem] sm:w-[14rem] sm:h-[24rem] md:w-[16rem] md:h-[28rem] lg:w-[14rem] lg:h-[24rem] xl:w-[16rem] xl:h-[28rem] 2xl:w-[20.5rem] 2xl:h-[34rem] right-[2rem] sm:right-[3rem] md:right-[4rem] lg:right-[2rem] xl:right-[4rem] 2xl:right-[6rem] top-[4rem] sm:top-[4rem] md:top-[4rem] lg:top-[2rem] xl:top-[4rem] 2xl:top-[8rem] z-30"
              variants={mobileImageVariants}
            >
              <motion.div
                animate={isInView ? { y: [0, -10, 0] } : {}}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                <Image
                  src={mobile || "/placeholder.svg"}
                  alt="WhatsApp Business Mobile Interface"
                  width={328}
                  height={617}
                  className="object-contain w-full h-full drop-shadow-2xl"
                />
              </motion.div>
            </motion.figure>
          </div>
        </motion.div>

        {/* Right side - Content */}
        <motion.div
          className="text-[#232323] flex flex-col justify-center h-full py-4 lg:py-8"
          variants={rightSectionVariants}
        >
          <div className="mb-6 lg:mb-8">
            <motion.div
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium mb-3 lg:mb-4"
              variants={badgeVariants}
            >
              <motion.div
                animate={isInView ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              </motion.div>
              Verified Business Benefits
            </motion.div>

            <motion.h2
              className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-3 lg:mb-4 leading-tight"
              variants={titleVariants}
            >
              Why You Need a{" "}
              <motion.span
                className="text-purple-600"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={
                  isInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.5 }
                }
                transition={{ duration: 0.6, delay: 0.8, ease: "backOut" }}
              >
                Blue Tick
              </motion.span>
            </motion.h2>

            <motion.p
              className="text-sm sm:text-base lg:text-base xl:text-lg text-gray-600 mb-6 lg:mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Transform your business communication with WhatsApp's official
              verification and unlock powerful advantages that drive growth.
            </motion.p>
          </div>

          <motion.ul
            className="space-y-4 lg:space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.li
                  key={index}
                  className="group"
                  variants={featureVariants}
                >
                  <motion.div
                    className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="mt-1 min-w-10 lg:min-w-12">
                      <motion.div
                        className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <motion.h3
                          className="font-bold text-base lg:text-lg text-gray-900 leading-tight"
                          initial={{ opacity: 0, x: -20 }}
                          animate={
                            isInView
                              ? { opacity: 1, x: 0 }
                              : { opacity: 0, x: -20 }
                          }
                          transition={{
                            duration: 0.5,
                            delay: 0.8 + index * 0.1,
                          }}
                        >
                          {feature.title}
                        </motion.h3>
                        <motion.span
                          className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={
                            isInView
                              ? { opacity: 1, scale: 1 }
                              : { opacity: 0, scale: 0 }
                          }
                          transition={{
                            duration: 0.4,
                            delay: 1 + index * 0.1,
                            ease: "backOut",
                          }}
                        >
                          {feature.stat}
                        </motion.span>
                      </div>
                      <motion.p
                        className="text-sm lg:text-base text-gray-600 leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={
                          isInView
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 10 }
                        }
                        transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                      >
                        {feature.description}
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>
      </motion.div>
    </section>
  );
};

const CompetentTalent = memo(MemoCompetentTalent);
export default CompetentTalent;
