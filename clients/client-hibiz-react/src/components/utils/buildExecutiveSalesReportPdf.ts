// // src/utils/buildExecutiveSalesReportPdf.ts
// import jsPDF from "jspdf";
// import autoTable, { type RowInput } from "jspdf-autotable";

// export type ExecutiveReportInput = {
//   businessName: string;
//   from: number | string | Date;
//   to: number | string | Date;

//   salesData: {
//     overAllAmount: number;
//     onlineSale: { online: number };
//     offlineSale: Record<string, number>;
//     orderTypeCounts?: { delivery?: number; dineIn?: number; takeAway?: number };
//     invoiceRange?: string;
//     orderCount?: number;
//     subTotal?: number;
//     discount?: number;
//     roundOff?: number;
//     waivedOff?: number;
//   };

//   otherData?: {
//     otherSale: {
//       totalTax: number;
//       totalTip: number;
//       totalServiceCharge: number;
//     };
//     warningSale?: Record<string, number>;
//   };

//   salesExceptionData?: {
//     exceptionSale: { totalComplementary: number; totalDiscount: number };
//     rewardSale: {
//       totalCoinsGiven: number;
//       totalCoinsUsed: number;
//       totalCouponDiscount: number;
//     };
//   };
// };

// const INR = (n?: number) =>
//   (n ?? 0).toLocaleString("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   });

// const asDate = (v: number | string | Date) =>
//   new Date(v).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

// const asDateTime = (v: number | string | Date) =>
//   new Date(v).toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

// const labelize = (s: string) =>
//   s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// export function buildExecutiveSalesReportPdf(input: ExecutiveReportInput) {
//   const { businessName, from, to, salesData, otherData, salesExceptionData } =
//     input;

//   const doc = new jsPDF({ unit: "mm", format: [80, 297] }); // 80mm thermal width
//   let y = 8;
//   const left = 6;
//   const lineGap = 4;

//   // ===== Header =====
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(12);
//   doc.text(businessName || "Executive Sales Report", 40, y, {
//     align: "center",
//   });
//   y += lineGap + 1;

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(9);
//   doc.text("Executive Sales Report", 40, y, { align: "center" });
//   y += lineGap;

//   doc.setFontSize(8);
//   doc.text(`${asDate(from)} to ${asDate(to)}`, 40, y, { align: "center" });
//   y += lineGap + 2;

//   // ===== Billing (Success) =====
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.text("Billing (Success)", left, y);
//   y += lineGap;

//   const taxTotal = otherData?.otherSale.totalTax ?? 0;
//   const cgst = taxTotal / 2;
//   const sgst = taxTotal / 2;

//   const billingRows: RowInput[] = [
//     // ["Order Count", String(salesData.orderCount ?? "")],
//     // ["Invoice Nos.", salesData.invoiceRange ?? ""],
//     // ["Sub Total", INR(salesData.subTotal ?? 0)],
//     ["Discount", INR(salesData.discount ?? 0)],
//     ["Delivery Charge", INR(0)],
//     ["Container Charge", INR(0)],
//     ["Service Charge (Opt)", INR(otherData?.otherSale.totalServiceCharge ?? 0)],
//     ["Additional Charge", INR(0)],
//     ["CGST", INR(cgst)],
//     ["SGST", INR(sgst)],
//     ["Round Off", INR(salesData.roundOff ?? 0)],
//     ["Waived off", INR(salesData.waivedOff ?? 0)],
//     ["Grand Total", INR(salesData.overAllAmount ?? 0)],
//     [
//       "Net Sales",
//       INR(
//         (salesData.overAllAmount ?? 0) -
//           (otherData?.otherSale.totalServiceCharge ?? 0),
//       ),
//     ],
//   ];

//   autoTable(doc, {
//     startY: y,
//     margin: { left, right: 6 },
//     styles: { fontSize: 8, cellPadding: 1.2, halign: "right" },
//     headStyles: { fillColor: [240, 240, 240] },
//     columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//     body: billingRows,
//     theme: "plain",
//   });

//   y = (doc as any).lastAutoTable.finalY + 2;

//   // ===== Billing (Cancel) =====
//   // doc.setFont("helvetica", "bold");
//   // doc.setFontSize(9);
//   // doc.text("Billing (Cancel)", left, y);
//   // y += lineGap;
//   // autoTable(doc, {
//   //   startY: y,
//   //   margin: { left, right: 6 },
//   //   styles: { fontSize: 8, cellPadding: 1.2 },
//   //   theme: "plain",
//   //   body: [
//   //     ["Order Count", "0"],
//   //     ["Amount", INR(0)],
//   //   ],
//   //   columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//   // });
//   // y = (doc as any).lastAutoTable.finalY + 2;

