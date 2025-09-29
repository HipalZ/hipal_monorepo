"use client";

import { motion } from "framer-motion";
import { Receipt, User, Coins, Gift } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import type { BillItem } from "@hipal/server/src/utils/reportHelper/itemType";
import { Button } from "../../ui/button";
import type { IBusinessData } from "../../types/businessData";

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

/** ==== Types that handle both shapes ==== */
type FlatItem = BillItem;

type GstGroup = {
  gst: number;
  items: FlatItem[];
  subTotal?: number;
  totalGst?: number;
};

type FlatBill = {
  billItems: FlatItem[];
  subTotal?: number;
  gst?: number; // total GST amount
  otherTax?: number;
  claimedCoins?: number;
  couponDiscount?: number;
  serviceCharge?: number;
  discount?: number;
  tips?: number;
  total?: number;
  billId?: string;
  tableName?: string;
  customerName?: string;
  customerPhone?: string;
};

type GroupedBill = {
  billItems: GstGroup[];
  subTotal?: number;
  gst?: number;
  otherTax?: number;
  claimedCoins?: number;
  couponDiscount?: number;
  serviceCharge?: number;
  discount?: number;
  tips?: number;
  total?: number;
  billId?: string;
  tableName?: string;
  customerName?: string;
  customerPhone?: string;
};

type AnyBill = FlatBill | GroupedBill;

/** ==== Shape detector ==== */
const isGrouped = (
  billData: AnyBill | undefined | null,
): billData is GroupedBill => {
  const arr = billData?.billItems as any[];
  return (
    Array.isArray(arr) &&
    arr.length > 0 &&
    typeof arr[0] === "object" &&
    "items" in arr[0]
  );
};

