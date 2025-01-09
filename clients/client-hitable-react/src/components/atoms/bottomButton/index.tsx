import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@hi/common";
import SpinnerMemo from "../loadingSpinner";
import { ArrowLeftFromLine } from "lucide-react";
import { ShineBorder } from "../borderAnimations";

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
  isLoading?: boolean;
  disable?: boolean;
  hide?: boolean;
  color?: string;
  textColor?: string;
  className?: string;
  isBackButton?: boolean;
  highlight?: boolean;
  borderClasses?: string;
}

interface MemoBottomButtonProps {
  buttons: ButtonConfig[];
  fixed?: boolean;
  position?: "left" | "right" | "mid";
  align?: "top" | "bottom";
  backgroundColor?: string;
  offset?: string;
  maxWidth?: string;
  shadow?: boolean;
}

const buttonVariants = {
  idle: { scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 },
  tap: { scale: 0.75, rotateX: 0, rotateY: 0, translateZ: 0 },
};


const MemoBottomButton = (props: MemoBottomButtonProps) => {
  const {
    buttons,
    fixed = true,
    position = "mid",
    align = "bottom",
    backgroundColor = "#ffffff",
    offset = "0",
    maxWidth,
    shadow
  } = props;

  return (
    <article
      className={cn("px-4 py-2 overflow-hidden md:bg-transparent z-10", {
        fixed: fixed,
        absolute: !fixed,
        "left-0": position === "left",
        "right-0": position === "right",
        "mx-auto": position === "mid",
        "w-full": position === "mid",
      }, shadow ? 'shadow-[0_-2px_15px_rgba(0,0,0,0.1)]' : '')}
      style={{
        backgroundColor: backgroundColor,
        [align]: offset,
        maxWidth: maxWidth,
      }}
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
                "rounded-full text-center py-3 transition-all duration-300 relative overflow-hidden",
                button.className,
                button?.isLoading ? "pointer-events-none" : "",
                {
                  "opacity-50 cursor-not-allowed": button.disable,
                  "flex-1": buttons.length > 1 && !button.isBackButton,
                  "w-[54px]": button.isBackButton && index === 0,
                  "ml-4": index > 0 && !button.isBackButton,
                }
              )}
              style={{
                backgroundColor: button.disable
                  ? "#cccccc"
                  : button.color ?? "#000000",
                color: button.textColor ?? "#ffffff",
              }}
              onClick={!button.disable ? button.onClick : undefined}
              type={button.type ?? "button"}
              disabled={button.disable}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {button.highlight ? (
                <ShineBorder
                  color={["#FE8FB5", "#FFBE7B"]}
                  borderRadius={4}
                  duration={5}
                  className={button.borderClasses || ""}
                >
                  {button.isBackButton ? (
                    <ArrowLeftFromLine />
                  ) : button.isLoading ? (
                    <SpinnerMemo />
                  ) : (
                    button.text
                  )}
                </ShineBorder>
              ) : button.isBackButton ? (
                <ArrowLeftFromLine />
              ) : button.isLoading ? (
                <SpinnerMemo />
              ) : (
                button.text
              )}
            </motion.button>
          ) : null
        )}
      </div>
    </article>
  );
};

const CommonBottomButton = memo(MemoBottomButton);
export default CommonBottomButton;