//   // ===== Order Type (simple split; adjust if you have real counts) =====
//   // doc.setFont("helvetica", "bold");
//   // doc.setFontSize(9);
//   // doc.text("Order Type", left, y);
//   // y += lineGap;
//   // autoTable(doc, {
//   //   startY: y,
//   //   margin: { left, right: 6 },
//   //   styles: { fontSize: 8, cellPadding: 1.2 },
//   //   theme: "plain",
//   //   body: [
//   //     ["Delivery", INR(0)],
//   //     ["Dine In", INR(salesData.overAllAmount ?? 0)],
//   //     ["Take Away", INR(0)],
//   //   ],
//   //   columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//   // });
//   // y = (doc as any).lastAutoTable.finalY + 2;

//   // ===== Payment Mode =====
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(9);
//   doc.text("Payment Mode", left, y);
//   y += lineGap;

//   const paymentRows: RowInput[] = [
//     ["Online (Razorpay)", INR(salesData.onlineSale?.online ?? 0)],
//     ...Object.entries(salesData.offlineSale || {}).map(([mode, amount]) => [
//       labelize(mode),
//       INR(amount),
//     ]),
//   ];

//   autoTable(doc, {
//     startY: y,
//     margin: { left, right: 6 },
//     styles: { fontSize: 8, cellPadding: 1.2 },
//     theme: "plain",
//     body: paymentRows,
//     columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//   });
//   y = (doc as any).lastAutoTable.finalY + 2;

//   // ===== Complimentary Orders =====
//   // doc.setFont("helvetica", "bold");
//   // doc.setFontSize(9);
//   // doc.text("Complimentary Orders", left, y);
//   // y += lineGap;
//   // autoTable(doc, {
//   //   startY: y,
//   //   margin: { left, right: 6 },
//   //   styles: { fontSize: 8, cellPadding: 1.2 },
//   //   theme: "plain",
//   //   body: [
//   //     ["Order Count", "0"],
//   //     [
//   //       "Amount",
//   //       INR(salesExceptionData?.exceptionSale.totalComplementary ?? 0),
//   //     ],
//   //   ],
//   //   columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//   // });
//   // y = (doc as any).lastAutoTable.finalY + 2;

//   // ===== Sales Return Orders (placeholder) =====
//   // doc.setFont("helvetica", "bold");
//   // doc.setFontSize(9);
//   // doc.text("Sales Return Orders", left, y);
//   // y += lineGap;
//   // autoTable(doc, {
//   //   startY: y,
//   //   margin: { left, right: 6 },
//   //   styles: { fontSize: 8, cellPadding: 1.2 },
//   //   theme: "plain",
//   //   body: [
//   //     ["Order Count", "0"],
//   //     ["Amount", INR(0)],
//   //   ],
//   //   columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
//   // });

//   // ===== Footer =====
//   const footerY = (doc as any).lastAutoTable.finalY + 4;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(7);
//   doc.text(`Generated: ${asDateTime(new Date())} (IST)`, 40, footerY, {
//     align: "center",
//   });

//   return doc;
// }

// src/utils/buildExecutiveSalesReportPdf.ts
// src/utils/buildExecutiveSalesReportPdf.ts
import jsPDF from "jspdf";
import autoTable, { type CellHookData, type RowInput } from "jspdf-autotable";

export type ExecutiveReportInput = {
  businessName: string;
  from: number | string | Date;
  to: number | string | Date;
  salesData: {
    overAllAmount: number;
    onlineSale: { online: number };
    offlineSale: Record<string, number>;
    orderTypeCounts?: { delivery?: number; dineIn?: number; takeAway?: number };
    orderCount?: number;
    subTotal?: number;
    discount?: number;
    roundOff?: number;
    waivedOff?: number;
    totalOrders?: number;
    totalPaxCount?: number;
    startInvoiceNumber?: number;
    endInvoiceNumber?: number;
  };
  otherData?: {
    otherSale: {
      totalTax: number;
      totalTip: number;
      totalServiceCharge: number;
    };
    warningSale?: Record<string, number>;
  };
  salesExceptionData?: {
    exceptionSale: {
      totalComplementary: number;
      totalDiscount: number;
      totalDuesGiven: number;
      totalNpc: number;
    };
    rewardSale: {
      totalCoinsGiven: number;
      totalCoinsUsed: number;
      totalCouponDiscount: number;
    };
  };
};

