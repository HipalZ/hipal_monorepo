import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function ViewPortContainer({ children, className }: ContainerProps) {
  return (
    <div className={cn("w-full max-w-[1280px] overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface HotelBackgroundContainerProps {
  children: ReactNode;
  className?: string;
  overlayOpacity?: number;
}

export function HotelBackgroundContainer({
  children,
  className,
  overlayOpacity = 10,
}: HotelBackgroundContainerProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[linear-gradient(135deg,_#FCFCFC_0%,_#F7F2F2_100%)]",
        className,
      )}
    >
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto">
        {children}
      </div>
    </div>
  );
}
