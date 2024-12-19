import { memo, useEffect, type ReactNode } from "react";
import { useTransition, animated } from "@react-spring/web";
import { FaArrowLeft, FaCross } from "react-icons/fa";
import { createPortal } from "react-dom";
import { cn } from "@hi/common";
import { HiX } from "react-icons/hi";

function MemoItemDescription({
  children,
  show,
  onClose,
  heading,
  linearGradTheme,
  bottomCross,
}: {
  readonly children: ReactNode;
  readonly show: boolean;
  readonly onClose: () => void;
  readonly heading?: string;
  readonly linearGradTheme?: boolean;
  readonly bottomCross?: boolean;
}) {
  const transitions = useTransition(show, {
    from: { transform: "translateY(100%)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(100%)", opacity: 0 },
    config: { tension: 250, friction: 30 },
  });

  useEffect(() => {
    if (show) {
      // Store the original hash
      const originalHash = window.location.hash;

      // Set the hash to indicate popup is open
      window.location.hash = "#popup";

      const handleHashChange = () => {
        // If the hash isn't "#popup" anymore, close the popup
        if (window.location.hash !== "#popup") {
          onClose();
        }
      };

      window.addEventListener("hashchange", handleHashChange);

      return () => {
        window.removeEventListener("hashchange", handleHashChange);

        // Restore original hash if still "#popup"
        if (window.location.hash === "#popup") {
          if (originalHash) {
            window.location.hash = originalHash;
          } else {
            // Remove the hash completely
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
            backdropFilter: "blur(5px)",
          }}
          className="fixed inset-0 z-[110]"
        >
          <div className="fixed inset-0 flex items-center justify-center bg-[#00000020] backdrop-blur-sm bg-opacity-70">
            <animated.div
              style={styles}
              className={cn(
                "h-[100dvh] overflow-auto w-full max-w-[28rem]",
                linearGradTheme ? "background-gradient" : "bg-[#ffffff]",
              )}
            >
              <header className="sticky !z-[1000] top-0 bg-[#ffffff] flex items-center pb-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-2 mt-4 ml-4 rounded-xl bg-[#000000] text-[#ffffff] on_active_bounce"
                >
                  <FaArrowLeft
                    size={28}
                    className="p-2 rounded-full cursor-pointer text-[#ffffff]"
                  />
                </button>
                <h1 className="mt-4 ml-4 text-2xl font-medium truncate text-[#000000]">
                  {heading}
                </h1>
              </header>
              {bottomCross && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute bottom-0 p-4 rounded-full bg-[#00000050] text-white transform -translate-x-1/2 -translate-y-1/2 left-1/2"
                >
                  <HiX />
                </button>
              )}
              {children}
            </animated.div>
          </div>
        </animated.div>
      ),
  );

  return createPortal(popupContent, document.body);
}

const ItemDescriptionPopup = memo(MemoItemDescription);
export default ItemDescriptionPopup;
