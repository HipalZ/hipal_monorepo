import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useOrderStore } from "@/components/store/useOrderData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useAddDiscount,
  useRemoveDiscount,
} from "@/components/hooks/api/useDiscount.ts";
import { useIsPasswordActive } from "@/components/hooks/usePasswordManager";
import type { DiscountType } from "@/components/types/api.types.ts";
import type { IBillData } from "@/components/types/hiClientzData.ts";
import toast from "react-hot-toast";

interface BillItem {
  _id: string;
  id: string;
  dish: {
    _id: string;
    name: string;
    price: number;
    businessId: string;
    posDishId: string;
    description: string;
    dishTypes: string[];
    ignoreDiscount: string;
    ignoreTax: string;
    images: string[];
    isDeleted: boolean;
    menuId: string;
    portions: Array<{
      name: string;
      price: number;
      default: boolean;
      portionTypes: string[];
      _id: string;
    }>;
    pos: boolean;
    posTax: string;
    rank: number;
    tags: string[];
    visibility: boolean;
    active: boolean;
    kitchenId?: string;
    tax: number;
    gst: number;
    instruction?: string;
  };
  portion: {
    name: string;
    price: number;
    default: boolean;
    portionTypes: string[];
    _id: string;
  } | null;
  extras: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  quantity: number;
  isDeleted: boolean;
}

interface DiscountModalProps {
  data: IBillData;
  onClose: () => void;
}

type DiscountValueType = "percentage" | "rupees";

// 🔹 Quick presets
const QUICK_PERCENTAGES = [5, 10, 15, 20, 25, 30, 35];

// Label = what captain sees, value = what goes into reason text
const QUICK_REASONS = [
  { label: "Swiggy", value: "Swiggy order discount" },
  { label: "Zomato", value: "Zomato order discount" },
  { label: "Dine-in", value: "Dine-in discount" },
  { label: "Staff Discount", value: "Staff discount" },
  { label: "Service Recovery", value: "Service recovery / guest complaint" },
  { label: "Festival Offer", value: "Festival promotional offer" },
];

