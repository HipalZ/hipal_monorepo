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
                  {/* Dish Row */}
                  <div className="grid grid-cols-12 items-center gap-2">
                    {/* Name */}
                    <div className="col-span-6 font-medium">
                      {item?.dish?.name}
                      {item?.portion && (
                        <span className="text-xs text-blue-600 ml-1">
                          ({item.portion.name})
                        </span>
                      )}
                      {item?.dish?.instruction && (
                        <p className="text-xs text-orange-600 italic">
                          Note: {item.dish.instruction}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 text-center">
                      x{item.quantity}
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-right">
                      ₹
                      {(item.dish.price === 0
                        ? item.portion?.price || 0
                        : item.dish.price
                      ).toFixed(2)}
                    </div>

                    {/* Total Price */}
                    <div className="col-span-2 text-right font-semibold">
                      ₹
                      {(
                        (item.dish.price === 0
                          ? item.portion?.price || 0
                          : item.dish.price) * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>

                  {/* Extras Rows */}
                  {item?.extras?.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1 text-xs text-gray-600">
                      {item.extras.map((extra, idx) => {
                        const unitTotal = extra.price * extra.quantity;
                        const finalTotal = unitTotal * item.quantity;

                        return (
                          <div
                            key={`${extra.id}-${idx}`}
                            className="grid grid-cols-12 items-center gap-2"
                          >
                            {/* Extra Name */}
                            <div className="col-span-6 pl-2">
                              + {extra.name}
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2 text-center">
                              x{extra.quantity * item.quantity}
                            </div>

                            {/* Unit Price */}
                            <div className="col-span-2 text-right">
                              ₹{extra.price}
                            </div>

                            {/* Total Price */}
                            <div className="col-span-2 text-right font-semibold">
                              ₹{finalTotal.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Separator className="my-2" />
                </div>
              ))}
            </div>
            {/* Section Totals */}
            <div className="bg-gray-50 p-2 rounded-md border">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Subtotal</span>
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
