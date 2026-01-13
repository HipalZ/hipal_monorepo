import { memo, type ReactNode } from "react";
import { HiX } from "react-icons/hi";
import { useTransition, animated } from "@react-spring/web";

function DishData({
  children,
  show,
  onClose,
}: {
  readonly children: ReactNode;
  readonly show: boolean;
  readonly onClose: () => void;
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
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <div className="fixed inset-0 flex items-end justify-center bg-[#00000020] backdrop-blur-sm bg-opacity-70">
                <animated.div
                  style={styles}
                  className="relative w-full max-w-md shadow-md bg-base-100 rounded-t-2xl"
                >
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="absolute z-50 flex items-center justify-center transform -translate-x-[50%] -translate-y-1/2 on_active_bounce -top-12 left-[45%]"
                  >
                    <HiX className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer " />
                  </button>
                  {children}
                </animated.div>
              </div>
            </animated.div>
          ),
      )}
    </>
  );
}

const MemoDishData = memo(DishData);
export default MemoDishData;
