import { useReview } from "@/components/store/useReview";
import { cn, reviewColors } from "@/components/utils/helpers";
import React, { memo, useCallback } from "react";

const messages = [
  "Loved the Experience",
  "We try to make your experience better",
  "We will improve based on your feedback",
];

const MemoReviewTopSection = () => {
  const { selectedEmoji, bgColor } = useReview((s) => ({
    selectedEmoji: s.selectedEmoji,
    bgColor: s.bgColor,
  }));

  return (
    <>
      {selectedEmoji !== null ? (
        <section>
          <article
            className={cn("h-[14rem] rounded-b-[100%] -ml-10 w-[120%]")}
            style={{ backgroundColor: bgColor }}
          />
        </section>
      ) : null}
      {selectedEmoji === null ? (
        <center className="poppins-regular text-[2.5rem] !font-semibold pt-28">
          Rate your Experience
        </center>
      ) : (
        <section
          className={cn(`text-[${reviewColors[selectedEmoji]?.textColor}]`)}
        >
          <div className="absolute w-full text-base font-semibold text-center transform -translate-x-1/2 top-8 left-1/2 poppins-regular">
            Review & Continue
          </div>
          <div className="absolute w-[80%] mx-auto text-base text-center transform -translate-x-1/2 -mt-36 left-1/2 poppins-regular">
            {messages[selectedEmoji]}
          </div>
        </section>
      )}
    </>
  );
};

const ReviewTopSection = memo(MemoReviewTopSection);
export default ReviewTopSection;
