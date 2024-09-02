import { memo } from "react";
import { useTransition, animated } from "@react-spring/web";
import { HiX } from "react-icons/hi";
import { cn } from "@/components/utils/helpers";

const BottomPopUp = ({
  children,
  show,
  onClose,
  hide,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
}) => {
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
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(5px)",
              }}
              className="fixed inset-0 z-[103] overflow-y-auto flex items-end justify-center"
              onClick={onClose}
            >
              <animated.div
                style={styles}
                className={cn(
                  "relative w-full max-w-md bg-base-100 shadow-md",
                  !hide && "rounded-t-[1rem]",
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
      )}
    </>
  );
};

const MemoBottomPopUp = memo(BottomPopUp);
export default MemoBottomPopUp;