// sizes: ~20px = 16pt, ~16px = 12pt
// const PT_HEADING = 16;
// const PT_BODY = 12;

// // NO currency prefix/symbol; just 1,23,456.00
// const AMT = (n?: number) =>
//   (n ?? 0).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// const asDate = (v: number | string | Date) =>
//   new Date(v).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

// const asDateTime = (v: number | string | Date) =>
//   new Date(v).toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

// const labelize = (s: string) =>
//   s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// export function buildExecutiveSalesReportPdf(input: ExecutiveReportInput) {
//   const { businessName, from, to, salesData, otherData } = input;

//   const doc = new jsPDF({ unit: "mm", format: [80, 297] });
//   let y = 8;
//   const left = 2;
//   const right = 2;
//   const lineGap = 5;

//   // Header
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(PT_HEADING);
//   doc.text(businessName || "Executive Sales Report", 40, y, {
//     align: "center",
//   });
//   y += lineGap + 1;

//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(PT_BODY);
//   doc.text("Executive Sales Report", 40, y, { align: "center" });
//   y += lineGap;

//   doc.setFontSize(PT_BODY);
//   doc.text(`${asDate(from)} to ${asDate(to)}`, 40, y, { align: "center" });
//   y += lineGap + 2;

//   // Billing (Success)
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(PT_BODY);
//   doc.text("Billing (Success)", left, y);
//   y += lineGap;

//   const taxTotal = otherData?.otherSale.totalTax ?? 0;
//   const cgst = taxTotal / 2;
//   const sgst = taxTotal / 2;

//   const billingRows: RowInput[] = [
//     ["Discount", AMT(input.salesExceptionData?.exceptionSale.totalDiscount)],
//     // ["Delivery Charge", AMT(0)],
//     // ["Container Charge", AMT(0)],
//     ["Service Charge (Opt)", AMT(otherData?.otherSale.totalServiceCharge)],
//     ["Additional Charge", AMT(0)],
//     ["CGST", AMT(cgst)],
//     ["SGST", AMT(sgst)],
//     ["Round Off", AMT(salesData.roundOff)],
//     ["Waived off", AMT(salesData.waivedOff)],
//     ["Total Sales", AMT(salesData.overAllAmount)],
//     [
//       "Net Sales",
//       AMT(
//         (salesData.overAllAmount ?? 0) -
//           (otherData?.otherSale.totalServiceCharge ?? 0) -
//           (input.salesExceptionData?.exceptionSale.totalDiscount ?? 0) -
//           (input.salesExceptionData?.rewardSale.totalCouponDiscount ?? 0) -
//           (input.salesExceptionData?.rewardSale.totalCoinsUsed ?? 0) -
//           (input.salesExceptionData?.exceptionSale.totalComplementary ?? 0),
//       ),
//     ],
//   ];

//   autoTable(doc, {
//     startY: y,
//     margin: { left, right },
//     styles: { fontSize: PT_BODY, cellPadding: 1.2, lineWidth: 0 },
//     theme: "plain",
//     columnStyles: {
//       0: { halign: "left", cellWidth: 42 },
//       1: { halign: "right", cellWidth: 26 },
//     },
//     didParseCell: (d: CellHookData) => {
//       if (d.section === "body" && d.column.index === 1)
//         d.cell.styles.fontStyle = "bold"; // semi-bold values
//     },
//     body: billingRows,
//   });

//   y = (doc as any).lastAutoTable.finalY + 3;

//   // Payment Mode
//   doc.setFont("helvetica", "bold");
//   doc.setFontSize(PT_BODY);
//   doc.text("Payment Mode", left, y);
//   y += lineGap;

//   const paymentRows: RowInput[] = [
//     ["Online (Razorpay)", AMT(salesData.onlineSale?.online)],
//     ...Object.entries(salesData.offlineSale || {}).map(([mode, amount]) => [
//       labelize(mode),
//       AMT(amount),
//     ]),
//   ];

//   autoTable(doc, {
//     startY: y,
//     margin: { left, right },
//     styles: { fontSize: PT_BODY, cellPadding: 1.2 },
//     theme: "plain",
//     columnStyles: {
//       0: { halign: "left", cellWidth: 42 },
//       1: { halign: "right", cellWidth: 26 },
//     },
//     didParseCell: (d: CellHookData) => {
//       if (d.section === "body" && d.column.index === 1)
//         d.cell.styles.fontStyle = "bold";
//     },
//     body: paymentRows,
//   });

