import { memo } from "react";

const MemoArrowPattern = ({ color }: { color: string }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 72 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby="arrowPatternTitle"
  >
    <title id="arrowPatternTitle">Arrow Pattern</title>
    <path
      d="M46.9418 3.15426L25.1247 24.6634L46.6338 46.4805"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M68.9135 3.30856L47.0957 24.8177L68.6055 46.6348"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.9711 3.4609L3.15399 24.97L24.6631 46.7871"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowPattern = memo(MemoArrowPattern);
export { ArrowPattern };
