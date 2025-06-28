import { memo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOrderStore } from "@/components/store/useOrderData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import {
  useAddDiscount,
  useRemoveDiscount,
  type DiscountType,
} from "@/components/hooks/useBill";
import type { IBillData } from "@/components/types/hiClientzData.ts";

interface BillItem {
  _id: string;
  dish: {
    _id: string;
    name: string;
    price: number;
  };
  portion?: {
    name: string;
    price: number;
  };
  extras: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  quantity: number;
}

interface DiscountModalProps {
  data: IBillData;
  onClose: () => void;
}

type DiscountValueType = "percentage" | "rupees";

const MemoDiscountModal = ({ data, onClose }: DiscountModalProps) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { captainData: userData } = useHiClientZ();

  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>("");
  const [discountType, setDiscountType] = useState<DiscountType>("ON_BILL");
  const [discountValueType, setDiscountValueType] =
    useState<DiscountValueType>("percentage");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { addingDiscountLoader, addingDiscount } = useAddDiscount();
  const { removingDiscountLoader, removingDiscount } = useRemoveDiscount();

  const getItemTotalPrice = useCallback((item: BillItem) => {
    const dishPrice = item.portion?.price || item.dish.price;
    const extrasPrice = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    return (dishPrice + extrasPrice) * item.quantity;
  }, []);

  // This function calculates preview amount in rupees for display purposes
  const calculatePreviewAmount = useCallback(() => {
    if (discountType === "ON_BILL") {
      if (discountValueType === "percentage") {
        return (data.subTotal * discountValue) / 100;
      } else {
        return discountValue;
      }
    } else {
      const selectedItemsTotal = data.items
        .filter((item) => selectedItems.includes(item._id))
        .reduce((sum, item) => sum + getItemTotalPrice(item), 0);

      if (discountValueType === "percentage") {
        return (selectedItemsTotal * discountValue) / 100;
      } else {
        return discountValue;
      }
    }
  }, [
    discountType,
    discountValueType,
    discountValue,
    data.subTotal,
    data.items,
    selectedItems,
    getItemTotalPrice,
  ]);

  const getMaxDiscountValue = useCallback(() => {
    if (discountType === "ON_BILL") {
      return discountValueType === "percentage" ? 100 : data.subTotal;
    } else {
      const selectedItemsTotal = data.items
        .filter((item) => selectedItems.includes(item._id))
        .reduce((sum, item) => sum + getItemTotalPrice(item), 0);

      return discountValueType === "percentage" ? 100 : selectedItemsTotal;
    }
  }, [
    discountType,
    discountValueType,
    data.subTotal,
    data.items,
    selectedItems,
    getItemTotalPrice,
  ]);

  const handleAddDiscount = useCallback(async () => {
    if (
      !businessId ||
      !selectedTable?.name ||
      !userData?._id ||
      !discountValue ||
      !discountReason
    ) {
      return;
    }

    const dishIds = discountType === "ON_DISH" ? selectedItems : [];

    // Send percentage value to API
    let finalDiscountValue: number;

    if (discountValueType === "percentage") {
      // Send percentage directly to API
      finalDiscountValue = discountValue;
    } else {
      // Convert rupees to percentage for API
      if (discountType === "ON_BILL") {
        finalDiscountValue = (discountValue / data.subTotal) * 100;
      } else {
        const selectedItemsTotal = data.items
          .filter((item) => selectedItems.includes(item._id))
          .reduce((sum, item) => sum + getItemTotalPrice(item), 0);
        finalDiscountValue = (discountValue / selectedItemsTotal) * 100;
      }
    }

    await addingDiscount({
      businessId,
      tableName: selectedTable.name,
      value: finalDiscountValue,
      reasonOfDiscount: discountReason,
      discountAppliedBy: userData._id,
      discountAppliedOn: discountType,
      dishIds,
    });

    onClose();
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    discountValue,
    discountReason,
    discountType,
    discountValueType,
    selectedItems,
    data.subTotal,
    data.items,
    getItemTotalPrice,
    addingDiscount,
    onClose,
  ]);

  const handleRemoveDiscount = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    await removingDiscount({
      businessId,
      tableName: selectedTable.name,
      discountRemovedBy: userData._id,
    });

    onClose();
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    removingDiscount,
    onClose,
  ]);

  const handleItemSelection = useCallback(
    (itemId: string, checked: boolean) => {
      if (checked) {
        setSelectedItems((prev) => [...prev, itemId]);
      } else {
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      }
    },
    [],
  );

  const handleDiscountTypeChange = useCallback((value: DiscountType) => {
    setDiscountType(value);
    setSelectedItems([]);
    setDiscountValue(0);
  }, []);

  const handleDiscountValueTypeChange = useCallback(
    (value: DiscountValueType) => {
      setDiscountValueType(value);
      setDiscountValue(0);
    },
    [],
  );

  // Calculate what percentage the rupees value represents
  const calculateEquivalentPercentage = useCallback(() => {
    if (discountValueType === "rupees" && discountValue > 0) {
      if (discountType === "ON_BILL") {
        return ((discountValue / data.subTotal) * 100).toFixed(2);
      } else {
        const selectedItemsTotal = data.items
          .filter((item) => selectedItems.includes(item._id))
          .reduce((sum, item) => sum + getItemTotalPrice(item), 0);
        if (selectedItemsTotal > 0) {
          return ((discountValue / selectedItemsTotal) * 100).toFixed(2);
        }
      }
    }
    return null;
  }, [
    discountValueType,
    discountValue,
    discountType,
    data.subTotal,
    data.items,
    selectedItems,
    getItemTotalPrice,
  ]);

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Discount Management</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount-type">Discount Type</Label>
          <Select value={discountType} onValueChange={handleDiscountTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ON_BILL">Overall Bill</SelectItem>
              <SelectItem value="ON_DISH">Item Wise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Value Type</Label>
          <RadioGroup
            value={discountValueType}
            onValueChange={handleDiscountValueTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="percentage" />
              <Label htmlFor="percentage">Percentage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rupees" id="rupees" />
              <Label htmlFor="rupees">Rupees</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label htmlFor="discount-value">
          Discount{" "}
          {discountValueType === "percentage" ? "Percentage" : "Amount"}
        </Label>
        <Input
          id="discount-value"
          type="number"
          placeholder={
            discountValueType === "percentage"
              ? "Enter percentage (0-100)"
              : "Enter amount in rupees"
          }
          value={discountValue || ""}
          max={getMaxDiscountValue()}
          onChange={(e) => {
            const value = Number(e.target.value);
            const maxValue = getMaxDiscountValue();
            setDiscountValue(value > maxValue ? maxValue : value);
          }}
        />
        <p className="text-xs text-gray-600 mt-1">
          Max:{" "}
          {discountValueType === "percentage"
            ? "100%"
            : `₹${getMaxDiscountValue()}`}
          {discountValue > 0 && (
            <>
              {discountValueType === "percentage"
                ? ` | Amount: ₹${calculatePreviewAmount().toFixed(2)}`
                : ` | Equivalent: ${calculateEquivalentPercentage()}%`}
            </>
          )}
        </p>
      </div>

      {discountType === "ON_DISH" && data.items && (
        <div>
          <Label>Select Items for Discount</Label>
          <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
            {data.items.map((item) => (
              <div key={item._id} className="flex items-center space-x-2">
                <Checkbox
                  id={item._id}
                  checked={selectedItems.includes(item._id)}
                  onCheckedChange={(checked) =>
                    handleItemSelection(item._id, checked as boolean)
                  }
                />
                <label htmlFor={item._id} className="flex-1 text-sm">
                  {item.dish.name}
                  {item.portion && ` (${item.portion.name})`} - ₹
                  {getItemTotalPrice(item)}
                </label>
              </div>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <p className="text-xs text-gray-600">
              Selected items total: ₹
              {data.items
                .filter((item) => selectedItems.includes(item._id))
                .reduce((sum, item) => sum + getItemTotalPrice(item), 0)}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="discount-reason">Reason for Discount</Label>
        <Textarea
          id="discount-reason"
          placeholder="Enter reason"
          value={discountReason}
          onChange={(e) => setDiscountReason(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleAddDiscount}
          disabled={
            addingDiscountLoader ||
            !discountValue ||
            !discountReason ||
            (discountType === "ON_DISH" && selectedItems.length === 0)
          }
          className="flex-1"
        >
          {addingDiscountLoader ? "Adding..." : "Add Discount"}
        </Button>
        <Button
          variant="outline"
          onClick={handleRemoveDiscount}
          disabled={removingDiscountLoader}
          className="flex-1 bg-transparent"
        >
          {removingDiscountLoader ? "Removing..." : "Remove Discount"}
        </Button>
      </div>
    </div>
  );
};

const DiscountModal = memo(MemoDiscountModal);

export default DiscountModal;
