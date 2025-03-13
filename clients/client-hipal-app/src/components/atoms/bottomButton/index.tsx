import { memo } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@hi/common";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ShineBorder } from "../borderAnimations";
import LoadingSpinnerCircle from "../loader";

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

function getButtonInnerContent(button: ButtonConfig) {
    const { highlight, borderClasses, isBackButton, isLoading, text, icon: Icon } = button;

    let content;
    if (isBackButton) {
        content = <ChevronLeft />;
    } else if (isLoading) {
        content = <LoadingSpinnerCircle />;
    } else {
        content = (
            <div className="flex items-center justify-center gap-2 truncate">
                {Icon && <h3 className="inline-flex items-center">{Icon}</h3>}
                <h3 className="truncate">{text}</h3>
            </div>
        );
    }

    if (highlight) {
        return (
            <ShineBorder
                color={["#FE8FB5", "#FFBE7B"]}
                borderRadius={4}
                duration={5}
                className={borderClasses || ""}
            >
                {content}
            </ShineBorder>
        );
    }

    return content;
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
        if (x.get() > 150 && button.onClick) {
            button.onClick();
        }
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
                }
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

const MemoCommonBottomButton = (props: MemoBottomButtonProps) => {
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

    return (
        <article
            className={cn(
                "px-4 py-2 overflow-hidden md:bg-transparent z-10",
                {
                    fixed: fixed,
                    absolute: !fixed,
                    "left-0": position === "left",
                    "right-0": position === "right",
                    "mx-auto": position === "mid",
                    "w-full left-0 right-0": position === "mid",
                },
                shadow ? "shadow-[0_-2px_15px_rgba(0,0,0,0.1)]" : ""
            )}
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
                        button.swipe ? (
                            <SwipeButton
                                key={button.text}
                                button={button}
                                index={index}
                                buttonsLength={buttons.length}
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
                                {getButtonInnerContent(button)}
                            </motion.button>
                        )
                    ) : null
                )}
            </div>
        </article>
    );
};

const CommonBottomButton = memo(MemoCommonBottomButton);
export default CommonBottomButton;
