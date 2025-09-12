import { memo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@hi/common";
import SpinnerMemo from "../loadingSpinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  swipe?: boolean;
  icon?: React.ReactNode;
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

// Helper to return the inside label/spinner/back arrow
function getButtonInnerContent(button: ButtonConfig) {
  const {
    highlight,
    borderClasses,
    isBackButton,
    isLoading,
    text,
    icon: Icon,
  } = button;

  if (highlight) {
    return (
      <ShineBorder
        color={["#FE8FB5", "#FFBE7B"]}
        borderRadius={4}
        duration={5}
        className={borderClasses || ""}
      >
        {isBackButton ? (
          <ChevronLeft />
        ) : isLoading ? (
          <SpinnerMemo />
        ) : (
          <div className="flex items-center justify-center gap-2 truncate">
            {Icon && <h3 className="inline-flex items-center">{Icon}</h3>}
            <h3 className="truncate">{text}</h3>
          </div>
        )}
      </ShineBorder>
    );
  }

  if (isBackButton) return <ChevronLeft />;
  if (isLoading) return <SpinnerMemo />;

  return (
    <div className="flex items-center justify-center gap-2 truncate">
      {Icon && <h3 className="inline-flex items-center">{Icon}</h3>}
      <h3 className="truncate">{text}</h3>
    </div>
  );
}

function SwipeButton({
  button,
  index,
  buttonsLength,
}: {
  button: ButtonConfig;
  index: number;
  buttonsLength: number;
}) {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 200], ["#fff", "#22c55e"]);

  const handleDragEnd = () => {
    if (x.get() > 150 && button.onClick) button.onClick();
    x.set(0);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full text-center py-3 transition-all duration-300",
        button.className,
        button?.isLoading ? "pointer-events-none" : "",
        {
          "opacity-50 cursor-not-allowed": button.disable,
          "flex-1": buttonsLength > 1 && !button.isBackButton,
          "w-[54px]": button.isBackButton && index === 0,
          "ml-4": index > 0 && !button.isBackButton,
        },
      )}
      style={{
        backgroundColor: button.disable ? "#cccccc" : button.color ?? "#000000",
        color: button.textColor ?? "#ffffff",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {getButtonInnerContent(button)}
      </div>

      <motion.div
        className="absolute flex items-center justify-center w-10 h-10 bg-green-500 rounded-full shadow-md left-1 top-1 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 200 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, background }}
      >
        <ChevronRight className="text-black" />
      </motion.div>
    </div>
  );
}

const MemoBottomButton = (props: MemoBottomButtonProps) => {
  const {
    buttons,
    fixed = true,
    position = "mid",
    align = "bottom",
    backgroundColor = "#ffffff",
    offset = "0",
    maxWidth,
    shadow,
  } = props;

  const visibleButtons = buttons.filter((b) => !b.hide);
  const isSingle = visibleButtons.length === 1;

  return (
    <article
      className={cn(
        "px-4 py-2 overflow-hidden md:bg-transparent z-10",
        {
          fixed: fixed,
          absolute: !fixed,
          "left-0": position === "left",
          "right-0": position === "right",
          "left-1/2 -translate-x-1/2": position === "mid",
          "w-full": !isSingle,
          "w-auto": isSingle, 
        },
        shadow ? "shadow-[0_-2px_15px_rgba(0,0,0,0.1)]" : "",
      )}
      style={{
        backgroundColor: backgroundColor,
        [align]: offset,
        maxWidth: isSingle ? maxWidth ?? "min(640px, 92vw)" : maxWidth,
      }}
    >
      <div
        className={cn("flex", {
          "justify-between gap-4": visibleButtons.length === 2,
          "justify-center": visibleButtons.length !== 2,
        })}
      >
        {visibleButtons.map((button, index) =>
          button.swipe ? (
            <SwipeButton
              key={button.text}
              button={button}
              index={index}
              buttonsLength={visibleButtons.length}
            />
          ) : (
            <motion.button
              key={button.text}
              className={cn(
                "rounded-full text-center py-3 transition-all duration-300 relative overflow-hidden",
                button.className,
                button?.isLoading ? "pointer-events-none" : "",
                {
                  "opacity-50 cursor-not-allowed": button.disable,
                  // single vs multi width
                  "w-auto px-6": isSingle && !button.isBackButton,
                  "w-full": !isSingle && !button.isBackButton,
                  "w-[54px]": button.isBackButton && index === 0,
                  "ml-4": index > 0 && !button.isBackButton && !isSingle,
                },
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
              {getButtonInnerContent(button)}
            </motion.button>
          ),
        )}
      </div>
    </article>
  );
};

const CommonBottomButton = memo(MemoBottomButton);
export default CommonBottomButton;
