import { useState, memo, type CSSProperties } from "react";
import { cn } from "@hi/common";

interface ShimmerImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  hide?: boolean;
  className?: string;
  style?: CSSProperties;
}

const MemoShimmerImage = ({
  src,
  alt,
  width = 50,
  height = 50,
  hide = false,
  className = "",
  style,
}: ShimmerImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={cn(!hide ? "" : "")}>
      {!imageLoaded && <div className="shimmer" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={style}
        className={cn(className)}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

const ShimmerImage = memo(MemoShimmerImage);
export default ShimmerImage;
