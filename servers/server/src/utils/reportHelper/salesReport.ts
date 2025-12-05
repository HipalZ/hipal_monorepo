// utils/reportHelper/salesReport.ts
import type * as ExcelJS from "exceljs";
import type { BaseContext } from "./types";
import { addBoldHeaderRow, autoFitColumns } from "./excelUtils";

type AnyPayment = any;

const SALES_DETAIL_HEADER = [
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

interface SalesRow {
  "Bill Invoice": number | string;
  Date: string;
  "User Name": string;
  "User Phone": string;
  "Table Name": string;
  Mode: string;
  "Payment Mode": string;
  Subtotal: number;
  "Claimed Coins": number;
  Discount: number;
  "Coupon Discount": number;
  "Total Discount": number;
  Tax: number;
  "Service Charge": number;
  Tips: number;
  Total: number;
  "Split Modes": string;
  "Settle Type": string;
  Comment: string;
  "Waiter Name": string;
  "Earned Coins": number;
}

export async function buildNetAndSalesSheets(
  workbook: ExcelJS.Workbook,
  ctx: BaseContext,
) {
  const { businessIds, from, to, allPayments, bizNameMap } = ctx;

  // const netSheet = workbook.addWorksheet("Net Sales Report");
  const salesSheet = workbook.addWorksheet("Sales Report");

  for (const biz of businessIds) {
    const businessName = bizNameMap[biz] ?? "Business";

    const bizPayments = allPayments.filter(
      (p: AnyPayment) => p.businessId.toString() === biz,
    );

    // 🔹 Split into: normal paid, dues-settlement, and pending dues
    const duesSettlementPayments = bizPayments.filter(
      (p: AnyPayment) => p.settleType === "DUES_SETTLE",
    );

    const normalPaidPayments = bizPayments.filter(
      (p: AnyPayment) => p.mode !== "dues" && p.settleType !== "DUES_SETTLE",
    );

    const duesPayments = bizPayments.filter(
      (p: AnyPayment) => p.mode === "dues" && p.settleType !== "DUES_SETTLE",
    );

    const paidPayments = [...normalPaidPayments, ...duesSettlementPayments];

    // Invoice range only from paid invoices
    const sortedPaidByInvoice = [...paidPayments].sort(
      (a, b) => (a.billInvoice || 0) - (b.billInvoice || 0),
    );
    const startInvoice = sortedPaidByInvoice[0]?.billInvoice ?? 0;
    const endInvoice =
      sortedPaidByInvoice[sortedPaidByInvoice.length - 1]?.billInvoice ?? 0;

    // =========================
    // PAID TOTALS (normal + dues-settlement)
    // =========================
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
    // 💰 dues recovered (DUES_SETTLE, non-complementary)
    let totalDuesGetBack = 0;

    const paidRows: SalesRow[] = [];
    const normalPaidRows: SalesRow[] = [];
    const duesSettlementRows: SalesRow[] = [];

    for (const payment of paidPayments as AnyPayment[]) {
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

      totalBillValue += billValue;
      totalTax += tax;
      totalServiceCharge += serviceCharge;
      totalAmount += total;
      totalTips += tips;
      totalClaimedCoins += claimedCoins;
      totalEarnCoins += earnCoins;
      totalDiscount += discount;
      totalCouponDiscount += couponDiscount;
      totalTotalDiscount += rowTotalDiscount;

      const isDuesSettle = settleType === "DUES_SETTLE";
      const isComplementaryMode = mode === "complementary";

      // 🔹 NPC & Complementary as discount – include both mode + splitModes
      let compAmount = 0;
      let npcAmount = 0;

      if (mode === "complementary") {
        compAmount += billValue;
      }
      if (mode === "npc") {
        npcAmount += billValue;
      }

      if (Array.isArray(splitModes)) {
        for (const split of splitModes) {
          const name = split?.name;
          const amt = split?.amount ?? 0;
          if (name === "complementary") compAmount += amt;
          if (name === "npc") npcAmount += amt;
        }
      }

      totalComplementary += compAmount;
      totalNpc += npcAmount;

      // ✅ Dues Get Back = DUES_SETTLE but not complementary
      if (isDuesSettle && !isComplementaryMode) {
        totalDuesGetBack += billValue;
      }

      const splitInfo = Array.isArray(splitModes)
        ? splitModes.map((m: any) => `${m.name}=${m.amount}`).join("; ")
        : "";

      const row: SalesRow = {
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

      paidRows.push(row);

      if (isDuesSettle) {
        duesSettlementRows.push(row);
      } else {
        normalPaidRows.push(row);
      }
    }

    const totalOrdersCount = paidPayments.length;

    // 👇 Same logic as Executive Report:
    // allDiscounts = manual discount + coins + coupon
    const allDiscounts = totalTotalDiscount;
    // discountWithNpcAndComp = allDiscounts + complementary + npc
    const discountWithNpcAndComp = totalComplementary + totalNpc + allDiscounts;
    // Net Sales = Subtotal - (discounts + complimentary + NPC)
    const netSales = totalBillValue - discountWithNpcAndComp;

    // =========================
    // DUES TOTALS (pending dues only)
    // =========================
    let duesSubtotal = 0;
    let duesTax = 0;
    let duesServiceCharge = 0;
    let duesDiscount = 0;
    let duesTotal = 0;
    const duesOrderCount = duesPayments.length;

    const duesRows: SalesRow[] = [];

    for (const p of duesPayments as AnyPayment[]) {
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
      } = p;

      const rowTotalDiscount =
        (claimedCoins || 0) + (discount || 0) + (couponDiscount || 0);

      duesSubtotal += billValue;
      duesTax += tax;
      duesServiceCharge += serviceCharge;
      duesDiscount += rowTotalDiscount;
      duesTotal += total;

      const splitInfo = Array.isArray(splitModes)
        ? splitModes.map((m: any) => `${m.name}=${m.amount}`).join("; ")
        : "";

      duesRows.push({
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
      });
    }

    const fromStr = new Date(from).toLocaleString();
    const toStr = new Date(to).toLocaleString();

    // =======================
    // NET SALES SHEET
    // =======================
    // netSheet.addRow([]);
    // let r = netSheet.addRow(["BusinessId", biz]);
    // r.getCell(1).font = { bold: true };

    // r = netSheet.addRow(["Business Name", businessName]);
    // r.getCell(1).font = { bold: true };

    // r = netSheet.addRow(["Date Range", `${fromStr} → ${toStr}`]);
    // r.getCell(1).font = { bold: true };

    // r = netSheet.addRow([
    //   "Invoice Range (Paid only)",
    //   `${startInvoice} → ${endInvoice}`,
    // ]);
    // r.getCell(1).font = { bold: true };

    // netSheet.addRow([]);

    // const addSummaryRow = (label: string, value: number | string) => {
    //   const row = netSheet.addRow([label, value]);
    //   row.getCell(1).font = { bold: true };
    // };

    // // Paid summary (all paid incl. dues-settle)
    // addSummaryRow("Subtotal", Number(totalBillValue.toFixed(2)));
    // addSummaryRow("Total Orders", totalOrdersCount);
    // addSummaryRow("Discount", Number(totalDiscount.toFixed(2)));
    // addSummaryRow("Coins Discount", Number(totalClaimedCoins.toFixed(2)));
    // addSummaryRow("Coupon Discount", Number(totalCouponDiscount.toFixed(2)));
    // addSummaryRow(
    //   "All Discounts (disc + coins + coupon)",
    //   Number(allDiscounts.toFixed(2)),
    // );
    // addSummaryRow("Complementary", Number(totalComplementary.toFixed(2)));
    // addSummaryRow("NPC", Number(totalNpc.toFixed(2)));
    // addSummaryRow("Service Charge", Number(totalServiceCharge.toFixed(2)));
    // addSummaryRow("GST (CGST+SGST)", Number(totalTax.toFixed(2)));
    // addSummaryRow("Tips", Number(totalTips.toFixed(2)));
    // addSummaryRow("Total Sales", Number(totalAmount.toFixed(2)));

    // // ✨ Updated label, same formula as Executive Report
    // addSummaryRow(
    //   "Net Sales (Subtotal - Discounts - NPC - Complimentary)",
    //   Number(netSales.toFixed(2)),
    // );

    // // 💰 Dues Get Back row (non-complementary DUES_SETTLE only)
    // addSummaryRow(
    //   "Dues Get Back (DUES_SETTLE, non-complementary)",
    //   Number(totalDuesGetBack.toFixed(2)),
    // );

    // netSheet.addRow([]);

    // // Dues summary
    // const duesTitle = netSheet.addRow(["Dues Summary"]);
    // duesTitle.getCell(1).font = { bold: true };

    // addSummaryRow("Dues Subtotal", Number(duesSubtotal.toFixed(2)));
    // addSummaryRow("Dues Orders Count", duesOrderCount);
    // addSummaryRow("Dues GST", Number(duesTax.toFixed(2)));
    // addSummaryRow("Dues Service Charge", Number(duesServiceCharge.toFixed(2)));
    // addSummaryRow("Dues Discount (All)", Number(duesDiscount.toFixed(2)));
    // addSummaryRow("Dues Total", Number(duesTotal.toFixed(2)));

    // =======================
    // SALES SHEET (unchanged)
    // =======================
    salesSheet.addRow([]);
    let sRow = salesSheet.addRow(["BusinessId", biz]);
    sRow.getCell(1).font = { bold: true };

    sRow = salesSheet.addRow(["Business Name", businessName]);
    sRow.getCell(1).font = { bold: true };

    // sRow = salesSheet.addRow(["Date Range", `${fromStr} → ${toStr}`]);
    // sRow.getCell(1).font = { bold: true };

    salesSheet.addRow([]);

    // 1️⃣ NORMAL PAID block
    let blockTitle = salesSheet.addRow([
      "Paid Payments (normal, excluding DUES_SETTLE)",
    ]);
    blockTitle.getCell(1).font = { bold: true };

    addBoldHeaderRow(salesSheet, SALES_DETAIL_HEADER);

    for (const row of normalPaidRows) {
      salesSheet.addRow([
        row["Bill Invoice"],
        row["Date"],
        row["User Name"],
        row["User Phone"],
        row["Table Name"],
        row["Mode"],
        row["Payment Mode"],
        row["Subtotal"],
        row["Claimed Coins"],
        row["Discount"],
        row["Coupon Discount"],
        row["Total Discount"],
        row["Tax"],
        row["Service Charge"],
        row["Tips"],
        row["Total"],
        row["Split Modes"],
        row["Settle Type"],
        row["Comment"],
        row["Waiter Name"],
        row["Earned Coins"],
      ]);
    }

    salesSheet.addRow([]);

    // 2️⃣ DUES SETTLEMENT block
    blockTitle = salesSheet.addRow([
      "Dues Settlement Payments (settleType = DUES_SETTLE)",
    ]);
    blockTitle.getCell(1).font = { bold: true };

    addBoldHeaderRow(salesSheet, SALES_DETAIL_HEADER);

    for (const row of duesSettlementRows) {
      salesSheet.addRow([
        row["Bill Invoice"],
        row["Date"],
        row["User Name"],
        row["User Phone"],
        row["Table Name"],
        row["Mode"],
        row["Payment Mode"],
        row["Subtotal"],
        row["Claimed Coins"],
        row["Discount"],
        row["Coupon Discount"],
        row["Total Discount"],
        row["Tax"],
        row["Service Charge"],
        row["Tips"],
        row["Total"],
        row["Split Modes"],
        row["Settle Type"],
        row["Comment"],
        row["Waiter Name"],
        row["Earned Coins"],
      ]);
    }

    // Global paid totals row (normal + dues-settle)
    const paidTotalsRow = salesSheet.addRow([
      "Paid Totals (all paid incl. dues settlement, do not edit this row)",
      "",
      "",
      "",
      "",
      "",
      "",
      Number(totalBillValue.toFixed(2)),
      Number(totalClaimedCoins.toFixed(2)),
      Number(totalDiscount.toFixed(2)),
      Number(totalCouponDiscount.toFixed(2)),
      Number(totalTotalDiscount.toFixed(2)),
      Number(totalTax.toFixed(2)),
      Number(totalServiceCharge.toFixed(2)),
      Number(totalTips.toFixed(2)),
      Number(totalAmount.toFixed(2)),
      "",
      "",
      "",
      "",
      Number(totalEarnCoins.toFixed(2)),
    ]);
    paidTotalsRow.getCell(1).font = { bold: true };

    salesSheet.addRow([]);

    // 3️⃣ DUES block
    blockTitle = salesSheet.addRow([
      "Dues Payments (only dues mode, not settled)",
    ]);
    blockTitle.getCell(1).font = { bold: true };

    addBoldHeaderRow(salesSheet, SALES_DETAIL_HEADER);

    for (const row of duesRows) {
      salesSheet.addRow([
        row["Bill Invoice"],
        row["Date"],
        row["User Name"],
        row["User Phone"],
        row["Table Name"],
        row["Mode"],
        row["Payment Mode"],
        row["Subtotal"],
        row["Claimed Coins"],
        row["Discount"],
        row["Coupon Discount"],
        row["Total Discount"],
        row["Tax"],
        row["Service Charge"],
        row["Tips"],
        row["Total"],
        row["Split Modes"],
        row["Settle Type"],
        row["Comment"],
        row["Waiter Name"],
        row["Earned Coins"],
      ]);
    }

    const duesTotalsRow = salesSheet.addRow([
      "Dues Totals (do not edit this row)",
      "",
      "",
      "",
      "",
      "",
      "",
      Number(duesSubtotal.toFixed(2)),
      "",
      "",
      "",
      Number(duesDiscount.toFixed(2)),
      Number(duesTax.toFixed(2)),
      Number(duesServiceCharge.toFixed(2)),
      "",
      Number(duesTotal.toFixed(2)),
      "",
      "",
      "",
      "",
      "",
    ]);
    duesTotalsRow.getCell(1).font = { bold: true };

    salesSheet.addRow([]);
  }

  // autoFitColumns(netSheet);
  autoFitColumns(salesSheet);
}
