import jsPDF from "jspdf";
import autoTable, { type RowInput, type CellHookData } from "jspdf-autotable";
import { format as dfFormat } from "date-fns";
import type { UnifiedDashboardCore } from "@/components/types/paymentTypes";

export type UnifiedExecutiveReportInput = {
  businessName: string;
  from: number | string | Date;
  to: number | string | Date;
  core: UnifiedDashboardCore;
};

// --------- CONSTANTS ----------
const PT_TITLE = 14; // ~19px
const PT_SECTION = 11; // ~15px
const PT_BODY = 9.5; // ~13px

const ROW_PAD = { top: 0.4, right: 1, bottom: 0.4, left: 1 }; // mm
const LINE_GAP = 2; // mm

// --------- HELPERS ----------
const fmtAmt = (n?: number) =>
  (Number(n ?? 0) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const asDateTime = (v: number | string | Date) =>
  new Date(v).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatForHeader = (d: number | string | Date) =>
  dfFormat(new Date(d), "dd-MM-yyyy HH:mm");

// shared font helper
const useFont = (doc: jsPDF, style: "normal" | "bold") => {
  try {
    doc.setFont("Poppins", style);
  } catch {
    doc.setFont("helvetica", style);
  }
};

type AddSectionFn = (
  title: string,
  rows: RowInput[],
  opts?: { boldTitle?: boolean },
) => void;

// --------- MAIN ----------
export function buildUnifiedExecutiveSalesReportPdf(
  input: UnifiedExecutiveReportInput,
) {
  const { businessName, from, to, core } = input;

  const doc = new jsPDF({ unit: "mm", format: [80, 297] }); // narrow slip
  const left = 4;
  const right = 4;

  let y = 8;

  // --- HEADER ---
  useFont(doc, "bold");
  doc.setFontSize(PT_TITLE);
  doc.text(businessName || "Executive Sales Report", 40, y + 2, {
    align: "center",
  });
  y += LINE_GAP + 2;

  useFont(doc, "normal");
  doc.setFontSize(PT_SECTION);
  doc.text("Unified Executive Sales Report", 40, y + 2, {
    align: "center",
  });
  y += LINE_GAP + 2;

  doc.setFontSize(PT_SECTION);
  doc.text(`${formatForHeader(from)} ${formatForHeader(to)}`, 40, y + 2, {
    align: "center",
  });
  y += LINE_GAP + 2;

  // helper: add a titled table section
  const addSection: AddSectionFn = (title, rows, opts) => {
    if (!rows.length) return;
    y += 3;

    useFont(doc, opts?.boldTitle ? "bold" : "normal");
    doc.setFontSize(PT_SECTION);
    doc.text(title, left, y);
    y += LINE_GAP;

    useFont(doc, "normal");
    doc.setFontSize(PT_BODY);

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
      body: rows,
    });

    // move y to after this table
    // @ts-expect-error - jspdf-autotable typings
    y = (doc as any).lastAutoTable.finalY + 4;
  };

  const {
    invoiceRange,
    paidAll,
    paidNormal,
    duesSettlements,
    duesPending,
    discountSummary,
    rewardsSummary,
    duesSummary,
    taxesSummary,
  } = core;

  // ===== SECTION 1 – SALES SUMMARY =====

  const totalSalesPaid = paidAll.totals.netAfterDiscountAndCharges;
  const grossSubtotalPaid = paidAll.totals.grossSubtotal;
  const netAfterDiscountPaid = paidAll.totals.netAfterDiscountBeforeCharges;

  const taxPaid = taxesSummary.onPaid.tax;
  const svcPaid = taxesSummary.onPaid.serviceCharge;
  const tipPaid = taxesSummary.onPaid.tip;

  const rowsSalesSummary: RowInput[] = [
    ["Invoice Nos.:", `${invoiceRange.start || 0} - ${invoiceRange.end || 0}`],
    ["Paid Orders:", String(paidAll.totals.ordersCount || 0)],
    ["Guest Count (Paid):", String(paidAll.totals.paxCount || 0)],
    ["Gross Sub Total (Paid):", fmtAmt(grossSubtotalPaid)],
    [
      "Discount (Paid, incl. NPC & Comp):",
      `- ${fmtAmt(discountSummary.onPaid.total)}`,
    ],
    ["Net After Discount (Paid):", fmtAmt(netAfterDiscountPaid)],
    ["GST on Paid:", fmtAmt(taxPaid)],
    ["Service Charge on Paid:", fmtAmt(svcPaid)],
    ["Tips on Paid:", fmtAmt(tipPaid)],
    ["Net Sales (Paid):", fmtAmt(totalSalesPaid)],
  ];

  // break out normal vs dues settle
  const rowsSalesSplit: RowInput[] = [
    [
      "Normal Settlements:",
      fmtAmt(paidNormal.totals.netAfterDiscountAndCharges),
    ],
    [
      "Dues Settlements:",
      fmtAmt(duesSettlements.totals.netAfterDiscountAndCharges),
    ],
  ];

  const rowsPaymentMode: RowInput[] = [
    ...Object.entries(paidAll.paymentModes).map(([mode, amount]) => [
      mode === "online"
        ? "Online:"
        : `${mode
            .replace(/_/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase())}:`,
      fmtAmt(amount),
    ]),
  ];

  addSection("1. Sales Summary", rowsSalesSummary, { boldTitle: true });
  addSection("Paid Split – Normal vs Dues Settlements", rowsSalesSplit);
  if (rowsPaymentMode.length) {
    addSection("Payment Mode Breakdown (Paid)", rowsPaymentMode);
  }

  // ===== SECTION 2 – DUES SUMMARY =====
  const hasDues =
    duesSummary.duesGiven > 0 ||
    duesSummary.duesOutstanding > 0 ||
    duesSummary.ordersPending > 0;

  if (hasDues) {
    const rowsDues: RowInput[] = [
      ["Dues Given (Gross):", fmtAmt(duesSummary.duesGiven)],
      ["Dues Recovered (Settled):", fmtAmt(duesSummary.duesGetBack)],
      ["Pending Dues:", fmtAmt(duesSummary.duesOutstanding)],
      ["Pending Dues Orders:", String(duesSummary.ordersPending || 0)],
      ["Pending Dues Subtotal:", fmtAmt(duesPending.totals.grossSubtotal)],
    ];

    const rowsDuesTaxes: RowInput[] = [
      ["GST on Dues:", fmtAmt(taxesSummary.onDues.tax)],
      ["Service Charge on Dues:", fmtAmt(taxesSummary.onDues.serviceCharge)],
      ["Tips on Dues:", fmtAmt(taxesSummary.onDues.tip)],
    ];

    addSection("2. Dues Summary", rowsDues, { boldTitle: true });
    addSection("Dues – GST / Service / Tips", rowsDuesTaxes);
  }

  // ===== SECTION 3 – DISCOUNT & REWARDS =====

  const paidDisc = discountSummary.onPaid;
  const duesDisc = discountSummary.onDues;
  const allDisc = discountSummary.all;

  const rowsDiscountPaid: RowInput[] = [
    ["Manual Discount (Paid):", `- ${fmtAmt(paidDisc.manual)}`],
    ["Coins Used (Paid):", `- ${fmtAmt(paidDisc.coinsUsed)}`],
    ["Coupon Discount (Paid):", `- ${fmtAmt(paidDisc.coupon)}`],
    ["NPC as Discount (Paid):", `- ${fmtAmt(paidDisc.npcAsDiscount)}`],
    ["Complementary (Paid):", `- ${fmtAmt(paidDisc.compAsDiscount)}`],
    ["Total Discount (Paid):", `- ${fmtAmt(paidDisc.total)}`],
  ];

  const rowsDiscountDues: RowInput[] = [
    ["Manual Discount (Dues):", `- ${fmtAmt(duesDisc.manual)}`],
    ["Coins Used (Dues):", `- ${fmtAmt(duesDisc.coinsUsed)}`],
    ["Coupon Discount (Dues):", `- ${fmtAmt(duesDisc.coupon)}`],
    ["NPC as Discount (Dues):", `- ${fmtAmt(duesDisc.npcAsDiscount)}`],
    ["Complementary (Dues):", `- ${fmtAmt(duesDisc.compAsDiscount)}`],
    ["Total Discount (Dues):", `- ${fmtAmt(duesDisc.total)}`],
  ];

  const rowsDiscountAll: RowInput[] = [
    ["Total Discount (All):", `- ${fmtAmt(allDisc.total)}`],
  ];

  const rowsRewards: RowInput[] = [
    ["Coins Given (Paid):", fmtAmt(rewardsSummary.onPaid.coinsGiven)],
    ["Coins Given (Dues):", fmtAmt(rewardsSummary.onDues.coinsGiven)],
    ["Total Coins Given:", fmtAmt(rewardsSummary.all.coinsGiven)],
  ];

  addSection("3. Discount Summary – Paid Bills", rowsDiscountPaid, {
    boldTitle: true,
  });
  if (duesDisc.total > 0) {
    addSection("Discount Summary – Dues Bills", rowsDiscountDues);
  }
  addSection("Total Discount (Paid + Dues)", rowsDiscountAll);
  addSection("Rewards (Coins Given)", rowsRewards);

  // ===== SECTION 4 – TAXES & SERVICE =====

  const allTaxes = taxesSummary.all;
  const rowsTaxesAll: RowInput[] = [
    ["GST (All):", fmtAmt(allTaxes.tax)],
    ["Service Charge (All):", fmtAmt(allTaxes.serviceCharge)],
    ["Tips (All):", fmtAmt(allTaxes.tip)],
    [
      "Total Taxes + Service + Tips:",
      fmtAmt(allTaxes.tax + allTaxes.serviceCharge + allTaxes.tip),
    ],
  ];

  addSection("4. Taxes & Service Summary", rowsTaxesAll, {
    boldTitle: true,
  });

  // Footer
  const footerY = y + 4;
  useFont(doc, "normal");
  doc.setFontSize(8.5);
  doc.text(`Generated: ${asDateTime(new Date())} (IST)`, 40, footerY, {
    align: "center",
  });

  return doc;
}
