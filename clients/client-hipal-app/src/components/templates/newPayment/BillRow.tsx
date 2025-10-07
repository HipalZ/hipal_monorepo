import { memo, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import type { BillRowProps as BaseBillRowProps } from "./types";

type BillRowProps = BaseBillRowProps & {
  /** Show a red remove button */
  removable?: boolean;
  /** Called when the red remove button is clicked */
  onRemove?: () => void;
};

const BillRowComponent = ({
  label,
  value,
  isNegative = false,
  removable,
  onRemove,
}: BillRowProps) => {
  const safeLabel = label || "Unknown";
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  // Auto-enable remove button for common labels if not explicitly set
  const shouldShowRemove = useMemo(() => {
    if (typeof removable === "boolean") return removable;
    const key = (safeLabel || "").toLowerCase();
    return key.includes("claimed coin") || key.includes("coupon discount");
  }, [removable, safeLabel]);

  return (
    <div className="space-y-3">
      <div
        className={`flex justify-between items-center gap-3 py-2 ${
          isNegative ? "text-destructive" : "text-foreground"
        }`}
      >
        {/* Left: label */}
        <p className="text-muted-foreground text-sm">{safeLabel}</p>

        {/* Right: amount + optional remove */}
        <div className="flex items-center gap-2">
          <p className="font-semibold">
            {isNegative ? "-" : ""} ₹ {Math.abs(safeValue).toFixed(2)}
          </p>

          {shouldShowRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label={`Remove ${safeLabel}`}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </div>
  );
};

export const BillRow = memo(BillRowComponent);
