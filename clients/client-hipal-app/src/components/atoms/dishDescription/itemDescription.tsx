import { memo, type ReactNode } from "react";
import { useTransition, animated } from "@react-spring/web";
import { FaArrowLeft } from "react-icons/fa";

function MemoItemDescription({
  children,
  show,
  onClose,
  heading,
}: {
  readonly children: ReactNode;
  readonly show: boolean;
  readonly onClose: () => void;
  readonly heading?: string;
}) {
  const transitions = useTransition(show, {
    from: { transform: "translateY(100%)", opacity: 0 },
    enter: { transform: "translateY(0%)", opacity: 1 },
    leave: { transform: "translateY(100%)", opacity: 0 },
    config: { tension: 250, friction: 30 },
  });

  return (
    <>
      {transitions(
        (styles, item) =>
          item && (
            <animated.div
              style={{
                opacity: styles.opacity,
                backdropFilter: "blur(5px)",
              }}
              className="fixed inset-0 z-50"
            >
              <div className="fixed inset-0 flex items-center justify-center bg-[#00000020] backdrop-blur-sm bg-opacity-70">
                <animated.div
                  style={styles}
                  className=" h-[100dvh] overflow-auto w-full max-w-[28rem] bg-base-100 "
                >
                  <header className="sticky !z-[1000] top-0 bg-base-100 flex items-center pb-2">
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="px-2 mt-4 ml-4 rounded-xl bg-base-200 on_active_bounce"
                    >
                      <FaArrowLeft
                        size={28}
                        className="p-2 text-black rounded-full cursor-pointer"
                      />
                    </button>
                    <h1 className="mt-4 ml-4 text-2xl font-medium truncate text-base-content">
                      {heading}
                    </h1>
                  </header>
                  {children}
                </animated.div>
              </div>
            </animated.div>
          ),
      )}
    </>
  );
}

const ItemDescriptionPopup = memo(MemoItemDescription);
export default ItemDescriptionPopup;
