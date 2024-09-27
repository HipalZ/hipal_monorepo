import { cn, reviewColors } from "@/components/utils/helpers";
import Lottie from "lottie-react";
import React, { memo, useCallback } from "react";
import lottieAngry from "@/assets/lottie/lottie1.json";
import lottieHappy from "@/assets/lottie/lottie2.json";
import lottieNeutral from "@/assets/lottie/lottie3.json";
import { useReview } from "@/components/store/useReview";

const MemoLotties = () => {
  const {
    selectedEmoji,
    curveColor,
    rippleStyle,
    bgColor,
    setSelectedEmoji,
    setBgColor,
    setRippleStyle,
    setCurveColor,
  } = useReview((s) => ({
    selectedEmoji: s.selectedEmoji,
    curveColor: s.curveColor,
    rippleStyle: s.rippleStyle,
    bgColor: s.bgColor,
    setSelectedEmoji: s.setSelectedEmoji,
    setBgColor: s.setBgColor,
    setRippleStyle: s.setRippleStyle,
    setCurveColor: s.setCurveColor,
  }));

  const lotties = [
    {
      index: 0,
      lottie: lottieHappy,
    },
    {
      index: 1,
      lottie: lottieNeutral,
    },
    {
      index: 2,
      lottie: lottieAngry,
    },
  ];

  const getEmojiStyle = useCallback(
    (index) => {
      let style = {
        position: "absolute",
        transition: "all 0.6s ease-in-out",
        top: "auto",
        left: "auto",
        scale: 1,
        opacity: 1,
      };
      if (selectedEmoji === index) {
        style = {
          ...style,
          left: "calc(50% - 60px)",
          top: "-160px",
          opacity: 1,
        };
      } else if (selectedEmoji !== null) {
        const leftPosition = (selectedEmoji + 1) % 3;
        const rightPosition = (selectedEmoji + 2) % 3;
        if (index === leftPosition) {
          style = {
            ...style,
            top: "-120px",
            left: "calc(85% - 60px)",
            scale: 0.8,
          };
        } else if (index === rightPosition) {
          style = {
            ...style,
            top: "-120px",
            left: "calc(15% - 60px)",
            scale: 0.8,
          };
        }
      } else {
        style = {
          ...style,
          top: "30px",
          left: `calc(${(index + 1) * 32.5}% - 120px)`,
        };
      }
      return style;
    },
    [selectedEmoji],
  );

  const handleEmojiClick = useCallback(
    (index, event) => {
      const x = event.clientX;
      const y = event.clientY;
      setRippleStyle({
        left: `${x - 62.5}px`,
        top: `${y - 62.5}px`,
        backgroundColor: reviewColors[index]?.color,
        opacity: 1,
        position: "absolute",
        borderRadius: "50%",
        transform: "scale(0)",
        animation: "ripple-animation 0.6s linear",
      });
      setSelectedEmoji(index);
      setTimeout(() => {
        setRippleStyle({});
        setBgColor(reviewColors[index]?.color);
        setCurveColor(reviewColors[index]?.bgColor);
      }, 600);
    },
    [rippleStyle, selectedEmoji, bgColor, curveColor],
  );

  return (
    <>
      <center
        className={cn(
          selectedEmoji !== null ? "mt-24" : "mt-8",
          "absolute flex justify-between w-full",
        )}
      >
        {lotties.map((animationData, index) => {
          const style = getEmojiStyle(index);
          return (
            <article
              onClick={(e) => handleEmojiClick(animationData?.index, e)}
              onKeyDown={(e) => handleEmojiClick(animationData?.index, e)}
              key={animationData?.index}
              className="z-10"
              style={style}
            >
              <Lottie
                animationData={animationData?.lottie}
                loop={true}
                style={{
                  width: "120px",
                  height: "120px",
                  cursor: "pointer",
                  transform:
                    selectedEmoji === animationData?.index
                      ? "scale(1.9)"
                      : "scale(1.25)",
                }}
              />
            </article>
          );
        })}
      </center>
    </>
  );
};

const Lotties = memo(MemoLotties);
export default Lotties;