//   // Footer
//   const footerY = (doc as any).lastAutoTable.finalY + 5;
//   doc.setFont("helvetica", "normal");
//   doc.setFontSize(10);
//   doc.text(`Generated: ${asDateTime(new Date())} (IST)`, 40, footerY, {
//     align: "center",
//   });

//   return doc;
// }
// ...imports unchanged

// helpers unchanged ...

// src/utils/buildExecutiveSalesReportPdf.ts
// import jsPDF from "jspdf";
// import autoTable, { type RowInput, type CellHookData } from "jspdf-autotable";

// export type ExecutiveReportInput = {
//   businessName: string;
//   from: number | string | Date;
//   to: number | string | Date;
//   salesData: {
//     overAllAmount: number; // Total actually received (excludes dues/npc/complementary)
//     onlineSale: { online: number };
//     offlineSale: Record<string, number>;
//     orderTypeCounts?: { delivery?: number; dineIn?: number; takeAway?: number };
//     invoiceRange?: string;
//     orderCount?: number;
//     subTotal?: number;
//     discount?: number;
//     roundOff?: number;
//     waivedOff?: number;
//   };
//   otherData?: {
//     otherSale: {
//       totalTax: number;
//       totalTip: number;
//       totalServiceCharge: number;
//     };
//     warningSale?: Record<string, number>;
//   };
//   salesExceptionData?: {
//     exceptionSale: { totalComplementary: number; totalDiscount: number };
//     rewardSale: {
//       totalCoinsGiven: number;
//       totalCoinsUsed: number;
//       totalCouponDiscount: number;
//     };
//   };
// };

// ~20px = 16pt, ~16px = 12pt
// Fonts: roughly like your sample receipt
const PT_TITLE = 14; // ~19px
const PT_SECTION = 11; // ~15px
const PT_BODY = 10; // ~13px

// compact spacing (unchanged)
const ROW_PAD = { top: 0.4, right: 1, bottom: 0.4, left: 1 }; // mm
const LINE_GAP = 2; // mm

// ------- HELPERS -------
const fmtAmt = (n?: number) =>
  (Number(n ?? 0) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const asDate = (v: number | string | Date) =>
  new Date(v).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });

const asDateTime = (v: number | string | Date) =>
  new Date(v).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const labelize = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

