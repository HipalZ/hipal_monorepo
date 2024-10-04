import { type CSSProperties, type FC, memo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@hi/common";

interface ShimmerImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  isAvailable?: boolean;
  style?: CSSProperties;
  quality?: number;
  layout?: "fill" | "responsive" | "intrinsic";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onClick?: () => void;
  sizes?: string;
  priority?: boolean;
  hide?: boolean;
}

const MemoShimmerImage: FC<ShimmerImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  isAvailable = true,
  quality,
  style,
  layout,
  objectFit,
  onClick,
  sizes,
  priority,
  hide,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn(!hide ? "imageWrapper" : "")}>
      {isLoading && <div className="shimmer" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        style={style}
        onClick={onClick}
        layout={layout}
        objectFit={objectFit}
        priority={priority}
        sizes={sizes}
        className={`${className} ${isAvailable ? "" : "grayscale"}`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};

const ShimmerImage = memo(MemoShimmerImage);
export default ShimmerImage;
