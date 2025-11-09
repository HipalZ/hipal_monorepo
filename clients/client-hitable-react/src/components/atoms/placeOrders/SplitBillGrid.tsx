import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Receipt, ArrowLeft, CreditCard } from "lucide-react";
import { MdTableBar } from "react-icons/md";
import CommonBottomButton from "../bottomButton";
import { cn } from "@/components/utils/helpers.ts";

interface SplitBillGridProps {
  splitBills: any[];
  onSelectBill: (bill: any) => void;
  onBack: () => void;
  screenSize: string;
}

const SplitBillGrid = memo(
  ({ splitBills, onSelectBill, onBack, screenSize }: SplitBillGridProps) => {
    const totalAmount = splitBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalItems = splitBills.reduce(
      (sum, bill) =>
        sum +
        bill.billItems.reduce(
          (itemSum: number, group: any) =>
            itemSum +
            group.items.reduce(
              (qty: number, item: any) => qty + item.quantity,
              0,
            ),
          0,
        ),
      0,
    );

    return (
      <>
        <Card className="max-w-lg py-[5rem] md:py-[8rem] h-[90dvh] mx-auto mb-8 border border-none shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span>Split Bills ({splitBills.length})</span>
              </div>
              <Badge variant="secondary">
                Total: ₹{totalAmount.toFixed(2)}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Customer & Table Info */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  {splitBills[0]?.customerName} ({splitBills[0]?.customerPhone})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <MdTableBar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  Table: {splitBills[0]?.tableName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  Total Items: {totalItems}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Split Bills Grid */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">
                Select Bill to View:
              </h3>

              {splitBills.map((bill, index) => {
                const billItems = bill.billItems.reduce(
                  (sum: number, group: any) =>
                    sum +
                    group.items.reduce(
                      (qty: number, item: any) => qty + item.quantity,
                      0,
                    ),
                  0,
                );

                return (
                  <Card
                    key={bill.variantId || index}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200",
                      bill.isPaid ? "!bg-blue-500" : "bg-blue-500",
                    )}
                    onClick={() => onSelectBill(bill)}
                  >
                    <CardContent className={cn("p-4",
                      bill.isPaid ? "!bg-blue-500" : "bg-red-500",
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">
                            Bill #{bill.variantName || index + 1}
                          </span>
                        </div>
                        <Badge variant="outline">{billItems} items</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>₹{bill.subTotal.toFixed(2)}</span>
                        </div>

                        {bill.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="text-red-600">
                              -₹{bill.discount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {bill.serviceCharge > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Service Charge:
                            </span>
                            <span>₹{bill.serviceCharge.toFixed(2)}</span>
                          </div>
                        )}

                        {bill.gst > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax (GST):</span>
                            <span>₹{bill.gst.toFixed(2)}</span>
                          </div>
                        )}

                        {bill.claimedCoins > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Loyalty Coins:
                            </span>
                            <span className="text-red-600">
                              -₹{bill.claimedCoins.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {bill.couponDiscount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Coupon:</span>
                            <span className="text-red-600">
                              -₹{bill.couponDiscount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <Separator className="my-2" />

                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₹{bill.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Show some items preview */}
                      <div className="mt-3 pt-2 border-t">
                        <p className="text-xs text-gray-500 mb-1">Items:</p>
                        <div className="text-xs text-gray-600">
                          {bill.billItems
                            .flatMap((group: any) => group.items)
                            .slice(0, 2)
                            .map((item: any, idx: number) => (
                              <span key={idx}>
                                {item.dish.name} ({item.quantity})
                                {idx < 1 &&
                                bill.billItems.flatMap((g: any) => g.items)
                                  .length > 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          {bill.billItems.flatMap((group: any) => group.items)
                            .length > 2 && (
                            <span className="text-gray-400">
                              ... +
                              {bill.billItems.flatMap(
                                (group: any) => group.items,
                              ).length - 2}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CommonBottomButton */}
        <CommonBottomButton
          maxWidth={screenSize === "xs" ? "30rem" : "48rem"}
          backgroundColor={screenSize === "xs" ? "" : "white"}
          fixed={true}
          buttons={[
            {
              text: "Back",
              isBackButton: true,
              onClick: onBack,
              className: "rounded-md w-full",
            },
          ]}
        />
      </>
    );
  },
);

SplitBillGrid.displayName = "SplitBillGrid";

export default SplitBillGrid;
