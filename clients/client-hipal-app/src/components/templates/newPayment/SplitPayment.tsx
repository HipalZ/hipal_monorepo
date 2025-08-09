"use client";
import { memo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Check,
  CreditCard,
  User,
  MapPin,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BillData } from "@/components/types/businessData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePaymentStore } from "@/components/store/usePaymentStore";

interface BillDataProps {
  billData: BillData[];
}

const MemoSplitPayment = ({ billData }: BillDataProps) => {
  const setClaimedCoins = usePaymentStore((state) => state.setClaimedCoins);
  const setBillData = usePaymentStore((state) => state.setBillData);
  const setBillValue = usePaymentStore((state) => state.setBillValue);
  const setIsBillSplit = usePaymentStore((state) => state.setIsBillSplit);
  const setSelectedTip = usePaymentStore((state) => state.setSelectedTip);
  const setSelectedBill = usePaymentStore((state) => state.setSelectedBill);

  const handlePayment = (payment: BillData) => {
    setBillData(payment);
    setSelectedBill(payment);
    setBillValue(payment?.total);
    setClaimedCoins(payment?.claimedCoins);
    setSelectedTip(payment?.tips?.toString() || "");
    setIsBillSplit(false);
  };

  const getTotalItems = (variant: BillData) => {
    return variant.billItems
      .flatMap((group: any) => group.items)
      .reduce((sum: number, item: any) => sum + item.quantity, 0);
  };

  const getItemsList = (variant: BillData) => {
    if (!variant.billItems) return [];

    return variant.billItems
      .flatMap((group) => group.items)
      .map((item) => ({
        name: item.dish?.name ?? "Unknown item",
        portion: item.portion?.name ?? "Standard",
        quantity: item.quantity ?? 0,
        extras: Array.isArray(item.extras)
          ? item.extras.map((e) => e.name ?? "").filter((n) => n)
          : [],
      }));
  };
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 !poppins-regular !text-black h-[95dvh] overflow-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold !poppins-regular">Bill Payment</h1>
        <p className="text-muted-foreground">
          Select a bill variant to proceed with payment
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {billData.map((variant) => {
          const totalItems = getTotalItems(variant);
          const itemsList = getItemsList(variant);

          return (
            <Card
              key={variant.variantId}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                variant.isPaid
                  ? "border-green-200 bg-green-50"
                  : "border-border hover:border-primary/50",
              )}
            >
              {variant.isPaid && (
                <div className="absolute top-4 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Paid
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Variant #{variant.variantName}
                  </CardTitle>
                  {!variant.isPaid && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-200"
                    >
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{variant.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Table {variant.tableName}</span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Phone: {variant.customerPhone}
                </div>

                <Separator />

                {/* Order Summary */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="order-details" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShoppingBag className="w-4 h-4" />
                        Order Details ({totalItems} items)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className="space-y-3">
                        {itemsList.map((item, idx) => (
                          <div
                            key={idx}
                            className="text-sm space-y-1 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="font-medium">{item.name}</span>
                                <div className="text-muted-foreground text-xs mt-1">
                                  Portion: {item.portion}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                            {item.extras.length > 0 && (
                              <div className="text-muted-foreground text-xs border-t pt-2 mt-2">
                                <span className="font-medium">Extras: </span>
                                {item.extras.map(
                                  (extra: any, extraIdx: number) => (
                                    <span key={extraIdx}>
                                      {extra.name} (₹{extra.price})
                                      {extraIdx < item.extras.length - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator />

                {/* Bill Breakdown */}

                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>₹{variant.total}</span>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {variant.isPaid ? (
                    <Button
                      variant="outline"
                      className="w-full bg-green-900 text-white"
                      disabled
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Payment Completed
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handlePayment(variant)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{variant.total}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const SplitPayment = memo(MemoSplitPayment);
export default SplitPayment;
