import jsPDF from "jspdf";
import autoTable, { type RowInput, type CellHookData } from "jspdf-autotable";

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
      totalDuesGetBack: number;
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

import { format as dfFormat } from "date-fns";

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

const formatForFile = (d: Date | string) => {
  const dateObj = d instanceof Date ? d : new Date(d);
  // Example: 2025-11-18_10-35
  return dfFormat(dateObj, "yyyy-MM-dd_HH-mm");
};

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
  doc.text(`${formatForFile(from)} to ${formatForFile(to)}`, 40, y + 2, {
    align: "center",
  });
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
  const npc = Number(salesExceptionData?.exceptionSale.totalNpc ?? 0) || 0;

  const netSales =
    salesData?.subTotal -
    (discountTotal + couponDiscount + coinsUsed + complementary + npc);

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
    [
      "Total Dues Get Back:",
      fmtAmt(input.salesExceptionData?.exceptionSale.totalDuesGetBack),
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
