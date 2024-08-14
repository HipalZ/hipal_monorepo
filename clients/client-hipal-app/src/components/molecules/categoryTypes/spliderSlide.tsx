import { SplideSlide } from "@splidejs/react-splide";
import { memo, type ReactNode } from "react";

const MemoSplideSlideWrapper = ({ children }: { children?: ReactNode }) => {
  return <SplideSlide>{children}</SplideSlide>;
};

const SplideSlideWrapper = memo(MemoSplideSlideWrapper);
export default SplideSlideWrapper;