/** ==== Helpers ==== */
const MemoBillPage = ({ bizData }: { bizData: IBusinessData }) => {
  const { loyaltySetting } = useLoyaltyData();
  const currencySymbolRaw = _useAllBusiness(
    (s) => s.data.outletInfo?.currencySymbol,
  );
  const currency = currencySymbolRaw || "₹";
  const { showBillPage, setShowBillPage, billData } = usePaymentStore();
  const data = billData as AnyBill | undefined;
  const formatMoney = (n: number) => Number(n || 0).toFixed(1);

  const { name: businessName, address, gst, fssai } = bizData?.outletInfo || {};

  console.log(bizData);
  const calculateItemTotal = useCallback((item: FlatItem): number => {
    const dishPrice = Number(item?.dish?.price ?? 0);
    const portionPrice = Number(item?.portion?.price ?? 0);

    const extrasTotal = Array.isArray(item?.extras)
      ? item.extras.reduce((sum, extra) => {
          const p = Number(extra?.price ?? 0);
          const q = Number(extra?.quantity ?? 0);
          return sum + p * q;
        }, 0)
      : 0;

    const quantity = Number(item?.quantity ?? 0);
    const lineTotal = (dishPrice + portionPrice + extrasTotal) * quantity;
    const itemDiscount = Number(item?.discount ?? 0);
    return Math.max(lineTotal - itemDiscount, 0);
  }, []);

  /** Normalize to GST groups (works for both shapes) + compute reliable totals */
  const { itemsByGST, computed } = useMemo(() => {
    const raw = data?.billItems ?? [];

    // If already grouped
    if (isGrouped(data)) {
      const groups = (raw as GstGroup[])
        .map((g) => {
          const items = (g.items ?? []).filter(
            (it: any) =>
              it && it.isDeleted !== true && Number(it?.quantity ?? 0) > 0,
          );
          const sub = items.reduce((sum, i) => sum + calculateItemTotal(i), 0);
          const gstRate = Number(g.gst ?? 0);
          const tax = (sub * gstRate) / 100;
          return {
            gst: gstRate,
            items,
            subTotal: Number.isFinite(g.subTotal) ? Number(g.subTotal) : sub,
            totalGst: Number.isFinite(g.totalGst) ? Number(g.totalGst) : tax,
          };
        })
        .sort((a, b) => a.gst - b.gst);

      const sumSub = groups.reduce((s, gi) => s + (gi.subTotal ?? 0), 0);
      const sumGst = groups.reduce((s, gi) => s + (gi.totalGst ?? 0), 0);

      return {
        itemsByGST: groups,
        computed: { subTotal: sumSub, gst: sumGst },
      };
    }

    // Flat items -> group now
    const flat = (raw as FlatItem[]).filter(
      (it: any) => it && it.isDeleted !== true && Number(it?.quantity ?? 0) > 0,
    );
    const bucket: Record<string, FlatItem[]> = {};
    for (const it of flat) {
      const rate = String(Number(it?.dish?.gst ?? 0));
      if (!bucket[rate]) bucket[rate] = [];
      bucket[rate].push(it);
    }

    const groups = Object.entries(bucket)
      .map(([rate, items]) => {
        const sub = items.reduce((sum, i) => sum + calculateItemTotal(i), 0);
        const gstRate = Number(rate);
        return {
          gst: gstRate,
          items,
          subTotal: sub,
          totalGst: (sub * gstRate) / 100,
        };
      })
      .sort((a, b) => a.gst - b.gst);

    const sumSub = groups.reduce((s, gi) => s + (gi.subTotal ?? 0), 0);
    const sumGst = groups.reduce((s, gi) => s + (gi.totalGst ?? 0), 0);

    return { itemsByGST: groups, computed: { subTotal: sumSub, gst: sumGst } };
  }, [data, calculateItemTotal]);

  /** Prefer API totals but fall back to computed to keep UI consistent */
  const footer = useMemo(() => {
    const subTotal = Number((data as any)?.subTotal ?? computed.subTotal ?? 0);
    const totalGst = Number((data as any)?.gst ?? computed.gst ?? 0);
    const otherTax = Number((data as any)?.otherTax ?? 0);
    const claimedCoins = Number((data as any)?.claimedCoins ?? 0);
    const couponDiscount = Number((data as any)?.couponDiscount ?? 0);
    const serviceCharge = Number((data as any)?.serviceCharge ?? 0);
    const discount = Number((data as any)?.discount ?? 0);
    const tips = Number((data as any)?.tips ?? 0);

    // If API total present, use it; else reconstruct a sane total
    const total =
      typeof (data as any)?.total === "number"
        ? Number((data as any)?.total)
        : Math.max(
            subTotal +
              totalGst +
              otherTax +
              serviceCharge +
              tips -
              claimedCoins -
              couponDiscount -
              discount,
            0,
          );

    return {
      subTotal,
      totalGst,
      otherTax,
      claimedCoins,
      couponDiscount,
      serviceCharge,
      discount,
      tips,
      total,
    };
  }, [data, computed]);
  /** ==== Download Invoice (HTML) ==== */
  const handleDownloadInvoice = useCallback(() => {
    const safeName = businessName.replace(/\s+/g, "_");
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}_Invoice_${dateStr}.html`;

    // Build a simple, clean HTML invoice using current grouped data
    const headerHtml = `
        <div style="text-align:center;margin-bottom:8px">
          <h1 style="margin:0;font-size:18px;">${businessName}</h1>
          ${
            address
              ? `<div style="font-size:12px;margin-top:2px;">${address}</div>`
              : ""
          }
          <div style="font-size:12px;margin-top:2px;">
            ${gst ? `gst: ${gst}` : ""} ${
              fssai ? `&nbsp;&nbsp;FSSAI: ${fssai}` : ""
            }
          </div>
          <hr style="margin:8px 0;border:0;border-top:1px solid #000"/>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;">
          <div>Bill ID: ${(data as any)?.billId || "-"}</div>
          <div>Date: ${new Date().toLocaleString("en-IN")}</div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;margin-bottom:8px;">
          <div>Table: ${(data as any)?.tableName || "-"}</div>
          <div>Customer: ${(data as any)?.customerName || "Guest"}</div>
          <div>Phone: ${(data as any)?.customerPhone || "-"}</div>
        </div>
        <hr style="margin:8px 0;border:0;border-top:1px solid #000"/>
        <div style="font-weight:700;font-size:12px;display:grid;grid-template-columns:1fr 60px 70px 80px;gap:8px;">
          <div>Item</div>
          <div style="text-align:center">Qty</div>
          <div style="text-align:right">Price</div>
          <div style="text-align:right">Amount</div>
        </div>
        <hr style="margin:6px 0;border:0;border-top:1px dashed #888"/>
      `;

    const itemsHtml = itemsByGST
      .map((group) => {
        const groupHead =
          group.gst > 0
            ? `<div style="background:#f6f6f6;border:1px solid #eee;padding:6px;margin:8px 0 6px 0;font-size:12px;font-weight:600;">
                  GST ${
                    group.gst
                  }% Items &nbsp;|&nbsp; Subtotal: ${currency}${formatMoney(
                    group.subTotal ?? 0,
                  )}
                </div>`
            : "";

        const rows = group.items
          .map((item) => {
            const qty = Number(item?.quantity ?? 0);
            const unitPrice =
              Number(item?.dish?.price ?? 0) === 0
                ? Number(item?.portion?.price ?? 0)
                : Number(item?.dish?.price ?? 0);
            const lineTotal = unitPrice * qty;

            const baseRow = `
                <div style="display:grid;grid-template-columns:1fr 60px 70px 80px;gap:8px;font-size:12px;padding:4px 0;border-bottom:1px dashed #ddd;">
                  <div>${item?.dish?.name}${
                    item?.portion ? ` (${item?.portion?.name})` : ""
                  }</div>
                  <div style="text-align:center">${qty}</div>
                  <div style="text-align:right">${currency}${formatMoney(
                    unitPrice,
                  )}</div>
                  <div style="text-align:right">${currency}${formatMoney(
                    lineTotal,
                  )}</div>
                </div>
              `;

            const extrasHtml = (item?.extras || [])
              .map((ex) => {
                const exQty = Number(ex?.quantity ?? 0) * qty;
                const exUnit = Number(ex?.price ?? 0);
                const exTotal = exUnit * exQty;
                return `
                    <div style="margin-left:10px;display:grid;grid-template-columns:1fr 60px 70px 80px;gap:8px;font-size:11px;padding:3px 0;">
                      <div>+ ${ex?.name}</div>
                      <div style="text-align:center">${exQty}</div>
                      <div style="text-align:right">${currency}${formatMoney(
                        exUnit,
                      )}</div>
                      <div style="text-align:right">${currency}${formatMoney(
                        exTotal,
                      )}</div>
                    </div>
                  `;
              })
              .join("");

            return baseRow + (extrasHtml || "");
          })
          .join("");

        const gstLine =
          group.gst > 0
            ? `
              <div style="background:#fafafa;padding:6px;border:1px solid #eee;margin-top:4px;font-size:12px;">
                <div style="display:flex;justify-content:space-between;">
                  <span>CGST (${(group.gst / 2).toFixed(2)}%)</span>
                  <span>${currency}${formatMoney((group.totalGst ?? 0) / 2)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span>SGST (${(group.gst / 2).toFixed(2)}%)</span>
                  <span>${currency}${formatMoney((group.totalGst ?? 0) / 2)}</span>
                </div>
              </div>`
            : "";

        return groupHead + rows + gstLine;
      })
      .join("");

    const summaryHtml = `
        <hr style="margin:8px 0;border:0;border-top:1px solid #000"/>
        <div style="font-size:12px;display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;justify-content:space-between;">
            <span>Subtotal</span>
            <span>${currency}${formatMoney(footer.subTotal)}</span>
          </div>
          ${
            footer.totalGst > 0
              ? `<div style="display:flex;justify-content:space-between;">
                   <span>CGST</span>
                   <span>${currency}${formatMoney(footer.totalGst / 2)}</span>
                 </div>
                 <div style="display:flex;justify-content:space-between;">
                   <span>SGST</span>
                   <span>${currency}${formatMoney(footer.totalGst / 2)}</span>
                 </div>`
              : ""
          }
          ${
            footer.otherTax > 0
              ? `<div style="display:flex;justify-content:space-between;">
                   <span>Other Tax</span>
                   <span>${currency}${formatMoney(footer.otherTax)}</span>
                 </div>`
              : ""
          }
          ${
            footer.serviceCharge > 0
              ? `<div style="display:flex;justify-content:space-between;">
                   <span>Service Charge</span>
                   <span>${currency}${formatMoney(footer.serviceCharge)}</span>
                 </div>`
              : ""
          }
          ${
            footer.discount > 0
              ? `<div style="display:flex;justify-content:space-between;color:#137a13;">
                   <span>Discount</span>
                   <span>-${currency}${formatMoney(footer.discount)}</span>
                 </div>`
              : ""
          }
          ${
            footer.claimedCoins > 0
              ? `<div style="display:flex;justify-content:space-between;color:#137a13;">
                   <span>Loyalty Coins</span>
                   <span>-${currency}${formatMoney(footer.claimedCoins)}</span>
                 </div>`
              : ""
          }
          ${
            footer.couponDiscount > 0
              ? `<div style="display:flex;justify-content:space-between;color:#137a13;">
                   <span>Coupon Discount</span>
                   <span>-${currency}${formatMoney(footer.couponDiscount)}</span>
                 </div>`
              : ""
          }
          ${
            footer.tips > 0
              ? `<div style="display:flex;justify-content:space-between;">
                   <span>Tips</span>
                   <span>${currency}${formatMoney(footer.tips)}</span>
                 </div>`
              : ""
          }
          <div style="border-top:2px solid #000;margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;">
            <span>GRAND TOTAL</span>
            <span>${currency}${formatMoney(footer.total)}</span>
          </div>
        </div>
        <div style="text-align:center;margin-top:10px;font-size:12px;">
          <hr style="margin:6px 0;border:0;border-top:1px solid #000"/>
          <em>Thank you! Visit Again.</em>
        </div>
      `;

    const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>${businessName} Invoice</title>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
  </head>
  <body style="font-family:Arial,Helvetica,'Segoe UI',sans-serif;color:#000;margin:12px;">
    ${headerHtml}
    ${itemsHtml || "<div style='font-size:12px;'>No items</div>"}
    ${summaryHtml}
  </body>
  </html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [
    businessName,
    currency,
    itemsByGST,
    footer.subTotal,
    footer.totalGst,
    footer.otherTax,
    footer.claimedCoins,
    footer.couponDiscount,
    footer.serviceCharge,
    footer.discount,
    footer.tips,
    footer.total,
    address,
    gst,
    fssai,
    data,
  ]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <BottomPopUp
      height="h-[100dvh]"
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
          {/* Header */}
          <header className="p-4 rounded-t-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Bill Details
                </h1>
                <p className="text-black text-sm">
                  Bill ID: {(data as any)?.billId.slice(-6) || "Id"}
                </p>
              </div>
              <div className="text-right text-[#008800]">
                <p className="text-lg font-semibold">
                  Table {(data as any)?.tableName || "table"}
                </p>
                <p className="text-sm text-black">
                  Customer: {(data as any)?.customerName || "Guest"}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-black">
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>
                  {(data as any)?.customerPhone || "Phone not provided"}
                </span>
              </div>
            </div>
          </header>

          {/* Loyalty Card */}
          {loyaltySetting?.loyaltyId && (
            <motion.div
              className="w-full max-w-md mx-auto p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-3 border border-amber-200">
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
                        {currency}1
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
                      1 Coin = 1 {currency}
                    </h3>
                    <p className="text-amber-700 text-sm">
                      Earn exciting coinz by paying your bill!
                    </p>
                  </div>
                </div>
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

          {/* Items */}
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
                  <div
                    key={`gst-${billGroup.gst}-${groupIndex}`}
                    className="space-y-4"
                  >
                    {/* Group header */}
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <h3 className="font-semibold text-gray-700">
                        GST {billGroup.gst}% Items
                      </h3>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{billGroup.items.length} items</span>
                        <span>
                          Subtotal: {currency}
                          {(billGroup.subTotal ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 pl-4">
                      {billGroup.items.map((item: any, index: number) => (
                        <motion.article
                          key={`${item?._id ?? item?.id ?? "row"}-${index}`}
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
                              {currency}
                              {calculateItemTotal(item).toFixed(2)}
                            </p>
                          </div>

                          {item?.portion && (
                            <div className="mt-2 pl-4 border-l-2 border-blue-100">
                              <div className="flex justify-between text-sm text-blue-600">
                                <span>+ {item?.portion?.name}</span>
                                <span>
                                  {currency}
                                  {Number(item?.portion?.price ?? 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}

                          {item?.extras?.length > 0 && (
                            <div className="mt-2 pl-4 border-l-2 border-green-100">
                              {item?.extras.map((extra: any, idx: number) => (
                                <div
                                  key={`${
                                    extra?.id ?? extra?.name ?? "extra"
                                  }-${idx}`}
                                  className="flex justify-between text-sm text-green-600"
                                >
                                  <span>
                                    + {extra?.name} (x
                                    {extra?.quantity * item?.quantity})
                                  </span>
                                  <span>
                                    {currency}
                                    {(
                                      Number(extra?.price ?? 0) *
                                      Number(extra?.quantity ?? 0) *
                                      Number(item?.quantity ?? 0)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.article>
                      ))}
                    </div>

                    {/* Group GST line */}
                    {billGroup.gst > 0 && (
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>GST ({billGroup.gst}%)</span>
                          <span>
                            {currency}
                            {(billGroup.totalGst ?? 0).toFixed(2)}
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

          {/* Footer */}
          <motion.footer
            className="mx-4 p-4 bg-white border rounded-b-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-2">
              {footer.subTotal > 0 && (
                <div className="flex justify-between text-black">
                  <span>Subtotal</span>
                  <span>
                    {currency}
                    {footer.subTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.totalGst > 0 && (
                <>
                  <div className="flex justify-between text-black">
                    <span>CGST</span>
                    <span>
                      {currency}
                      {(footer.totalGst / 2).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>SGST</span>
                    <span>
                      {currency}
                      {(footer.totalGst / 2).toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {footer.otherTax > 0 && (
                <div className="flex justify-between text-black">
                  <span>Other Tax</span>
                  <span>
                    {currency}
                    {footer.otherTax.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.claimedCoins > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Coins</span>
                  <span>
                    -{currency}
                    {footer.claimedCoins.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>
                    -{currency}
                    {footer.couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.serviceCharge > 0 && (
                <div className="flex justify-between text-black">
                  <span>Service Charge</span>
                  <span>
                    {currency}
                    {footer.serviceCharge.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    -{currency}
                    {footer.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {footer.tips > 0 && (
                <div className="flex justify-between text-black">
                  <span>Tips</span>
                  <span>
                    {currency}
                    {footer.tips.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="h-px bg-gray-200 my-2" />

              <div className="text-black flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {currency}
                  {footer.total.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.footer>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-4">
            <Button
              className="flex-1 bg-black text-white"
              onClick={handleDownloadInvoice}
            >
              Download Invoice
            </Button>
            <Button
              className="flex-1 bg-red-400"
              onClick={() => setShowBillPage(false)}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </main>
    </BottomPopUp>
  );
};

const BillPage = memo(MemoBillPage);
export default BillPage;
