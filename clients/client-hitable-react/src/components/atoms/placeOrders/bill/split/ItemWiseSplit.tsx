import { memo, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, AlertCircle, Package } from "lucide-react";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import { useItemWiseSplit } from "@/components/hooks/useBill.ts";
import type { BillItem, ItemVariant } from "@/components/types/split.types.ts";

interface ItemWiseSplitProps {
  data: IBillData;
  onClose: () => void;
}

const ItemWiseSplit = memo(({ data, onClose }: ItemWiseSplitProps) => {
  const { businessId } = useParams();
  const { isSplittingItems, splitBillByItems } = useItemWiseSplit();

  // Flatten items directly to preserve extras, discount, isDeleted
  const allItems: BillItem[] = useMemo(
    () => data.billItems.flatMap((group) => group.items),
    [data.billItems],
  );

  const maxVariants = allItems.length;
  const [variantCount, setVariantCount] = useState(Math.min(2, maxVariants));
  const [variants, setVariants] = useState<ItemVariant[]>(() =>
    Array.from({ length: Math.min(2, maxVariants) }, (_, i) => ({
      variantId: `variant_${i + 1}`,
      variantName: `Bill #${i + 1}`,
      itemIds: [],
    })),
  );

  // Track assignment
  const assignedItemIds = useMemo(
    () => new Set(variants.flatMap((v) => v.itemIds)),
    [variants],
  );
  const unassignedItems = useMemo(
    () => allItems.filter((item) => !assignedItemIds.has(item._id)),
    [allItems, assignedItemIds],
  );

  const isValidSplit = useMemo(
    () =>
      variants.length >= 2 &&
      variants.length <= maxVariants &&
      unassignedItems.length === 0 &&
      variants.every((v) => v.itemIds.length > 0),
    [variants, maxVariants, unassignedItems],
  );

  const handleVariantCountChange = useCallback(
    (newCount: number) => {
      if (newCount < 2 || newCount > maxVariants) return;
      setVariantCount(newCount);
      setVariants((prev) => {
        if (newCount > prev.length) {
          return [
            ...prev,
            ...Array.from({ length: newCount - prev.length }, (_, i) => ({
              variantId: `variant_${prev.length + i + 1}`,
              variantName: `Bill #${prev.length + i + 1}`,
              itemIds: [],
            })),
          ];
        } else {
          return prev.slice(0, newCount);
        }
      });
    },
    [maxVariants],
  );

  const handleItemToggle = useCallback((itemId: string, idx: number) => {
    setVariants((prev) =>
      prev.map((v, i) => ({
        ...v,
        itemIds:
          i === idx
            ? v.itemIds.includes(itemId)
              ? v.itemIds.filter((id) => id !== itemId)
              : [...v.itemIds, itemId]
            : v.itemIds.filter((id) => id !== itemId),
      })),
    );
  }, []);

  const handleVariantNameChange = useCallback((idx: number, name: string) => {
    setVariants((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], variantName: name };
      return next;
    });
  }, []);

  const getItemTotal = useCallback((item: BillItem) => {
    const price = item.portion?.price || item.dish.price;
    return price * item.quantity;
  }, []);

  const getVariantTotal = useCallback(
    (variant: ItemVariant) =>
      variant.itemIds.reduce((sum, id) => {
        const item = allItems.find((it) => it._id === id);
        return item ? sum + getItemTotal(item) : sum;
      }, 0),
    [allItems, getItemTotal],
  );

  const handleSplit = useCallback(async () => {
    if (!isValidSplit || !businessId) return;
    // Build payload
    const payload = {
      businessId: businessId!,
      tableName: data.tableName,
      variantCount: variants.length,
      variants: variants.map((v) => ({
        cart: v.itemIds.map((id) => {
          const item = allItems.find((it) => it._id === id)!;
          // build unique id
          let uniqueId = item.dish._id;
          uniqueId += item.portion ? `_${item.portion._id}` : "_no_portion";
          uniqueId +=
            item.extras && item.extras.length
              ? `_${item.extras.map((e) => e._id).join("-")}`
              : "_no_extras";
          return {
            id: uniqueId,
            dish: item.dish,
            portion: item.portion,
            extras: item.extras || [],
            quantity: item.quantity,
            isDeleted: item.isDeleted,
            discount: item.discount || 0,
            _id: item._id,
          };
        }),
      })),
    };

    try {
      await splitBillByItems(payload);
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [
    isValidSplit,
    businessId,
    variants,
    allItems,
    data.tableName,
    splitBillByItems,
    onClose,
  ]);

  return (
    <div className="space-y-4">
      {/* Step 1: Variant Count */}
      <Card>
        <CardHeader>
          <CardTitle>Number of Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="variantCount">Split into:</Label>
            <Button
              onClick={() => handleVariantCountChange(variantCount - 1)}
              disabled={variantCount <= 2}
            >
              <Minus />
            </Button>
            <Input
              id="variantCount"
              type="number"
              min={2}
              max={maxVariants}
              value={variantCount}
              onChange={(e) =>
                handleVariantCountChange(Number(e.target.value) || 2)
              }
              className="w-16 text-center"
            />
            <Button
              onClick={() => handleVariantCountChange(variantCount + 1)}
              disabled={variantCount >= maxVariants}
            >
              <Plus />
            </Button>
            <Badge>Max: {maxVariants}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Assign Items */}
      {variants.map((v, idx) => (
        <Card key={v.variantId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package />
                <Input
                  value={v.variantName}
                  onChange={(e) => handleVariantNameChange(idx, e.target.value)}
                />
              </div>
              <Badge>₹{getVariantTotal(v).toFixed(2)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {allItems.map((item) => {
              const assignedElsewhere =
                assignedItemIds.has(item._id) && !v.itemIds.includes(item._id);
              return (
                <div
                  key={item._id}
                  className={`${
                    assignedElsewhere ? "opacity-50" : ""
                  } flex items-center py-1`}
                >
                  <Checkbox
                    checked={v.itemIds.includes(item._id)}
                    disabled={assignedElsewhere}
                    onCheckedChange={() => handleItemToggle(item._id, idx)}
                  />
                  <div className="ml-2 flex-1">
                    <div className="font-medium text-sm">{item.dish.name}</div>
                    {item.portion && (
                      <div className="text-xs text-gray-600">
                        Portion: {item.portion.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div>₹{getItemTotal(item).toFixed(2)}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Unassigned Items Alert */}
      {unassignedItems.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {unassignedItems.length} item(s) not assigned. Please assign all
            items.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSplit}
          disabled={!isValidSplit || isSplittingItems}
          className="flex-1"
        >
          {isSplittingItems ? "Splitting..." : "Confirm Split"}
        </Button>
      </div>
    </div>
  );
});

ItemWiseSplit.displayName = "ItemWiseSplit";
export default ItemWiseSplit;
