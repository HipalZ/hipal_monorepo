"use client";

import { Bike } from "lucide-react";
import { memo } from "react";

type PrepDeliveryTimeBadgeProps = {
  minutes?: number | null;
  className?: string;
  color?: string;
};

function PrepDeliveryTimeBadge({
  minutes,
  className = "",
  color,
}: PrepDeliveryTimeBadgeProps) {
  const displayMinutes = Math.round(Number(minutes || 0));

  if (!Number.isFinite(displayMinutes) || displayMinutes <= 0) {
    return null;
  }

  return (
    <span
      className={`flex w-fit max-w-full items-center gap-1.5 text-xs leading-none ${className}`}
      style={color ? { color } : undefined}
      aria-label={`Delivery within ${displayMinutes} minutes`}
    >
      <span className="truncate text-xs font-medium text-current opacity-80">
        Delivery within :
      </span>
      <strong className="shrink-0 text-xs font-semibold text-current">
        {displayMinutes} min
      </strong>
    </span>
  );
}

export default memo(PrepDeliveryTimeBadge);
