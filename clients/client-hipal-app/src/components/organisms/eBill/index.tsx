"use client";

import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useMemo } from "react";
import { Receipt, User, Phone } from "lucide-react";
import FoodType from "@/components/atoms/foodType";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const NoBillFound = dynamic(() => import("./noBill"));

const MemoEBill = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("billId");
  const businessId = useParams().businessId;
  const router = useRouter();

  const getEBill = async () => {
    const response = await apiRpc.pos.fetch_bill.$get({
      query: {
        orderId: orderId,
      },
    });

    const res = await response.json();
    return res?.data || null;
  };

  const { data: billData = null, isPending } = useQuery({
    queryKey: ["eBill", orderId],
    queryFn: getEBill,
    enabled: !!orderId,
  });

  // Group items by GST rate for better organization
  const itemsByGST = useMemo(() => {
    if (!billData?.billItems) return {};

    const grouped: { [key: number]: any[] } = {};

    billData.billItems.forEach((item: any) => {
      if (!item.isDeleted) {
        const gstRate = item.dish.gst || 0;
        if (!grouped[gstRate]) {
          grouped[gstRate] = [];
        }
        grouped[gstRate].push(item);
      }
    });

    return grouped;
  }, [billData?.billItems]);

  // Calculate item total price
  const calculateItemTotal = (item: any) => {
    const dishPrice = item.dish.price;
    const portionPrice = item.portion?.price || 0;
    const extrasTotal =
      item.extras?.reduce(
        (sum: number, extra: any) => sum + extra.price * extra.quantity,
        0,
      ) || 0;
    return (dishPrice + portionPrice + extrasTotal) * item.quantity;
  };

  const goToPay = () => {
    if (!orderId) return toast.error("No order ID found");
    router.push(`/${businessId}/posPayment?orderId=${orderId}`);
  };

  return (
    <main className="min-h-screen pb-28 bg-gray-50">
      {isPending ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          {billData ? (
            <>
              {/* Header */}
              <header className="text-center space-y-4 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="w-6 h-6 text-gray-700" />
                  <h1 className="text-2xl font-semibold text-gray-900">
                    E-Bill
                  </h1>
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-800">
                    Bill ID: {billData.billId}
                  </p>
                  <p className="text-base text-gray-600">
                    Table: {billData.tableName}
                  </p>
                </div>
              </header>

              {/* Items List by GST Groups */}
              <section className="space-y-6">
                <AnimatePresence mode="wait">
                  {Object.keys(itemsByGST).length > 0 ? (
                    Object.entries(itemsByGST).map(
                      ([gstRate, items], groupIndex) => (
                        <motion.div
                          key={gstRate}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIndex * 0.1 }}
                          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                        >
                          {/* GST Group Header */}
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-700">
                              GST {gstRate}% Items ({items.length} items)
                            </h3>
                          </div>

                          {/* Items in this GST group */}
                          <div className="divide-y divide-gray-100">
                            {items.map((item: any, index: number) => (
                              <motion.article
                                key={`${item._id}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay:
                                    (groupIndex * items.length + index) * 0.05,
                                }}
                                className="p-4"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 pt-1">
                                    <FoodType types={item.dish.dishTypes} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-medium text-gray-900">
                                      {item.dish.name}
                                    </h4>
                                    <div className="mt-2 space-y-1">
                                      {item.portion && (
                                        <p className="text-sm text-blue-600">
                                          Portion: {item.portion.name}
                                          <span className="text-gray-500 ml-1">
                                            (+₹{item.portion.price})
                                          </span>
                                        </p>
                                      )}

                                      {item.extras &&
                                        item.extras.length > 0 && (
                                          <div className="text-sm text-green-600">
                                            <span className="font-medium">
                                              Add-ons:{" "}
                                            </span>
                                            {item.extras.map(
                                              (extra: any, idx: number) => (
                                                <span
                                                  key={`${extra.id}-${idx}`}
                                                >
                                                  {extra.name} (₹{extra.price} x{" "}
                                                  {extra.quantity})
                                                  {idx <
                                                    item.extras.length - 1 &&
                                                    ", "}
                                                </span>
                                              ),
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                                    <div className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded-full">
                                      × {item.quantity}
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">
                                      ₹{calculateItemTotal(item).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </motion.article>
                            ))}
                          </div>
                        </motion.div>
                      ),
                    )
                  ) : (
                    <NoBillFound />
                  )}
                </AnimatePresence>
              </section>

              {/* Bill Summary */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bill Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{billData.subTotal?.toFixed(2)}</span>
                  </div>

                  {billData.gst > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>CGST</span>
                      <span>₹{(billData?.gst / 2)?.toFixed(2)}</span>
                    </div>
                  )}
                  {billData.gst > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>SGST</span>
                      <span>₹{(billData?.gst / 2)?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.otherTax > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Other Tax</span>
                      <span>₹{billData.otherTax?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.serviceCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Service Charge</span>
                      <span>₹{billData.serviceCharge?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{billData.discount?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.claimedCoins > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Coins</span>
                      <span>-₹{billData.claimedCoins?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{billData.couponDiscount?.toFixed(2)}</span>
                    </div>
                  )}

                  {billData.tips > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tips</span>
                      <span>₹{billData.tips?.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{billData.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Discount Info */}
              {(billData.discount > 0 || billData.reasonOfDiscount) && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-amber-50 rounded-lg p-4 border border-amber-200"
                >
                  <h4 className="font-medium text-amber-800 mb-2">
                    Discount Applied
                  </h4>
                  <p className="text-sm text-amber-700">
                    Type:{" "}
                    {billData.discountAppliedOn === "ON_BILL"
                      ? "Overall Bill"
                      : "Item Wise"}
                  </p>
                  {billData.reasonOfDiscount && (
                    <p className="text-sm text-amber-700 mt-1">
                      Reason: {billData.reasonOfDiscount}
                    </p>
                  )}
                </motion.section>
              )}
            </>
          ) : (
            <NoBillFound />
          )}

          {/* Footer */}
          <div className="fixed bottom-20 md:bottom-24 left-0 right-0 p-2 text-center text-xs text-red-500 bg-red-50 border-t border-red-200">
            <span className="!text-xs">
              Note: This is a summary bill without detailed taxation breakdown
            </span>
          </div>

          <div className="fixed bottom-0 pb-6 left-0 w-full mx-auto right-0 p-4 text-center backdrop-blur-sm bg-white/80 border-t border-gray-200">
            <Button
              onClick={goToPay}
              className="w-full max-w-md flex flex-col mx-auto text-white bg-black"
            >
              Pay
              <strong className=" text-xs leading-3 text-white -mb-7 mt-1">
                Powered by Hipalz
              </strong>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

const EBill = memo(MemoEBill);
export default EBill;
