"use client";

import { motion } from "framer-motion";
import { Receipt, User } from "lucide-react";
import { memo, useMemo } from "react";
import { Coins, Gift } from "lucide-react";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const MemoBillPage = () => {
  const { loyaltySetting } = useLoyaltyData();
  const currencySymbol = _useAllBusiness(
    (s) => s.data.outletInfo?.currencySymbol,
  );
  const { showBillPage, setShowBillPage, billData } = usePaymentStore();

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

  // Group items by GST rate and calculate totals
  const itemsByGST = useMemo(() => {
    if (!billData?.billItems) return [];

    const grouped: { [key: number]: any[] } = {};

    // Filter out deleted items and group by GST rate
    billData.billItems
      .filter((item: any) => !item.isDeleted)
      .forEach((item: any) => {
        const gstRate = item.dish.gst || 0;
        if (!grouped[gstRate]) {
          grouped[gstRate] = [];
        }
        grouped[gstRate].push(item);
      });

    // Convert to array with calculated totals
    return Object.entries(grouped)
      .map(([gstRate, items]) => {
        const subTotal = items.reduce(
          (sum, item) => sum + calculateItemTotal(item),
          0,
        );
        const totalGst = (subTotal * Number(gstRate)) / 100;

        return {
          gst: Number(gstRate),
          items,
          subTotal,
          totalGst,
        };
      })
      .sort((a, b) => a.gst - b.gst);
  }, [billData?.billItems]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <BottomPopUp
      height="h-[100dvh]"
      bottomCross
      hide
      show={showBillPage}
      onClose={() => setShowBillPage(false)}
    >
      <main className="bg-white pb-20 overflow-auto h-[100dvh] hide-scrollbar">
        <motion.div
          className="max-w-2xl mx-auto rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header Section */}
          <header className="p-4 rounded-t-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Bill Details
                </h1>
                <p className="text-black text-sm">
                  Bill ID: {billData?.billId || "Id"}
                </p>
              </div>
              <div className="text-right text-[#008800]">
                <p className="text-lg font-semibold">
                  Table {billData?.tableName || "table"}
                </p>
                <p className="text-sm text-black">
                  Customer: {billData?.customerName || "Guest"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-black">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{billData?.customerPhone || "Phone not provided"}</span>
              </div>
            </div>
          </header>

          {loyaltySetting?.loyaltyId && (
            <motion.div
              className="w-full max-w-md mx-auto p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-3 border border-amber-200">
                {/* Coin Value Proposition */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    className="relative"
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                      duration: 1.5,
                    }}
                  >
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {currencySymbol}1
                      </span>
                    </div>
                    <motion.div
                      className="absolute -right-1 -bottom-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1.1 }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 1.5,
                      }}
                    >
                      <Coins className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900">
                      1 Coin = 1 {currencySymbol}
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Earn exciting coinz by paying your bill!
                    </p>
                  </div>
                </div>

                {/* Process Steps */}
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-amber-700" />
                    </div>
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Redeem</span>
                      <span className="text-amber-700">
                        {" "}
                        for amazing rewards!
                      </span>
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          <motion.section
            className="mx-4 p-4 border-t border-x rounded-t-2xl"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-black text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Order Details
            </h2>

            <div className="space-y-6">
              {itemsByGST.length > 0 ? (
                itemsByGST.map((billGroup, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    {/* GST Group Header */}
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-700">
                        GST {billGroup.gst}% Items
                      </h3>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{billGroup.items.length} items</span>
                        <span>
                          Subtotal: {currencySymbol}
                          {billGroup.subTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items in this GST group */}
                    <div className="space-y-3 pl-4">
                      {billGroup.items.map((item: any, index: number) => (
                        <motion.article
                          key={`${item._id}-${index}`}
                          variants={itemVariants}
                          className="border-b last:border-0 pb-3 last:pb-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-black">
                                {item?.dish?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Quantity: {item?.quantity}
                              </p>
                              {item?.dish?.instruction && (
                                <p className="text-xs text-orange-600 italic mt-1">
                                  Note: {item.dish.instruction}
                                </p>
                              )}
                            </div>
                            <p className="font-medium text-black">
                              {currencySymbol}
                              {calculateItemTotal(item).toFixed(2)}
                            </p>
                          </div>

                          {item?.portion && (
                            <div className="mt-2 pl-4 border-l-2 border-blue-100">
                              <div className="flex justify-between text-sm text-blue-600">
                                <span>+ {item?.portion?.name}</span>
                                <span>
                                  {currencySymbol}
                                  {item?.portion?.price}
                                </span>
                              </div>
                            </div>
                          )}

                          {item?.extras?.length > 0 && (
                            <div className="mt-2 pl-4 border-l-2 border-green-100">
                              {item?.extras.map((extra: any, idx: number) => (
                                <div
                                  key={`${extra.id}-${idx}`}
                                  className="flex justify-between text-sm text-green-600"
                                >
                                  <span>
                                    + {extra?.name} (x{extra?.quantity})
                                  </span>
                                  <span>
                                    {currencySymbol}
                                    {(extra?.price * extra?.quantity).toFixed(
                                      2,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.article>
                      ))}
                    </div>

                    {/* GST Group Summary */}
                    {billGroup.gst > 0 && (
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>GST ({billGroup.gst}%)</span>
                          <span>
                            {currencySymbol}
                            {billGroup.totalGst.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No items found in this bill</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Bill Summary */}
          <motion.footer
            className="mx-4 p-4 bg-white border rounded-b-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              {billData?.subTotal ? (
                <div className="flex justify-between text-black">
                  <span>Subtotal</span>
                  <span>
                    {currencySymbol}
                    {billData?.subTotal.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.gst > 0 ? (
                <div className="flex justify-between text-black">
                  <span>Total GST</span>
                  <span>
                    {currencySymbol}
                    {billData?.gst.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.otherTax > 0 ? (
                <div className="flex justify-between text-black">
                  <span>Other Tax</span>
                  <span>
                    {currencySymbol}
                    {billData?.otherTax.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.claimedCoins > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Coins</span>
                  <span>
                    -{currencySymbol}
                    {billData?.claimedCoins.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.couponDiscount > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>
                    -{currencySymbol}
                    {billData?.couponDiscount.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.serviceCharge > 0 ? (
                <div className="flex justify-between text-black">
                  <span>Service Charge</span>
                  <span>
                    {currencySymbol}
                    {billData?.serviceCharge.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.discount > 0 ? (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    -{currencySymbol}
                    {billData?.discount.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {billData?.tips > 0 ? (
                <div className="flex justify-between text-black">
                  <span>Tips</span>
                  <span>
                    {currencySymbol}
                    {billData?.tips.toFixed(2)}
                  </span>
                </div>
              ) : null}

              <div className="h-px bg-gray-200 my-2" />

              <div className="text-black flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {currencySymbol}
                  {billData?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.footer>
        </motion.div>
      </main>
    </BottomPopUp>
  );
};

const BillPage = memo(MemoBillPage);

export default BillPage;
