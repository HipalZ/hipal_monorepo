// utils/reportHelper/billsExcelReport.ts
import * as ExcelJS from "exceljs";
import { autoFitColumns } from "../reportHelper/excelUtils";
import { formatDateToIST } from "../reportHelper/dateFormater";

type AnyPayment = any;

type BuildBillsArgs = {
  payments: AnyPayment[];
  businessName: string;
  fromDate: number;
  toDate: number;
};

const DETAIL_HEADERS = [
  "Bill Invoice",
  "Date",
  "User Name",
  "User Phone",
  "Table Name",
  "Mode",
  "Payment Mode",
  "Subtotal",
  "Claimed Coins",
  "Discount",
  "Coupon Discount",
  "Total Discount",
  "Tax",
  "Service Charge",
  "Tips",
  "Total",
  "Split Modes",
  "Settle Type",
  "Comment",
  "Waiter Name",
  "Earned Coins",
];

export async function buildBillsExcelBuffer({
  payments,
  businessName,
  fromDate,
  toDate,
}: BuildBillsArgs): Promise<Uint8Array> {
  const allPayments = payments;

  // ---------------- CLASSIFICATION (NORMAL, DUES_SETTLE, DUES PENDING) ----------------
  const duesSettlementPayments = allPayments.filter(
    (p: AnyPayment) => p.settleType === "DUES_SETTLE",
  );

  const normalPaidPayments = allPayments.filter(
    (p: AnyPayment) => p.mode !== "dues" && p.settleType !== "DUES_SETTLE",
  );

  const paidPayments = [...normalPaidPayments, ...duesSettlementPayments];

  const duesPayments = allPayments.filter(
    (p: AnyPayment) => p.mode === "dues" && p.settleType !== "DUES_SETTLE",
  );

  // ---------------- AGGREGATES FOR PAID (incl. DUES_SETTLE) ----------------
  let totalBillValue = 0;
  let totalTax = 0;
  let totalServiceCharge = 0;
  let totalAmount = 0;
  let totalTips = 0;
  let totalClaimedCoins = 0;
  let totalEarnCoins = 0;
  let totalDiscount = 0;
  let totalCouponDiscount = 0;
  let totalTotalDiscount = 0;
  let totalComplementary = 0;
  let totalNpc = 0;
  let totalDuesGetBack = 0; // 💰 DUES_SETTLE non-complementary

  for (const payment of paidPayments as AnyPayment[]) {
    const {
      billValue = 0,
      tips = 0,
      claimedCoins = 0,
      earnCoins = 0,
      discount = 0,
      tax = 0,
      serviceCharge = 0,
      total = 0,
      mode,
      settleType,
      couponDiscount = 0,
    } = payment;

    totalBillValue += billValue;
    totalTax += tax;
    totalServiceCharge += serviceCharge;
    totalAmount += total;
    totalTips += tips;
    totalClaimedCoins += claimedCoins;
    totalEarnCoins += earnCoins;
    totalDiscount += discount;
    totalCouponDiscount += couponDiscount;

    const rowTotalDiscount =
      (claimedCoins || 0) + (discount || 0) + (couponDiscount || 0);
    totalTotalDiscount += rowTotalDiscount;

    const isComplementary = mode === "complementary";
    const isDuesSettle = settleType === "DUES_SETTLE";

    // Complimentary only for complementary mode
    if (isComplementary) {
      totalComplementary += billValue;
    }

    // Dues get back only for DUES_SETTLE that are not complimentary
    if (isDuesSettle && !isComplementary) {
      totalDuesGetBack += billValue;
    }

    if (mode === "npc") totalNpc += billValue;
  }

  const totalOrdersCount = paidPayments.length;
  const allDiscounts = totalTotalDiscount;
  const discountWithNpcAndComp = totalComplementary + totalNpc + allDiscounts;
  const netSales = totalBillValue - discountWithNpcAndComp;

  // ---------------- AGGREGATES FOR PENDING DUES ----------------
  let duesSubtotal = 0;
  let duesTax = 0;
  let duesServiceCharge = 0;
  let duesDiscount = 0; // includes coins + discount + coupon
  let duesTotal = 0;
  const duesOrderCount = duesPayments.length;

  for (const p of duesPayments as AnyPayment[]) {
    const billValue = p.billValue || 0;
    const tax = p.tax || 0;
    const svc = p.serviceCharge || 0;
    const total = p.total || 0;
    const claimedCoins = p.claimedCoins || 0;
    const discount = p.discount || 0;
    const couponDiscount = p.couponDiscount || 0;

    duesSubtotal += billValue;
    duesTax += tax;
    duesServiceCharge += svc;
    duesDiscount += claimedCoins + discount + couponDiscount;
    duesTotal += total;
  }

  // ---------------- EXCELJS WORKBOOK ----------------
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HiPalz";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Bills Report");

  let rowIdx = 1;

  const addSummaryRow = (label: string, value: string | number) => {
    const r = sheet.getRow(rowIdx++);
    r.getCell(1).value = label;
    r.getCell(2).value = value;
    r.getCell(1).font = { bold: true };
  };

  const addGapRow = () => {
    rowIdx++;
  };

  // ---------------- SUMMARY BLOCK ----------------
  addSummaryRow("Business Name", businessName);
  addSummaryRow(
    "Date Range",
    `${formatDateToIST(fromDate)} to ${formatDateToIST(toDate)}`,
  );

  addGapRow();

  addSummaryRow("Subtotal", Number(totalBillValue.toFixed(2)));
  addSummaryRow("Total Orders (Paid incl. DUES_SETTLE)", totalOrdersCount);
  addSummaryRow("Discount", Number(totalDiscount.toFixed(2)));
  addSummaryRow("Coins Discount", Number(totalClaimedCoins.toFixed(2)));
  addSummaryRow("Coupon Discount", Number(totalCouponDiscount.toFixed(2)));
  addSummaryRow("All Discounts", Number(allDiscounts.toFixed(2)));
  addSummaryRow("Complementary", Number(totalComplementary.toFixed(2)));
  addSummaryRow("NPC", Number(totalNpc.toFixed(2)));
  addSummaryRow("Service Charge", Number(totalServiceCharge.toFixed(2)));
  addSummaryRow("GST (CGST+SGST)", Number(totalTax.toFixed(2)));
  addSummaryRow("Tips", Number(totalTips.toFixed(2)));
  addSummaryRow("Total Sales", Number(totalAmount.toFixed(2)));
  addSummaryRow(
    "Net Sales (Subtotal - Discounts - NPC - Complimentary, excl. Tips)",
    Number(netSales.toFixed(2)),
  );
  addSummaryRow(
    "Dues Get Back (DUES_SETTLE, non-complementary)",
    Number(totalDuesGetBack.toFixed(2)),
  );

  addGapRow();

  addSummaryRow("Dues Subtotal", Number(duesSubtotal.toFixed(2)));
  addSummaryRow("Dues Orders Count", duesOrderCount);
  addSummaryRow("Dues GST", Number(duesTax.toFixed(2)));
  addSummaryRow("Dues Service Charge", Number(duesServiceCharge.toFixed(2)));
  addSummaryRow("Dues Discount (All)", Number(duesDiscount.toFixed(2)));
  addSummaryRow("Dues Total", Number(duesTotal.toFixed(2)));

  // one more gap before detail
  addGapRow();

  // ---------------- DETAIL HEADER ----------------
  const headerRow = sheet.getRow(rowIdx++);
  DETAIL_HEADERS.forEach((label, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = label;
    cell.font = { bold: true };
  });

  const mapPaymentToRow = (payment: AnyPayment) => {
    const {
      date,
      userId,
      tableName,
      mode,
      paymentMode,
      billValue = 0,
      tips = 0,
      claimedCoins = 0,
      earnCoins = 0,
      discount = 0,
      tax = 0,
      serviceCharge = 0,
      total = 0,
      waiterName,
      settleType,
      comment,
      splitModes = [],
      billInvoice,
      couponDiscount = 0,
    } = payment;

    const rowTotalDiscount =
      (claimedCoins || 0) + (discount || 0) + (couponDiscount || 0);

    const splitInfo = Array.isArray(splitModes)
      ? splitModes.map((m: any) => `${m.name}=${m.amount}`).join("; ")
      : "";

    return {
      "Bill Invoice": billInvoice,
      Date: new Date(date).toLocaleString(),
      "User Name": userId?.name ?? "",
      "User Phone": userId?.phone ?? "",
      "Table Name": tableName || "",
      Mode: mode,
      "Payment Mode": paymentMode,
      Subtotal: billValue,
      "Claimed Coins": claimedCoins,
      Discount: discount,
      "Coupon Discount": couponDiscount,
      "Total Discount": rowTotalDiscount,
      Tax: tax,
      "Service Charge": serviceCharge,
      Tips: tips,
      Total: total,
      "Split Modes": splitInfo,
      "Settle Type": settleType,
      Comment: comment,
      "Waiter Name": waiterName,
      "Earned Coins": earnCoins,
    };
  };

  const writeDetailRow = (rowData: any) => {
    const r = sheet.getRow(rowIdx++);
    r.getCell(1).value = rowData["Bill Invoice"];
    r.getCell(2).value = rowData["Date"];
    r.getCell(3).value = rowData["User Name"];
    r.getCell(4).value = rowData["User Phone"];
    r.getCell(5).value = rowData["Table Name"];
    r.getCell(6).value = rowData["Mode"];
    r.getCell(7).value = rowData["Payment Mode"];
    r.getCell(8).value = rowData["Subtotal"];
    r.getCell(9).value = rowData["Claimed Coins"];
    r.getCell(10).value = rowData["Discount"];
    r.getCell(11).value = rowData["Coupon Discount"];
    r.getCell(12).value = rowData["Total Discount"];
    r.getCell(13).value = rowData["Tax"];
    r.getCell(14).value = rowData["Service Charge"];
    r.getCell(15).value = rowData["Tips"];
    r.getCell(16).value = rowData["Total"];
    r.getCell(17).value = rowData["Split Modes"];
    r.getCell(18).value = rowData["Settle Type"];
    r.getCell(19).value = rowData["Comment"];
    r.getCell(20).value = rowData["Waiter Name"];
    r.getCell(21).value = rowData["Earned Coins"];
  };

  const pushSectionLabelRow = (title: string) => {
    const r = sheet.getRow(rowIdx++);
    r.getCell(1).value = title;
    r.getCell(1).font = { bold: true };
  };

  const normalRows = normalPaidPayments.map(mapPaymentToRow);
  const duesSettleRows = duesSettlementPayments.map(mapPaymentToRow);
  const duesPendingRows = duesPayments.map(mapPaymentToRow);

  // 1) Normal settlements
  if (normalRows.length) {
    pushSectionLabelRow("=== NORMAL SETTLEMENTS ===");
    normalRows.forEach(writeDetailRow);
  }

  // 2) Dues settlements (DUES_SETTLE)
  if (duesSettleRows.length) {
    pushSectionLabelRow("=== DUES SETTLEMENTS (DUES_SETTLE) ===");
    duesSettleRows.forEach(writeDetailRow);
  }

  // 3) Dues payments (pending)
  if (duesPendingRows.length) {
    pushSectionLabelRow("=== DUES PAYMENTS (PENDING) ===");
    duesPendingRows.forEach(writeDetailRow);
  }

  // Final totals row (for all PAID)
  const totalsRow = sheet.getRow(rowIdx++);
  totalsRow.getCell(1).value = "Totals (do not edit this row)";
  totalsRow.getCell(1).font = { bold: true };

  totalsRow.getCell(8).value = Number(totalBillValue.toFixed(2)); // Subtotal
  totalsRow.getCell(9).value = Number(totalClaimedCoins.toFixed(2));
  totalsRow.getCell(10).value = Number(totalDiscount.toFixed(2));
  totalsRow.getCell(11).value = Number(totalCouponDiscount.toFixed(2));
  totalsRow.getCell(12).value = Number(totalTotalDiscount.toFixed(2));
  totalsRow.getCell(13).value = Number(totalTax.toFixed(2));
  totalsRow.getCell(14).value = Number(totalServiceCharge.toFixed(2));
  totalsRow.getCell(15).value = Number(totalTips.toFixed(2));
  totalsRow.getCell(16).value = Number(totalAmount.toFixed(2));
  totalsRow.getCell(21).value = Number(totalEarnCoins.toFixed(2));

  autoFitColumns(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Uint8Array;
}
