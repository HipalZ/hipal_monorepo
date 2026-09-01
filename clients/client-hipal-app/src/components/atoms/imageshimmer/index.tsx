import { type CSSProperties, type FC, memo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { cn } from "@/lib/utils";

interface ShimmerImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  isAvailable?: boolean;
  style?: CSSProperties;
  quality?: number;
  onClick?: () => void;
  sizes?: string;
  priority?: boolean;
  hide?: boolean;
  fill?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
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
  onClick,
  sizes,
  priority,
  hide,
  fill,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const hasSource = Boolean(src);

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(event);
    }
  };

  return (
    <div className={cn(!hide ? "relative" : "", "overflow-hidden", className)}>
      {(isLoading || !hasSource) && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
      )}
      {hasSource && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          onClick={onClick}
          priority={priority}
          sizes={sizes}
          fill={fill}
          style={{
            ...style,
            objectFit: style?.objectFit || "cover",
            objectPosition: "center",
          }}
          className={cn(
            isAvailable ? "" : "grayscale",
            "transition-opacity",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleImageLoad}
          onError={() => setIsLoading(true)}
        />
      )}
    </div>
  );
};

const ShimmerImage = memo(MemoShimmerImage);
export default ShimmerImage;
