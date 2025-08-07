import { memo, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, AlertCircle } from "lucide-react";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import type { VariantSplit } from "@/components/types/split.types";
import { useSplitBill } from "@/components/hooks/useBill.ts";
import CommonBottomButton from "@/components/atoms/bottomButton/index.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrderStore } from "@/components/store/useOrderData.ts";

interface PortionSplitProps {
  data: IBillData;
  onClose: () => void;
}

const PortionSplit = memo(({ data, onClose }: PortionSplitProps) => {
  const { businessId } = useParams();
  const { isSplitting, splitBill } = useSplitBill();
  const setActiveModal = useOrderStore((s) => s.setActiveModal);

  const [variantCount, setVariantCount] = useState(2);
  const [variants, setVariants] = useState<VariantSplit[]>([
    { percentage: 50 },
    { percentage: 50 },
  ]);

  const totalPercentage = useMemo(
    () => variants.reduce((sum, v) => sum + v.percentage, 0),
    [variants],
  );

  const isValidSplit = useMemo(
    () =>
      variantCount >= 2 &&
      variantCount <= 20 &&
      Math.abs(totalPercentage - 100) < 0.01 &&
      variants.every((v) => v.percentage >= 1 && v.percentage <= 99) &&
      variants.length === variantCount,
    [variantCount, totalPercentage, variants],
  );

  const handleVariantCountChange = useCallback((newCount: number) => {
    setVariantCount(newCount);
    if (newCount < 2 || newCount > 20) {
      // out of valid range: skip recalculation
      return;
    }
    // Rebuild all percentages on valid count change
    const equal = Math.floor(100 / newCount);
    const rem = 100 - equal * newCount;
    const newVariants = Array.from({ length: newCount }, (_, i) => ({
      percentage: i === newCount - 1 ? equal + rem : equal,
    }));
    setVariants(newVariants);
  }, []);

  const handlePercentageChange = useCallback((index: number, value: number) => {
    if (value < 0 || value > 100) return;
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { percentage: value };
      return next;
    });
  }, []);

  const handleSplit = useCallback(async () => {
    if (!isValidSplit || !businessId) return;
    try {
      await splitBill({
        businessId,
        tableName: data.tableName,
        variantCount,
        variants,
      });
      onClose();
    } catch (err) {
      console.error("Failed to split bill:", err);
    }
  }, [
    isValidSplit,
    businessId,
    splitBill,
    data.tableName,
    variantCount,
    variants,
    onClose,
  ]);

  return (
    <section className="pb-[8rem] space-y-4">
      {/* Portion count selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Portions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="variantCount">Number of Portions:</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVariantCountChange(variantCount - 1)}
                disabled={variantCount <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="variantCount"
                type="number"
                min={0}
                max={20}
                value={variantCount}
                onChange={(e) =>
                  handleVariantCountChange(Number(e.target.value) || 0)
                }
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleVariantCountChange(variantCount + 1)}
                disabled={variantCount >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Badge variant="secondary">{variantCount} portions</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Percentage inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Percentage Distribution</span>
            <Badge variant={isValidSplit ? "default" : "destructive"}>
              Total: {totalPercentage.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {variants.map((variant, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Label className="w-20">Bill #{idx + 1}:</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={variant.percentage}
                onChange={(e) =>
                  handlePercentageChange(idx, Number(e.target.value) || 0)
                }
                className="w-24"
              />
              <span className="text-sm text-gray-600">%</span>
              <div className="flex-1 text-sm text-gray-600">
                ≈ ₹{((data.total * variant.percentage) / 100).toFixed(2)}
              </div>
            </div>
          ))}

          {!isValidSplit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {variantCount < 2 || variantCount > 20
                  ? "Number of portions must be between 2 and 20."
                  : Math.abs(totalPercentage - 100) >= 0.01
                    ? "Total percentage must equal 100%."
                    : "Each percentage must be between 1% and 99%."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Bottom buttons */}
      <section className="-ml-4">
        <CommonBottomButton
          fixed
          maxWidth="30rem"
          buttons={[
            {
              text: "Back",
              onClick: () => setActiveModal("options"),
              isBackButton: true,
              className: "rounded-md pl-2",
            },
            {
              text: isSplitting ? "Splitting..." : "Confirm",
              onClick: handleSplit,
              disable: isSplitting || !isValidSplit,
            },
          ]}
        />
      </section>
    </section>
  );
});

PortionSplit.displayName = "PortionSplit";
export default PortionSplit;
