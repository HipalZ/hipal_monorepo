import type { ReactNode } from "react";
import { cn } from "@hi/common";

interface BackgroundProps {
  children: ReactNode;
  className?: string;
}

const Background = ({ children, className }: BackgroundProps) => {
  return (
    <div className={cn("p-3 my-2 bg-white rounded-2xl", className)}>
      {children}
    </div>
  );
};

export default Background;
