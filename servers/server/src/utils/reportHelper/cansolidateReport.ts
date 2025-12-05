// utils/reportHelper/consolidatedReport.ts
import type * as ExcelJS from "exceljs";
import type { BaseContext } from "./types";
import { buildCategoryReport } from "./categoryReport";
import { autoFitColumns } from "./excelUtils";

type AnyPayment = any;

const sectionHeaderStyle = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF1F497D" },
  },
  alignment: { vertical: "middle" as const, horizontal: "left" as const },
};

const tableHeaderStyle = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF305496" },
  },
  alignment: { vertical: "middle" as const, horizontal: "center" as const },
};

export async function buildConsolidatedSheet(
  workbook: ExcelJS.Workbook,
  ctx: BaseContext,
) {
  const { businessIds, allPayments, bizNameMap, from, to } = ctx;

  const sheet = workbook.addWorksheet("Consolidated Report");
  sheet.properties.defaultRowHeight = 18;

  let currentRow = 1;

  const addEmptyRow = () => {
    currentRow += 1;
    sheet.getRow(currentRow);
  };

  const addSectionTitle = (title: string) => {
    const row = sheet.getRow(currentRow);
    const cell = row.getCell(1);
    cell.value = title;
    cell.style = sectionHeaderStyle;
    currentRow += 1;
  };

  const addKeyValueRow = (label: string, value: string | number) => {
    const row = sheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true };
    row.getCell(2).value = value;
    currentRow += 1;
  };

  for (const biz of businessIds) {
    const businessName = bizNameMap[biz] ?? "Business";

    const bizPayments = allPayments.filter(
      (p: AnyPayment) => p.businessId.toString() === biz,
    );

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

    // ---------- Aggregate paid (normal + dues-settlement) ----------
    let totalBillValue = 0;
    let totalTax = 0;
    let totalServiceCharge = 0;
    let totalAmount = 0;
    let totalTips = 0;
    let totalClaimedCoins = 0;
    let totalDiscount = 0;
    let totalCouponDiscount = 0;
    let totalComplementary = 0;
    let totalNpc = 0;

    // 💡 now: DUES_SETTLE complimentary is NOT treated as "dues get back"
    let totalDuesGetBack = 0; // only non-complementary DUES_SETTLE

    for (const p of paidPayments) {
      const billValue = p.billValue || 0;
      const tax = p.tax || 0;
      const svc = p.serviceCharge || 0;
      const total = p.total || 0;
      const tips = p.tips || 0;
      const claimedCoins = p.claimedCoins || 0;
      const discount = p.discount || 0;
      const couponDiscount = p.couponDiscount || 0;

      totalBillValue += billValue;
      totalTax += tax;
      totalServiceCharge += svc;
      totalAmount += total;
      totalTips += tips;
      totalClaimedCoins += claimedCoins;
      totalDiscount += discount;
      totalCouponDiscount += couponDiscount;

      const isDuesSettle = p.settleType === "DUES_SETTLE";
      const isComplementary = p.mode === "complementary";

      if (isComplementary) {
        totalComplementary += billValue;
      }

      // ✅ FIX: only non-complementary dues settlements are counted as "dues get back"
      if (isDuesSettle && !isComplementary) {
        totalDuesGetBack += billValue;
      }

      if (p.mode === "npc") {
        totalNpc += billValue;
      }
    }

    const allDiscounts =
      totalDiscount + totalCouponDiscount + totalClaimedCoins;
    const discountWithNpcAndComp = totalComplementary + totalNpc + allDiscounts;
    const netSales = totalBillValue - discountWithNpcAndComp;

    // ---------- Aggregate dues (pending) ----------
    let duesSubtotal = 0;
    let duesTax = 0;
    let duesServiceCharge = 0;
    let duesDiscount = 0;
    let duesTotal = 0;

    for (const p of duesPayments) {
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

    const paidOrdersCount = paidPayments.length;
    const duesOrdersCount = duesPayments.length;

    const fromDateStr = new Date(from).toLocaleDateString();
    const toDateStr = new Date(to).toLocaleDateString();

    // ==========================================================
    // 1) HEADER BLOCK
    // ==========================================================
    addSectionTitle(`Summary - ${businessName}`);

    // addKeyValueRow("Date", `${fromDateStr} - ${toDateStr}`);
    addKeyValueRow("Net Sale", Number(netSales.toFixed(2)));
    addKeyValueRow("Gross Sale (Subtotal)", Number(totalBillValue.toFixed(2)));
    addKeyValueRow("Total Orders (Paid)", paidOrdersCount);
    addKeyValueRow(
      "Dues Get Back (DUES_SETTLE, non-complementary)",
      Number(totalDuesGetBack.toFixed(2)),
    );
    addKeyValueRow("Pending Dues Subtotal", Number(duesSubtotal.toFixed(2)));

    addEmptyRow();

    // ==========================================================
    // 2) CATEGORY TABLE (only paid: normal + dues-settle)
    // ==========================================================
    addSectionTitle("Category");

    const headerRow = sheet.getRow(currentRow);
    const categoryHeaders = [
      "Category",
      "Sub Total",
      "Discount Amount",
      "Net Amount",
      "Tax",
      "Gross Amount",
    ];
    for (let i = 0; i < categoryHeaders.length; i++) {
      const cell = headerRow.getCell(i + 1);
      cell.value = categoryHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const categories = await buildCategoryReport(paidPayments as any[]);

    for (const cat of categories as any[]) {
      const row = sheet.getRow(currentRow);
      const subTotal = cat.totalAmount || 0;
      const discountAmt = cat.totalDiscount || 0;
      const netAmt = subTotal - discountAmt;
      const taxAmt = cat.totalTax || 0;
      const grossAmt = cat.totalSales || 0;

      row.getCell(1).value = cat.categoryName;
      row.getCell(2).value = Number(subTotal.toFixed(2));
      row.getCell(3).value = Number(discountAmt.toFixed(2));
      row.getCell(4).value = Number(netAmt.toFixed(2));
      row.getCell(5).value = Number(taxAmt.toFixed(2));
      row.getCell(6).value = Number(grossAmt.toFixed(2));

      currentRow += 1;
    }

    addEmptyRow();

    // ==========================================================
    // 3) PAYMENT TYPES TABLE
    //    (align with dashboard: exclude npc & complementary)
    // ==========================================================
    addSectionTitle("Payment Types");

    const payHeaderRow = sheet.getRow(currentRow);
    const payHeaders = ["Payment Type", "Amount", "Total Bills"];
    for (let i = 0; i < payHeaders.length; i++) {
      const cell = payHeaderRow.getCell(i + 1);
      cell.value = payHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const paymentTypeMap: Record<string, { amount: number; count: number }> =
      {};

    for (const p of paidPayments) {
      const mode = p.mode;
      const total = p.total || 0;

      // ✅ Same treatment as salesDashboard: npc & complementary are not "sales modes"
      if (mode === "npc" || mode === "complementary") continue;

      const key = p.paymentMode || "unknown";
      if (!paymentTypeMap[key]) {
        paymentTypeMap[key] = { amount: 0, count: 0 };
      }
      paymentTypeMap[key].amount += total;
      paymentTypeMap[key].count += 1;
    }

    for (const [mode, agg] of Object.entries(paymentTypeMap)) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = mode;
      row.getCell(2).value = Number(agg.amount.toFixed(2));
      row.getCell(3).value = agg.count;
      currentRow += 1;
    }

    addEmptyRow();

    // ==========================================================
    // 4) DUES SETTLEMENT TABLE (DUES_SETTLE)
    // ==========================================================
    addSectionTitle("Dues Settlement (DUES_SETTLE)");

    const dsHeaderRow = sheet.getRow(currentRow);
    const dsHeaders = ["Payment Type", "Dues Get Back Amount", "Total Bills"];
    for (let i = 0; i < dsHeaders.length; i++) {
      const cell = dsHeaderRow.getCell(i + 1);
      cell.value = dsHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const duesSettleMap: Record<string, { amount: number; count: number }> = {};

    for (const p of duesSettlementPayments) {
      const isComplementary = p.mode === "complementary";
      if (isComplementary) continue; // written off, not get-back

      const key = p.paymentMode || "unknown";
      if (!duesSettleMap[key]) {
        duesSettleMap[key] = { amount: 0, count: 0 };
      }
      duesSettleMap[key].amount += p.billValue || 0;
      duesSettleMap[key].count += 1;
    }

    for (const [mode, agg] of Object.entries(duesSettleMap)) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = mode;
      row.getCell(2).value = Number(agg.amount.toFixed(2));
      row.getCell(3).value = agg.count;
      currentRow += 1;
    }

    addEmptyRow();

    // ==========================================================
    // 5) DUES BLOCK (pending)
    // ==========================================================
    addSectionTitle("Dues");

    const duesHeaderRow = sheet.getRow(currentRow);
    const duesHeaders = ["Label", "Amount", "Total Bills"];
    for (let i = 0; i < duesHeaders.length; i++) {
      const cell = duesHeaderRow.getCell(i + 1);
      cell.value = duesHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const duesRow = sheet.getRow(currentRow);
    duesRow.getCell(1).value = "Total Dues";
    duesRow.getCell(2).value = Number(duesSubtotal.toFixed(2));
    duesRow.getCell(3).value = duesOrdersCount;
    currentRow += 1;

    const totalDuesGetBackRow = sheet.getRow(currentRow);
    totalDuesGetBackRow.getCell(1).value = "Total Dues Get Back";
    totalDuesGetBackRow.getCell(2).value = Number(totalDuesGetBack.toFixed(2));
    totalDuesGetBackRow.getCell(3).value = "";
    currentRow += 1;

    addEmptyRow();

    // ==========================================================
    // 6) COMPLIMENTARY + DISCOUNT BLOCK
    // ==========================================================
    addSectionTitle("Complimentary & Discounts");

    const compHeaderRow = sheet.getRow(currentRow);
    const compHeaders = ["Label", "Amount", "Total Bills"];
    for (let i = 0; i < compHeaders.length; i++) {
      const cell = compHeaderRow.getCell(i + 1);
      cell.value = compHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const compRow = sheet.getRow(currentRow);
    compRow.getCell(1).value = "Total complimentary";
    compRow.getCell(2).value = Number(totalComplementary.toFixed(2));
    compRow.getCell(3).value = "";
    currentRow += 1;

    const discRow = sheet.getRow(currentRow);
    discRow.getCell(1).value = "Total discounts (all)";
    discRow.getCell(2).value = Number(allDiscounts.toFixed(2));
    discRow.getCell(3).value = "";
    currentRow += 1;

    addEmptyRow();

    // ==========================================================
    // 7) TIPS BLOCK
    // ==========================================================
    addSectionTitle("Tips");

    const tipsHeaderRow = sheet.getRow(currentRow);
    const tipsHeaders = ["Payment Type", "Amount", "Total Bills"];
    for (let i = 0; i < tipsHeaders.length; i++) {
      const cell = tipsHeaderRow.getCell(i + 1);
      cell.value = tipsHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;

    const tipsByMode: Record<string, { amount: number; count: number }> = {};
    for (const p of paidPayments) {
      const tips = p.tips || 0;
      if (!tips) continue;
      const key = p.paymentMode || "unknown";
      if (!tipsByMode[key]) tipsByMode[key] = { amount: 0, count: 0 };
      tipsByMode[key].amount += tips;
      tipsByMode[key].count += 1;
    }

    for (const [mode, agg] of Object.entries(tipsByMode)) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = mode;
      row.getCell(2).value = Number(agg.amount.toFixed(2));
      row.getCell(3).value = agg.count;
      currentRow += 1;
    }

    currentRow += 2;
  }

  autoFitColumns(sheet);
}
