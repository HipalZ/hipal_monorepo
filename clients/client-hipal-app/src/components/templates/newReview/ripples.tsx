import { useReview } from "@/components/store/useReview";
import React, { memo } from "react";

const MemoRipples = () => {
  const { rippleStyle } = useReview((s) => ({
    rippleStyle: s.rippleStyle,
  }));

  return (
    <>
      {rippleStyle.opacity && (
        <span
          className="ripple"
          style={{
            ...rippleStyle,
            left: rippleStyle.left,
            top: rippleStyle.top,
          }}
        />
      )}
    </>
  );
};

const Ripples = memo(MemoRipples);
export default Ripples;