// ------- MAIN -------
export function buildExecutiveSalesReportPdf(input: ExecutiveReportInput) {
  const { businessName, from, to, salesData, otherData, salesExceptionData } =
    input;
  console.log("input to buildExecutiveSalesReportPdf", input);
  const doc = new jsPDF({ unit: "mm", format: [80, 297] }); // 80mm width

  // Prefer Poppins if registered
  const useFont = (style: "normal" | "bold") => {
    try {
      doc.setFont("Poppins", style);
    } catch {
      doc.setFont("helvetica", style);
    }
  };

  let y = 8;
  const left = 4;
  const right = 4;

  // ===== Header =====
  useFont("bold");
  doc.setFontSize(PT_TITLE);
  doc.text(businessName || "Executive Sales Report", 40, y + 2, {
    align: "center",
  });
  y += LINE_GAP + 1.5;

  useFont("normal");
  doc.setFontSize(PT_SECTION);
  doc.text("Executive Sales Report", 40, y + 2, { align: "center" });
  y += LINE_GAP + 1.5;

  doc.setFontSize(PT_BODY);
  doc.text(`${asDate(from)} to ${asDate(to)}`, 40, y + 2, { align: "center" });
  y += LINE_GAP + 1.5;

  // ===== Billing (Success) =====
  useFont("bold");
  doc.setFontSize(PT_SECTION);
  doc.text("Billing (Success)", left, 26);
  y += LINE_GAP;

  // Pull numbers with safe defaults
  const totalSales = Number(salesData.overAllAmount ?? 0) || 0; // "Grand Total" in the paper
  const roundOff = Number(salesData.roundOff ?? 0) || 0;

  const taxTotal = Number(otherData?.otherSale.totalTax ?? 0) || 0;
  const serviceCharge =
    Number(otherData?.otherSale.totalServiceCharge ?? 0) || 0;
  const tipTotal = Number(otherData?.otherSale.totalTip ?? 0) || 0;

  const cgst = taxTotal / 2;
  const sgst = taxTotal / 2;

  // Discounts and info lines
  const discountTotal =
    Number(salesExceptionData?.exceptionSale.totalDiscount ?? 0) || 0;
  const couponDiscount =
    Number(salesExceptionData?.rewardSale.totalCouponDiscount ?? 0) || 0;
  const coinsUsed =
    Number(salesExceptionData?.rewardSale.totalCoinsUsed ?? 0) || 0;
  const complementary =
    Number(salesExceptionData?.exceptionSale.totalComplementary ?? 0) || 0;

  const netSales =
    salesData?.subTotal -
    (discountTotal + couponDiscount + coinsUsed + complementary);

  const billingRows: RowInput[] = [
    ["Sub Total (taxable):", fmtAmt(salesData.subTotal)],
    ["Order Count:", String(salesData.totalOrders)],
    [
      "Invoice Nos.:",
      `${salesData.startInvoiceNumber} - ${salesData.endInvoiceNumber}`,
    ],
    ["Guest Count:", String(salesData.totalPaxCount)],
    ["Discount:", fmtAmt(discountTotal)],
    ["TotalCoins Used:", fmtAmt(coinsUsed)], // shown for info only
    ["Coupon Discount:", fmtAmt(couponDiscount)], // shown for info only
    ["Complementary:", fmtAmt(complementary)], // shown for info only
    ["Service Charge (Opt):", fmtAmt(serviceCharge)],
    ["CGST:", fmtAmt(cgst)],
    ["SGST:", fmtAmt(sgst)],
    ["Tip:", fmtAmt(tipTotal)],
    ["Round Off:", fmtAmt(roundOff)],
    ["Total Sales:", fmtAmt(totalSales)], // equals "Grand Total" in sample slip
    ["Net Sales:", fmtAmt(netSales)], // EXACT receipt rule
  ];

  autoTable(doc, {
    startY: y + 9,
    margin: { left, right },
    theme: "plain",
    styles: {
      fontSize: PT_BODY,
      cellPadding: ROW_PAD,
      lineWidth: 0,
      minCellHeight: 0,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 45 },
      1: { halign: "right", cellWidth: 27 },
    },
    didParseCell: (d: CellHookData) => {
      if (d.section === "body" && d.column.index === 1) {
        d.cell.styles.fontStyle = "normal"; // keep your "semi-bold-ish" look
      }
    },
    body: billingRows,
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ===== Dues & NPC =====
  useFont("bold");
  doc.setFontSize(PT_SECTION);
  doc.text("Dues & NPC", left, y);

  useFont("normal");
  doc.setFontSize(PT_BODY);

  // ✔️ Now manually move y down because we printed 3 manual lines
  y += LINE_GAP + 2;

  // Now create table (safe start)
  const duesRows: RowInput[] = [
    [
      "Total Dues Given:",
      fmtAmt(input.salesExceptionData?.exceptionSale.totalDuesGiven),
    ],
    [" Total NPC:", fmtAmt(input.salesExceptionData?.exceptionSale.totalNpc)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left, right },
    theme: "plain",
    styles: {
      fontSize: PT_BODY,
      cellPadding: ROW_PAD,
      minCellHeight: 0,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 45 },
      1: { halign: "right", cellWidth: 27 },
    },
    didParseCell: (d: CellHookData) => {
      if (d.section === "body" && d.column.index === 1) {
        d.cell.styles.fontStyle = "normal";
      }
    },
    body: duesRows,
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ===== Payment Mode =====
  useFont("normal");
  doc.setFontSize(PT_SECTION);
  doc.text("Payment Mode", left, y);
  y += LINE_GAP;

  const paymentRows: RowInput[] = [
    ["Online (Razorpay):", fmtAmt(salesData.onlineSale?.online)],
    ...Object.entries(salesData.offlineSale || {}).map(([mode, amount]) => [
      `${labelize(mode)}:`,
      fmtAmt(Number(amount)),
    ]),
  ];

  autoTable(doc, {
    startY: y,
    margin: { left, right },
    theme: "plain",
    styles: {
      fontSize: PT_BODY,
      cellPadding: ROW_PAD,
      minCellHeight: 0,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 45 },
      1: { halign: "right", cellWidth: 27 },
    },
    didParseCell: (d: CellHookData) => {
      if (d.section === "body" && d.column.index === 1) {
        d.cell.styles.fontStyle = "normal";
      }
    },
    body: paymentRows,
  });

  // ✔️ NOW it's safe to read lastAutoTable
  y = (doc as any).lastAutoTable.finalY + 5;

  const footerY = (doc as any).lastAutoTable.finalY + 3.5;
  useFont("normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${asDateTime(new Date())} (IST)`, 40, footerY, {
    align: "center",
  });

  return doc;
}
