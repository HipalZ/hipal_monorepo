import { memo } from "react";
import Confetti from "@/assets/cart/Confetti.png";
import Image from "next/image";
import { motion } from "framer-motion";

const MemoConfettiHeader = () => {
  const confettiStyles = [
    "absolute w-3 h-3 top-[1rem] left-[7.5rem] bg-[#DE6F91] rounded-full",
    "absolute w-4 h-4 top-0 left-[12rem] bg-[#C497DC] rounded-full",
    "absolute w-3 h-3 top-[1.5rem] left-[17rem] bg-[#3BA7E2] rounded-full",
    "absolute w-2 h-2 top-[4rem] left-[16rem] bg-[#DE9615] rounded-full",
  ];

  const confettiVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  };

  const imageVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  return (
    <motion.section
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.1 }}
    >
      <motion.div variants={imageVariants} transition={{ duration: 0.5 }}>
        <Image
          src={Confetti}
          alt="confetti"
          className="absolute left-0 w-20 h-20 top-8"
        />
      </motion.div>
      <motion.div
        variants={imageVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Image
          src={Confetti}
          alt="confetti"
          className="absolute right-0 w-20 h-20 top-8"
        />
      </motion.div>
      {confettiStyles.map((style, index) => (
        <motion.div
          key={index}
          className={style}
          variants={confettiVariants}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: index * 0.1,
          }}
        />
      ))}
    </motion.section>
  );
};

const ConfettiHeader = memo(MemoConfettiHeader);
export default ConfettiHeader;
