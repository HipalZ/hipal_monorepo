import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@hi/common";

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
  isLoading?: boolean;
  delete?: boolean;
  disable?: boolean;
  hide?: boolean;
}

interface MemoBottomButtonProps {
  buttons: ButtonConfig[];
  fixed?: boolean;
}

const buttonVariants = {
  idle: { scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 },
  tap: { scale: 0.75, rotateX: 0, rotateY: 0, translateZ: 0 },
};

const MemoBottomButton = (props: MemoBottomButtonProps) => {
  const { buttons, fixed } = props;

  return (
    <article
      className={cn(
        "w-full px-4 py-2 bg-white md:bg-transparent -left-1 md:max-w-[28rem] md:left-0 md:right-0 md:mx-auto",
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
                  "bg-red-500 text-white": button.delete,
                  "bg-custom-gradient text-white":
                    !button.delete && index === 1,
                  "bg-black text-white": !button.delete && index !== 1,
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
              {button.isLoading ? (
                <svg
                  className="w-5 h-5 mx-auto text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                button.text
              )}
            </motion.button>
          ) : null,
        )}
      </div>
    </article>
  );
};

const BottomButton = memo(MemoBottomButton);
export default BottomButton;