const MemoDiscountModal = ({ data, onClose }: DiscountModalProps) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { captainData: userData } = useHiClientZ();
  const selectedBill = useOrderStore((s) => s.selectedBill);

  // Password management hooks
  const {
    isLoading: isAddPasswordLoading,
    isActive: isAddPasswordActive,
  } = useIsPasswordActive("DISCOUNT");

  const isSplitBill = useMemo(() => Array.isArray(data), [data]);
  const currentBill = useMemo(
    () => selectedBill || (isSplitBill ? null : data),
    [selectedBill, isSplitBill, data],
  );

  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>("");
  const [discountType, setDiscountType] = useState<DiscountType>("ON_BILL");
  const [discountValueType, setDiscountValueType] =
    useState<DiscountValueType>("percentage");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Password state
  const [addDiscountPassword, setAddDiscountPassword] = useState<string>("");

  const { addingDiscountLoader, addingDiscount } = useAddDiscount(currentBill);
  const { removingDiscountLoader, removingDiscount } =
    useRemoveDiscount(currentBill);

  // Flatten all items from billItems array, excluding deleted items
  const allItems = useMemo(() => {
    if (!data.billItems) return [];
    return data.billItems.flatMap((billGroup) =>
      billGroup.items.filter((item) => !item.isDeleted),
    );
  }, [data.billItems]);

  // Get items that can have discount applied (not ignoring discount)
  const discountableItems = useMemo(() => {
    return allItems.filter((item) => item.dish.ignoreDiscount !== "true");
  }, [allItems]);

  const getItemTotalPrice = useCallback((item: BillItem) => {
    const dishPrice = item.dish.price;
    const portionPrice = item.portion?.price || 0;
    const extrasPrice = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    return (dishPrice + portionPrice + extrasPrice) * item.quantity;
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
      const selectedItemsTotal = discountableItems
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
    discountableItems,
    selectedItems,
    getItemTotalPrice,
  ]);

  const getMaxDiscountValue = useCallback(() => {
    if (discountType === "ON_BILL") {
      return discountValueType === "percentage" ? 100 : data.subTotal;
    } else {
      const selectedItemsTotal = discountableItems
        .filter((item) => selectedItems.includes(item._id))
        .reduce((sum, item) => sum + getItemTotalPrice(item), 0);
      return discountValueType === "percentage"
        ? 100
        : selectedItemsTotal || 0;
    }
  }, [
    discountType,
    discountValueType,
    data.subTotal,
    discountableItems,
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

    // Check if password is required and validate
    if (isAddPasswordActive && !addDiscountPassword.trim()) {
      toast.error("Please enter the add discount password.");
      return;
    }

    // For item-wise discount, send the actual item IDs (not dish IDs)
    const itemIds = discountType === "ON_DISH" ? selectedItems : [];

    // 🔹 Compute value to send to API (as percentage, to match backend logic)
    let finalDiscountValue: number;
    if (discountValueType === "percentage") {
      finalDiscountValue = discountValue;
    } else {
      // Convert rupees to percentage for API
      if (discountType === "ON_BILL") {
        finalDiscountValue = (discountValue / data.subTotal) * 100;
      } else {
        const selectedItemsTotal = discountableItems
          .filter((item) => selectedItems.includes(item._id))
          .reduce((sum, item) => sum + getItemTotalPrice(item), 0);

        finalDiscountValue =
          selectedItemsTotal > 0
            ? (discountValue / selectedItemsTotal) * 100
            : 0;
      }
    }

    // 🔹 Map UI value type → API discountType enum
    const apiDiscountType =
      discountValueType === "percentage" ? "PCT" : "RP"; // "PCT" | "RP"

    try {
      const payload = {
        businessId,
        tableName: selectedTable.name,
        value: finalDiscountValue,
        reasonOfDiscount: discountReason,
        discountAppliedBy: userData._id,
        discountAppliedOn: discountType,
        itemIds,
        discountType: apiDiscountType, // 👈 send to API
        ...(isAddPasswordActive && { password: addDiscountPassword }), // Include password only if required
      };

      const res = await addingDiscount(payload);
      if (res.status === 200) {
        // Reset form after successful addition
        setDiscountValue(0);
        setDiscountReason("");
        setSelectedItems([]);
        setAddDiscountPassword("");
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add discount.");
    }
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
    discountableItems,
    getItemTotalPrice,
    addingDiscount,
    isAddPasswordActive,
    addDiscountPassword,
    onClose,
  ]);

  const handleRemoveDiscount = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    try {
      const payload = {
        businessId,
        tableName: selectedTable.name,
        discountRemovedBy: userData._id,
      };

      await removingDiscount(payload);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove discount.");
    }
  }, [
    businessId,
    selectedTable?.name,
    userData?._id,
    removingDiscount,
    onClose,
  ]);

  const handleItemSelection = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  }, []);

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

  // Calculate what percentage the rupees value represents (for UI info)
  const calculateEquivalentPercentage = useCallback(() => {
    if (discountValueType === "rupees" && discountValue > 0) {
      if (discountType === "ON_BILL") {
        return ((discountValue / data.subTotal) * 100).toFixed(2);
      } else {
        const selectedItemsTotal = discountableItems
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
    discountableItems,
    selectedItems,
    getItemTotalPrice,
  ]);

  // Show loading spinner if password validation is in progress
  if (isAddPasswordLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
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
      {discountType === "ON_DISH" && allItems.length > 0 && (
        <div>
          <Label>Select Items for Discount</Label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded border p-2">
            {data.billItems?.map((billGroup, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                {/* GST Group Header */}
                <div className="rounded bg-gray-100 p-2 text-sm font-medium">
                  GST {billGroup.gst}% Items
                </div>
                {/* Items in this GST group */}
                {billGroup.items
                  .filter((item) => !item.isDeleted)
                  .map((item) => {
                    const canApplyDiscount =
                      item.dish.ignoreDiscount !== "true";
                    const itemTotal = getItemTotalPrice(item);
                    return (
                      <div
                        key={item._id}
                        className="flex items-center space-x-2 pl-4"
                      >
                        <Checkbox
                          id={item._id}
                          checked={selectedItems.includes(item._id)}
                          onCheckedChange={(checked) =>
                            handleItemSelection(item._id, checked as boolean)
                          }
                          disabled={!canApplyDiscount}
                        />
                        <label
                          htmlFor={item._id}
                          className={`flex-1 text-sm ${
                            !canApplyDiscount
                              ? "text-gray-400 line-through"
                              : ""
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="font-medium">
                              {item.dish.name} - ₹{itemTotal}
                              <span className="ml-2 text-xs text-gray-500">
                                Qty: {item.quantity}
                              </span>
                            </div>
                            {/* Show portion details */}
                            {item.portion && (
                              <div className="pl-2 text-xs text-blue-600">
                                Portion: {item.portion.name} (+₹
                                {item.portion.price})
                              </div>
                            )}
                            {/* Show extras details */}
                            {item.extras && item.extras.length > 0 && (
                              <div className="pl-2 text-xs text-green-600">
                                Extras:{" "}
                                {item.extras
                                  .map(
                                    (extra) =>
                                      `${extra.name} (₹${extra.price} x ${extra.quantity})`,
                                  )
                                  .join(", ")}
                              </div>
                            )}
                            {/* Show dish instruction if any */}
                            {item.dish.instruction && (
                              <div className="pl-2 text-xs italic text-orange-600">
                                Note: {item.dish.instruction}
                              </div>
                            )}
                            {!canApplyDiscount && (
                              <div className="pl-2 text-xs text-red-500">
                                (Discount not allowed)
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <div className="space-y-1 text-xs text-gray-600">
              <p className="font-medium">
                Selected items total: ₹
                {discountableItems
                  .filter((item) => selectedItems.includes(item._id))
                  .reduce(
                    (sum, item) => sum + getItemTotalPrice(item),
                    0,
                  )}
              </p>
              <div className="space-y-1 pl-2">
                {discountableItems
                  .filter((item) => selectedItems.includes(item._id))
                  .map((item) => (
                    <div key={item._id} className="text-xs">
                      • {item.dish.name}
                      {item.portion && ` (${item.portion.name})`}
                      {item.extras.length > 0 &&
                        ` + ${item.extras.length} extra(s)`}
                      : ₹{getItemTotalPrice(item)}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
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
        <p className="mt-1 text-xs text-gray-600">
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

        {/* 🔹 Quick % buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_PERCENTAGES.map((p) => (
            <Button
              key={p}
              type="button"
              variant={
                discountValueType === "percentage" && discountValue === p
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => {
                setDiscountValueType("percentage");
                const maxVal = getMaxDiscountValue();
                const applied = p > maxVal ? maxVal : p;
                setDiscountValue(applied);
              }}
              className="h-7 px-2 text-xs"
            >
              {p}%
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="discount-reason">Reason for Discount</Label>
        <Textarea
          id="discount-reason"
          placeholder="Enter reason"
          value={discountReason}
          onChange={(e) => setDiscountReason(e.target.value)}
        />
        {/* 🔹 Quick reason buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_REASONS.map((r) => (
            <Button
              key={r.label}
              type="button"
              size="sm"
              variant={discountReason === r.value ? "default" : "outline"}
              onClick={() => setDiscountReason(r.value)}
              className="h-7 px-2 text-xs"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Add Discount Password Input - Only show if password is required */}
      {isAddPasswordActive && (
        <div>
          <Label
            htmlFor="add-discount-password"
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Add Discount Password
          </Label>
          <Input
            id="add-discount-password"
            type="password"
            value={addDiscountPassword}
            onChange={(e) => setAddDiscountPassword(e.target.value)}
            placeholder="Enter add discount password"
            className="mt-1"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleAddDiscount}
          disabled={
            addingDiscountLoader ||
            !discountValue ||
            !discountReason ||
            (discountType === "ON_DISH" && selectedItems.length === 0) ||
            (isAddPasswordActive && !addDiscountPassword.trim())
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
