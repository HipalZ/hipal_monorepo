import { memo } from "react";
import { useTransition, animated } from "@react-spring/web";
import { HiX } from "react-icons/hi";
import { cn } from "@/components/utils/helpers";
import { createPortal } from "react-dom"; // Import createPortal

const BottomPopUp = ({ children, show, onClose, hide, linearGradTheme }) => {
  const transitions = useTransition(show, {
    from: { transform: "translateY(100%)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(100%)", opacity: 0 },
    config: { tension: 250, friction: 30 },
  });

  // If the popup is not supposed to show, return null
  if (!show) return null;

  // Define the popup content
  const popupContent = transitions(
    (styles, item) =>
      item && (
        <animated.div
          style={{
            opacity: styles.opacity,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(5px)",
          }}
          className="fixed inset-0 z-[103] overflow-y-auto flex items-end justify-center"
          onClick={onClose}
        >
          <animated.div
            style={styles}
            className={cn(
              "relative w-full max-w-md shadow-md",
              !hide && "rounded-t-[1rem]",
              linearGradTheme ? "background-gradient" : "bg-base-200",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {!hide && (
              <div className="absolute flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-12 left-[45%]">
                <HiX
                  className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer"
                  onClick={onClose}
                />
              </div>
            )}
            {children}
          </animated.div>
        </animated.div>
      ),
  );

  return createPortal(popupContent, document.body);
};

const MemoBottomPopUp = memo(BottomPopUp);
export default MemoBottomPopUp;
