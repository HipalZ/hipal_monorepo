import { useState, useEffect, useRef, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useBusinessData from "@/components/store/useBusinessData";
import CardOne from "@/assets/cards/card21.png";
import CardTwo from "@/assets/cards/card22.png";
import CardThree from "@/assets/cards/card23.png";
import { useLoyalty } from "@/components/store/useLoyalty";
import { cn } from "@hi/common";

const points = [
  "Create a loyalty card in 5 easy steps 😋",
  "Join countless businesses enhancing their customer relationships with our easy-to-use loyalty card system🔥",
  "Create your personalized card in minutes & customize it to stand out 💯",
  "Don’t miss out—start building lasting connections that drive repeat business 🚀",
];

const cards = [CardOne, CardTwo, CardThree];

const MemoGetStarted = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [fade, setFade] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const businessData = useBusinessData((s) => s.businessData);
  const { setSelectedPage } = useLoyalty();

  const goToCardSelection = useCallback(() => {
    setStartAnimation(true);
    setTimeout(() => {
      setSelectedPage("CARD_SELECTION");
    }, 1000);
  }, [setSelectedPage]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentCard((prevCard) => (prevCard + 1) % cards.length);
        setFade(true);
      }, 500);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="loyalty_background"
    >
      <main className="flex items-center justify-center">
        <AnimatePresence>
          {!startAnimation && (
            <>
              <motion.h3
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute top-[3rem] md:text-2xl lg:text-3xl z-10 text-xl text-white !transform -translate-x-1/2 -translate-y-1/2 left-1/2"
              >
                Loyalty Cardz
              </motion.h3>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                exit={{ opacity: 0 }}
                className="circle_Loyalty_page md:hidden"
              />
              <motion.article
                ref={cardRef}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "relative z-10 w-[20rem] max-w-[24rem] md:scale-110 loyalty_card_rotate bg-[#ffffff50] h-[11.5rem] rounded-2xl",
                  startAnimation && "mt-[20dvh]",
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "center",
                  top: "17dvh",
                }}
              >
                <motion.img
                  src={cards[currentCard]}
                  alt={`Card ${currentCard + 1}`}
                  className={`object-cover w-full h-full rounded-2xl transition-all duration-1000 ease-in-out ${
                    fade
                      ? "opacity-100 filter-none"
                      : "opacity-0 filter-grayscale"
                  }`}
                />
                <motion.figure
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 3 }}
                  className="absolute text-white top-4 left-4 h-[5rem] aspect-square w-[5rem] rounded-xl"
                >
                  <img
                    className="rounded-xl filter invert-0 mix-blend-screen"
                    width={75}
                    height={75}
                    src={businessData?.logo}
                    style={{
                      filter: "invert(100%) contrast(150%) brightness(110%)",
                    }}
                    alt=" logo"
                  />
                </motion.figure>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 3 }}
                  className="absolute text-white bottom-8 left-4"
                >
                  User Name
                </motion.h3>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 3 }}
                  className="absolute text-sm text-white bottom-4 left-4"
                >
                  Coins :- 0
                </motion.h3>
              </motion.article>
              <motion.article
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2 }}
                exit={{ opacity: 0 }}
                style={{ height: "calc(100dvh - 20rem)" }}
                className="fixed bottom-0 bg-[#f3f3f3] z-0 w-full max-w-[30rem] md:!h-[55vh]"
              >
                <div className="w-full bg-[#FDB853] rounded-[50%] -mt-[1.75rem] h-[3.5rem]" />
                <h3 className="text-[#000000] text-lg font-[600] mt-4 mb-4 ml-6 md:text-2xl">
                  Unlock the Power of Customer Loyalty
                </h3>
                <section className="mx-6">
                  {points.map((point, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.7 }}
                      className="text-[#000000] text-sm font-[600] opacity-75 md:text-lg mt-2 relative pl-4 before:content-['\2022'] before:absolute before:left-0 before:text-black"
                    >
                      {point}
                    </motion.p>
                  ))}
                </section>
              </motion.article>
              <motion.button
                onClick={goToCardSelection}
                type="button"
                className="bottom_btn md:!w-[28rem] !transform -translate-x-1/2"
                whileHover={{ scale: 1.5 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 3 }}
              >
                Get Started
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </main>
    </motion.section>
  );
};

const GetStarted = memo(MemoGetStarted);

export default GetStarted;
