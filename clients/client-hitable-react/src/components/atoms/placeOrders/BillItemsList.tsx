import type { IBillData } from "@/components/types/hiClientzData.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { ChevronDown, ChevronUp, Salad } from "lucide-react";
import { memo, useMemo } from "react";

interface BillItemsListProps {
  billData: IBillData | null;
  isExpanded: boolean;
  setIsExpanded: (isOpen: boolean) => void;
  allItems: IBillData["billItems"][0]["items"];
}

const MemoBillItemsList = ({
  billData,
  isExpanded,
  setIsExpanded,
  allItems,
}: BillItemsListProps) => {
  const calculateItemTotal = (item: IBillData["billItems"][0]["items"][0]) => {
    const dishPrice = item.dish.price;
    const portionPrice = item.portion?.price || 0;
    const extrasTotal = item.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    const finalPrice = (dishPrice + portionPrice + extrasTotal) * item.quantity;
    return finalPrice.toFixed(2);
  };
  const totalItemsCount = useMemo(() => {
    return allItems.reduce((total, item) => total + item.quantity, 0);
  }, [allItems]);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="justify-between w-full">
          <h3 className="font-semibold">
            Items: {totalItemsCount.toFixed(2)} ({allItems.length} unique)
          </h3>
          {isExpanded ? (
            <ChevronUp strokeWidth={4} className="w-4 h-4" />
          ) : (
            <ChevronDown strokeWidth={4} className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 overflow-auto max-h-[45rem] hide-scrollbar py-2">
        {billData?.billItems?.map((billGroup, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {/* GST Section Header */}
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <h4 className="font-semibold text-sm">
                GST {billGroup.gst}% Items
              </h4>
              <span className="text-xs text-gray-600">
                {billGroup.items.length} items
              </span>
            </div>
            {/* Items in this GST group */}
            <div className=" pl-2 pt-2">
              {billGroup.items.map((item, index) => (
                <div key={`${item._id}-${index}`} className="px-2 text-sm">
                  <div className="flex items-start gap-1 justify-between">
                    <Salad size={16} className="-ml-2" />
                    <div className="flex-1">
                      <p className="font-medium">{item?.dish?.name}</p>
                      {item?.portion && (
                        <p className="text-xs text-blue-600">
                          Portion: {item.portion.name} (+₹
                          {item.portion.price})
                        </p>
                      )}
                      {item?.dish?.instruction && (
                        <p className="text-xs text-orange-600 italic">
                          Note: {item.dish.instruction}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-600">Qty: {item?.quantity}</p>
                      <p className="font-medium">₹{calculateItemTotal(item)}</p>
                    </div>
                  </div>
                  {item?.extras?.length > 0 && (
                    <div className="mt-1 text-xs text-gray-600 ml-3">
                      <p className="font-medium">Extras:</p>
                      {item?.extras?.map((extra, idx) => (
                        <p key={`${extra.id}-${idx}`}>
                          {extra?.name} - ₹{extra?.price} x {extra?.quantity}
                        </p>
                      ))}
                    </div>
                  )}
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
            {/* Section Totals */}
            <div className="bg-gray-50 p-2 rounded-md border">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  Subtotal (GST {billGroup.gst}%)
                </span>
                <span className="font-medium">
                  ₹{Number(billGroup.subTotal).toFixed(2)}
                </span>
              </div>
              {billGroup.gst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">GST ({billGroup.gst}%)</span>
                  <span className="font-medium">
                    ₹{Number(billGroup.totalGst).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            {/* Divider between sections (except for last section) */}
            {groupIndex < (billData?.billItems?.length || 0) - 1 && (
              <Separator className="my-3" />
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

const BillItemsList = memo(MemoBillItemsList);
export default BillItemsList;
