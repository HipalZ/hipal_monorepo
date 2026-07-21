import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * A small, non-ticking "estimated time to delivery" pill shown on the top-right
 * corner of a service avatar.
 *
 * Deliberately a *static estimate*, not a live countdown: on the selection menu
 * nothing has been requested yet, so a decrementing clock would mislead. It lets
 * the guest check the expected wait *before* ordering.
 *
 * Value is `avgDeliveryTime` (minutes) — the "should be delivered by" threshold,
 * which already includes the acceptance step server-side.
 */

interface ServiceEtaBadgeProps {
  /** Estimated delivery time in minutes (service.avgDeliveryTime). */
  minutes?: number;
  className?: string;
}

/** Number + unit split so the digit can be bold and the unit lighter. */
function formatEta(minutes: number): { value: string; unit: string } {
  if (minutes < 1) return { value: "<1", unit: "min" };
  if (minutes < 60) return { value: String(minutes), unit: "min" };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0
    ? { value: String(h), unit: "hr" }
    : { value: `${h}:${String(m).padStart(2, "0")}`, unit: "hr" };
}

function ariaEta(minutes: number): string {
  if (minutes < 1) return "Estimated delivery under a minute";
  return `Estimated delivery about ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

/**
 * Speed-coded colour so the guest can scan fast vs. slow at a glance.
 * Filled soft tints with a matching ring keep it legible over any avatar colour.
 *   green  = quick        (<= 5 min)
 *   amber  = moderate     (6 - 15 min)
 *   blue   = longer wait  (> 15 min)
 */
function toneFor(minutes: number): string {
  if (minutes <= 5) return "bg-green-100 text-green-800 ring-green-600/20";
  if (minutes <= 15) return "bg-amber-100 text-amber-800 ring-amber-600/20";
  return "bg-blue-100 text-blue-800 ring-blue-600/20";
}

const ServiceEtaBadge = memo(({ minutes, className }: ServiceEtaBadgeProps) => {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;

  const { value, unit } = formatEta(minutes);

  return (
    <span
      role="img"
      aria-label={ariaEta(minutes)}
      title={ariaEta(minutes)}
      className={cn(
        "inline-flex items-baseline gap-0.5 rounded-full px-2 py-0.5",
        "ring-1 ring-inset shadow-sm leading-none whitespace-nowrap",
        toneFor(minutes),
        className,
      )}
    >
      <span className="text-[12px] font-bold">{value}</span>
      <span className="text-[9px] font-medium opacity-80">{unit}</span>
    </span>
  );
});

ServiceEtaBadge.displayName = "ServiceEtaBadge";

export default ServiceEtaBadge;
