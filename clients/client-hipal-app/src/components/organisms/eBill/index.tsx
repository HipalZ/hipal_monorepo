"use client";

import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useMemo } from "react";
import { Receipt, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import type { IBusinessData } from "../../types/businessData";
import FoodType from "@/components/atoms/foodType";

const NoBillFound = dynamic(() => import("./noBill"));

interface IEbillProps {
  data: IBusinessData;
}

const MemoEBill = ({ data }: IEbillProps) => {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("billId") as string | null;
  const businessId = useParams().businessId as string;
  const router = useRouter();

  const businessData = data?.business;
  const businessName = businessData?.name || "Restaurant";

  const getEBill = async () => {
    const response = await apiRpc.pos.fetch_bill.$get({
      query: {
        orderId: orderId || "",
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

  // Group items by GST rate
  const itemsByGST = useMemo(() => {
    if (!billData?.billItems) return {};
    const grouped: Record<string, any[]> = {};
    billData.billItems.forEach((item: any) => {
      if (!item.isDeleted) {
        const gstRate = String(item?.dish?.gst || 0);
        if (!grouped[gstRate]) grouped[gstRate] = [];
        grouped[gstRate].push(item);
      }
    });
    return grouped;
  }, [billData?.billItems]);

  const calcUnitPrice = (item: any) =>
    item?.dish?.price === 0
      ? item?.portion?.price || 0
      : item?.dish?.price || 0;

  const calcExtrasTotal = (item: any) =>
    item?.extras?.reduce(
      (sum: number, extra: any) =>
        sum + (extra?.price || 0) * (extra?.quantity || 0),
      0
    ) || 0;

  const calcLineTotal = (item: any) => {
    const unit = calcUnitPrice(item);
    const extras = calcExtrasTotal(item);
    return (unit + extras) * (item?.quantity || 0);
  };

  const formatMoney = (val: number) => Number(val || 0).toFixed(1);

  const goToPay = () => {
    if (!orderId) return toast.error("No order ID found");
    router.push(`/${businessId}/posPayment?orderId=${orderId}`);
  };

  // ---- Download Invoice (as HTML) ----
  const downloadInvoice = () => {
    if (!billData) return;

    const dt = new Date(billData.date || Date.now());
    const dateForName = dt
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replaceAll(" ", "_")
      .replaceAll(",", "")
      .replaceAll(":", "-");

    const title = `${businessName}_Invoice_${dateForName}`;
    const rowsHtml = Object.entries(itemsByGST)
      .map(([gstRate, items]) => {
        const itemsHtml = (items as any[])
          .map((item) => {
            const unit = calcUnitPrice(item);
            const qty = item?.quantity || 0;
            const extras = item?.extras || [];
            const lineTotal = calcLineTotal(item);
            const portionHtml = item?.portion
              ? ` <span style="color:#2563eb;">(${item?.portion?.name})</span>`
              : "";

            const extrasHtml =
              extras?.length > 0
                ? `<div style="margin-left:8px;margin-top:2px;">
                  ${extras
                    .map((ex: any) => {
                      const exQty = (ex?.quantity || 0) * qty;
                      const exTotal = (ex?.price || 0) * exQty;
                      return `<div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:6px;font-size:12px;">
                          <div>+ ${ex?.name || ""}</div>
                          <div style="text-align:center;">${exQty}</div>
                          <div style="text-align:right;">₹${formatMoney(
                            ex?.price || 0
                          )}</div>
                          <div style="text-align:right;">₹${formatMoney(
                            exTotal
                          )}</div>
                        </div>`;
                    })
                    .join("")}
                </div>`
                : "";

            return `<div style="padding:6px 0;border-bottom:1px dashed #d1d5db;">
                <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:6px;">
                  <div>
                    <strong>${item?.dish?.name || ""}</strong>${portionHtml}
                  </div>
                  <div style="text-align:center;">× ${qty}</div>
                  <div style="text-align:right;">₹${formatMoney(unit)}</div>
                  <div style="text-align:right;">₹${formatMoney(
                    lineTotal
                  )}</div>
                </div>
                ${extrasHtml}
              </div>`;
          })
          .join("");

        return `
          <div style="margin:10px 0;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <div style="background:#f9fafb;padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">
              GST ${gstRate}% Items (${(items as any[]).length})
            </div>
            <div style="padding:8px 12px;">
              <!-- header -->
              <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:6px;font-weight:700;margin-bottom:6px;">
                <div>Item</div>
                <div style="text-align:center;">Qty</div>
                <div style="text-align:right;">Price</div>
                <div style="text-align:right;">Amount</div>
              </div>
              ${itemsHtml}
            </div>
          </div>`;
      })
      .join("");

    const gstFssaiHtml =
      (businessData?.gst ? `<div>GSTIN: ${businessData.gst}</div>` : "") +
      (businessData?.fssai ? `<div>FSSAI: ${businessData.fssai}</div>` : "");

    const summaryHtml = `
      <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
        <div style="display:flex;justify-content:space-between;margin:6px 0;">
          <span>Subtotal</span><strong>₹${formatMoney(
            billData?.subTotal
          )}</strong>
        </div>
        ${
          billData?.gst > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;">
            <span>CGST</span><strong>₹${formatMoney(
              (billData?.gst || 0) / 2
            )}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin:6px 0;">
            <span>SGST</span><strong>₹${formatMoney(
              (billData?.gst || 0) / 2
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.otherTax > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;">
            <span>Other Tax</span><strong>₹${formatMoney(
              billData?.otherTax
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.serviceCharge > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;">
            <span>Service Charge</span><strong>₹${formatMoney(
              billData?.serviceCharge
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.discount > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;color:#16a34a;">
            <span>Discount</span><strong>-₹${formatMoney(
              billData?.discount
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.claimedCoins > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;color:#16a34a;">
            <span>Loyalty Coins</span><strong>-₹${formatMoney(
              billData?.claimedCoins
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.couponDiscount > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;color:#16a34a;">
            <span>Coupon Discount</span><strong>-₹${formatMoney(
              billData?.couponDiscount
            )}</strong>
          </div>
        `
            : ""
        }
        ${
          billData?.tips > 0
            ? `
          <div style="display:flex;justify-content:space-between;margin:6px 0;">
            <span>Tips</span><strong>₹${formatMoney(billData?.tips)}</strong>
          </div>
        `
            : ""
        }
        <div style="border-top:2px solid #e5e7eb;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:18px;">
          <span>Total</span><strong>₹${formatMoney(billData?.total)}</strong>
        </div>
      </div>
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;line-height:1.25;color:#111827;padding:16px;background:#fff;">
  <div style="text-align:center;margin-bottom:12px;">
    <h1 style="margin:0;font-size:22px;">${businessName}</h1>
    ${gstFssaiHtml}
    ${
      businessData?.address
        ? `<div style="font-size:12px;margin-top:6px;color:#374151;">${businessData.address}</div>`
        : ""
    }
  </div>

  <div style="border-top:2px solid #000;margin:8px 0;"></div>

  <div style="display:flex;justify-content:space-between;margin:6px 0;font-weight:600;">
    <div>Bill ID: ${billData?.billId || "-"}</div>
    <div>${new Date(billData?.date || Date.now()).toLocaleString("en-IN")}</div>
  </div>
  <div style="margin:4px 0;">Table: <strong>${
    billData?.tableName || "-"
  }</strong></div>

  <div style="margin-top:10px;">${rowsHtml}</div>

  <div style="margin-top:10px;">${summaryHtml}</div>

  <div style="text-align:center;margin-top:16px;color:#6b7280;">Thank you! Visit Again.</div>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
                  <p className="text-base text-gray-700">
                    <span className="font-semibold">{businessName}</span>
                  </p>
                  {businessData?.address && (
                    <p className="text-xs text-gray-500 max-w-xl mx-auto">
                      {businessData.address}
                    </p>
                  )}

                  {/* GST / FSSAI from businessData */}
                  <div className="text-sm text-gray-600 space-x-4">
                    {businessData?.gst && (
                      <span className="inline-block">
                        GSTIN: {businessData.gst}
                      </span>
                    )}
                    {businessData?.fssai && (
                      <span className="inline-block">
                        FSSAI: {businessData.fssai}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col w-full justify-between text-sm text-gray-700">
                    <section className="space-x-4 flex">
                      <div className="flex-1">
                        Bill ID: <strong>{billData.billId.slice(-6)}</strong>
                      </div>
                      <div className="flex-1">
                        Table: <strong>{billData.tableName}</strong>
                      </div>
                    </section>
                    <span>
                      {new Date(billData.date || Date.now()).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </header>

              {/* Items List by GST Groups (with 4-column grid) */}
              <section className="space-y-6">
                <AnimatePresence mode="wait">
                  {Object.keys(itemsByGST).length > 0 ? (
                    Object.entries(itemsByGST).map(
                      ([gstRate, items], groupIndex) => (
                        <motion.div
                          key={gstRate}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIndex * 0.06 }}
                          className="bg-white rounded-lg shadow-sm  overflow-hidden"
                        >
                          {/* GST Group Header */}
                          <div className=" px-4 py-3 border-b ">
                            <h3 className="font-semibold text-gray-700">
                              GST {gstRate}% Items ({(items as any[]).length}{" "}
                              items)
                            </h3>
                          </div>

                          {/* Table Header */}
                          <div className="px-4 pt-3 pb-2 text-xs font-semibold text-gray-700">
                            <div className="grid grid-cols-12 gap-2">
                              {/* Dish name (6/12 = 50%) */}
                              <div className="col-span-6">Item</div>

                              {/* Qty (2/12 = 16.6%) */}
                              <div className="col-span-2 text-center">Qty</div>

                              {/* Price (2/12 = 16.6%) */}
                              <div className="col-span-2 text-right">Price</div>

                              {/* Amount (2/12 = 16.6%) */}
                              <div className="col-span-2 text-right">
                                Amount
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="divide-y divide-gray-100">
                            {(items as any[]).map(
                              (item: any, index: number) => {
                                const unitPrice = calcUnitPrice(item);
                                const qty = item?.quantity || 0;
                                const extras = item?.extras || [];
                                const lineTotal = calcLineTotal(item);

                                return (
                                  <motion.article
                                    key={`${item._id}-${index}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay:
                                        (groupIndex * (items as any[]).length +
                                          index) *
                                        0.03,
                                    }}
                                    className="py-4 px-2"
                                  >
                                    {/* Main row */}
                                    <div className="grid grid-cols-12 gap-2 text-sm items-start">
                                      {/* Dish name (6/12 = 50%) */}
                                      <div className="col-span-6 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <FoodType
                                            types={item?.dish?.dishTypes}
                                          />
                                          <h4 className="font-medium text-gray-900">
                                            {item?.dish?.name}
                                          </h4>
                                        </div>
                                        {item?.portion && (
                                          <p className="text-xs text-blue-600 mt-1">
                                            Portion: {item.portion.name}{" "}
                                            <span className="text-gray-500">
                                              (+₹
                                              {formatMoney(
                                                item?.portion?.price || 0
                                              )}
                                              )
                                            </span>
                                          </p>
                                        )}
                                      </div>

                                      {/* Qty (2/12 = ~16.6%) */}
                                      <div className="col-span-2 text-center font-medium text-gray-700">
                                        × {qty}
                                      </div>

                                      {/* Price (2/12 = ~16.6%) */}
                                      <div className="col-span-2 text-right text-gray-700">
                                        ₹{formatMoney(unitPrice)}
                                      </div>

                                      {/* Amount (2/12 = ~16.6%) */}
                                      <div className="col-span-2 text-right font-semibold text-gray-900">
                                        ₹{formatMoney(lineTotal)}
                                      </div>
                                    </div>

                                    {/* Extras in same 4-col grid, indented & smaller */}
                                    {extras?.length > 0 && (
                                      <div className="ml-5 mt-2 space-y-1">
                                        {extras.map((ex: any, idx: number) => {
                                          const exQty =
                                            (ex?.quantity || 0) * qty;
                                          const exTotal =
                                            (ex?.price || 0) * exQty;

                                          return (
                                            <div
                                              key={`${ex?.id}-${idx}`}
                                              className="grid grid-cols-12 gap-2 text-xs text-gray-600"
                                            >
                                              {/* name 50% */}
                                              <div className="col-span-6 truncate">
                                                + {ex?.name}
                                              </div>

                                              {/* qty 16.6% */}
                                              <div className="col-span-2 text-center">
                                                {exQty}
                                              </div>

                                              {/* price 16.6% */}
                                              <div className="col-span-2 text-right">
                                                ₹{formatMoney(ex?.price || 0)}
                                              </div>

                                              {/* amount 16.6% */}
                                              <div className="col-span-2 text-right">
                                                ₹{formatMoney(exTotal)}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </motion.article>
                                );
                              }
                            )}
                          </div>
                        </motion.div>
                      )
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
                    <span>₹{formatMoney(billData?.subTotal)}</span>
                  </div>

                  {billData?.gst > 0 && (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>CGST</span>
                        <span>₹{formatMoney((billData?.gst || 0) / 2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>SGST</span>
                        <span>₹{formatMoney((billData?.gst || 0) / 2)}</span>
                      </div>
                    </>
                  )}

                  {billData?.otherTax > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Other Tax</span>
                      <span>₹{formatMoney(billData?.otherTax)}</span>
                    </div>
                  )}

                  {billData?.serviceCharge > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Service Charge</span>
                      <span>₹{formatMoney(billData?.serviceCharge)}</span>
                    </div>
                  )}

                  {billData?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{formatMoney(billData?.discount)}</span>
                    </div>
                  )}

                  {billData?.claimedCoins > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Loyalty Coins</span>
                      <span>-₹{formatMoney(billData?.claimedCoins)}</span>
                    </div>
                  )}

                  {billData?.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span>-₹{formatMoney(billData?.couponDiscount)}</span>
                    </div>
                  )}

                  {billData?.tips > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tips</span>
                      <span>₹{formatMoney(billData?.tips)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{formatMoney(billData?.total)}</span>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Discount Info */}
              {(billData?.discount > 0 || billData?.reasonOfDiscount) && (
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
                    {billData?.discountAppliedOn === "ON_BILL"
                      ? "Overall Bill"
                      : "Item Wise"}
                  </p>
                  {billData?.reasonOfDiscount && (
                    <p className="text-sm text-amber-700 mt-1">
                      Reason: {billData?.reasonOfDiscount}
                    </p>
                  )}
                </motion.section>
              )}
            </>
          ) : (
            <NoBillFound />
          )}

          {/* Sticky note */}
          <div className="fixed bottom-20 md:bottom-24 left-0 right-0 p-2 text-center text-xs text-red-500 bg-red-50 border-t border-red-200">
            <span className="!text-xs">
              Note: This is a summary bill without detailed taxation breakdown
            </span>
          </div>

          {/* Sticky Footer Buttons */}
          <div className="fixed bottom-0 left-0 right-0">
            <div className="mx-auto max-w-2xl p-4 backdrop-blur-sm bg-white/80 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={downloadInvoice}
                  variant="outline"
                  className="w-full bg-red-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={goToPay}
                  className="w-full text-white bg-black"
                >
                  Pay
                  {/* <strong className="text-xs leading-3 text-white -mb-7 mt-1 block">
                    Powered by Hipalz
                  </strong> */}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const EBill = memo(MemoEBill);
export default EBill;
