import React, { memo } from "react";

const MemoCurvedText = ({ text }: { text: string }) => {
  return (
    <>
      <svg title="Curve" viewBox="0 0 500 140">
        <path
          id="curve"
          fill="transparent"
          d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
        />
        <text width="500">
          <textPath
            xlinkHref="#curve"
            startOffset="52%"
            textAnchor="middle"
            style={{
              fontSize: "36px",
              letterSpacing: "0.1em",
              fill: "white",
            }}
          >
            {text}
          </textPath>
        </text>
      </svg>
    </>
  );
};

const CurvedText = memo(MemoCurvedText);
export default CurvedText;
