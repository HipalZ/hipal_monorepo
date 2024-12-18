"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@hi/common";
import LoadingSpinnerCircle from "../loader";

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
  isLoading?: boolean;
  disable?: boolean;
  hide?: boolean;
  highlight?: boolean;
}

interface MemoBottomButtonProps {
  buttons: ButtonConfig[];
  fixed?: boolean;
}

const buttonVariants = {
  idle: { scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 },
  tap: { scale: 0.75, rotateX: 0, rotateY: 0, translateZ: 0 },
};
const shineVariants = {
  initial: { x: "-100%" },
  animate: { x: "100%" },
};

const MemoBottomButton = (props: MemoBottomButtonProps) => {
  const { buttons, fixed } = props;

  return (
    <article
      className={cn(
        "w-full px-4 py-2 overflow-hidden bg-white md:bg-transparent -left-1 md:max-w-[28rem] md:left-0 md:right-0 md:mx-auto",
        {
          "fixed bottom-0": fixed,
          "absolute bottom-0": !fixed,
        },
      )}
    >
      <div
        className={cn("flex", {
          "justify-between": buttons.length === 2,
          "justify-center": buttons.length !== 2,
        })}
      >
        {buttons.map((button, index) =>
          !button.hide ? (
            <motion.button
              key={button.text}
              className={cn(
                "rounded-full text-center py-3",
                button?.isLoading ? "pointer-events-none" : "",
                {
                  "bg-[#038849] text-white": index === 1,
                  "bg-primary text-base-100": index !== 1,
                  "opacity-50 cursor-not-allowed": button.disable,
                },
                {
                  "w-[48%]": buttons.length === 2,
                  "w-[100%]": buttons.length !== 2,
                },
              )}
              onClick={!button.disable ? button.onClick : undefined}
              type={button.type ?? "button"}
              disabled={button.disable}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {button.highlight && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
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
              )}
              {button.isLoading ? <LoadingSpinnerCircle /> : button.text}
            </motion.button>
          ) : null,
        )}
      </div>
    </article>
  );
};

const CommonBottomButton = memo(MemoBottomButton);
export default CommonBottomButton;
