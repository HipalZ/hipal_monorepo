import { memo, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";
import { HiX } from "react-icons/hi";
import { cn } from "@/components/utils/helpers";
import { createPortal } from "react-dom";
import { FaCross } from "react-icons/fa";

const MemoBottomPopUp = ({
  children,
  show,
  onClose,
  hide,
  linearGradTheme,
  bottomCross,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
  linearGradTheme?: boolean;
  bottomCross?: boolean;
}) => {
  const transitions = useTransition(show, {
    from: { transform: "translateY(100%)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(100%)", opacity: 0 },
    config: { tension: 250, friction: 30 },
  });

  useEffect(() => {
    if (show) {
      // Store the original hash so we can restore it later
      const originalHash = window.location.hash;

      // Set a special hash to indicate popup is open
      window.location.hash = "#popup";

      const handleHashChange = () => {
        // If the hash is no longer "#popup", close the popup
        if (window.location.hash !== "#popup") {
          onClose();
        }
      };

      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.removeEventListener("hashchange", handleHashChange);

        // Restore original hash if necessary
        if (window.location.hash === "#popup") {
          if (originalHash) {
            window.location.hash = originalHash;
          } else {
            // Remove the hash completely if no original hash
            history.pushState(
              "",
              document.title,
              window.location.pathname + window.location.search,
            );
          }
        }
      };
    }
  }, []);

  if (!show) return null;

  const popupContent = transitions(
    (styles, item) =>
      item && (
        <animated.div
          style={{
            opacity: styles.opacity,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(5px)",
          }}
          className="fixed inset-0 z-[110] overflow-y-auto flex items-end justify-center"
          onClick={onClose}
        >
          <animated.div
            style={styles}
            className={cn(
              "relative w-full max-w-md shadow-md",
              !hide && "rounded-t-[1rem]",
              linearGradTheme ? "background-gradient" : "bg-base-100",
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
            {bottomCross && (
              <button
                type="button"
                onClick={onClose}
                className="absolute bottom-0 p-4 rounded-full bg-[#00000050] text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2"
              >
                <HiX />
              </button>
            )}
          </animated.div>
        </animated.div>
      ),
  );

  return createPortal(popupContent, document.body);
};

const BottomPopUp = memo(MemoBottomPopUp);
export default BottomPopUp;
