// utils/reportHelper/consolidatedReport.ts
import type * as ExcelJS from 'exceljs';
import { buildCategoryReport } from './categoryReport';
import { formatDateToIST } from './dateFormater';
import { autoFitColumns } from './excelUtils';
import { filterPaymentsForItemReports } from './itemFinancialCalculator';
import { buildParentCategoryReport } from './parentCategoryReport';
import type { BaseContext } from './types';

type AnyPayment = any;

/** Per-business consolidated report data (for API preview and Excel). */
export interface ConsolidatedBusinessBlock {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  summary: {
    netSale: number;
    grossSale: number;
    totalOrdersPaid: number;
    duesGetBack: number;
    pendingDuesSubtotal: number;
  };
  parentCategories: Array<{
    parentCategoryName: string;
    subTotal: number;
    discount: number;
    netAmount: number;
    tax: number;
    grossAmount: number;
  }>;
  categories: Array<{
    categoryName: string;
    subTotal: number;
    discountAmount: number;
    netAmount: number;
    tax: number;
    grossAmount: number;
  }>;
  paymentTypes: Array<{ paymentType: string; amount: number; totalBills: number }>;
  duesSettlement: Array<{
    paymentType: string;
    duesGetBackAmount: number;
    totalBills: number;
  }>;
  dues: {
    totalDues: number;
    totalDuesGetBack: number;
    duesOrdersCount: number;
  };
  complimentaryDiscounts: {
    totalComplementary: number;
    totalDiscountsAll: number;
  };
  tips: Array<{ paymentType: string; amount: number; totalBills: number }>;
}

/**
 * Build consolidated report data for all businesses (for JSON API and Excel).
 */
export async function buildConsolidatedData(ctx: BaseContext): Promise<ConsolidatedBusinessBlock[]> {
  const { businessIds, allPayments, bizNameMap, from, to } = ctx;
  const result: ConsolidatedBusinessBlock[] = [];

  for (const biz of businessIds) {
    const businessName = bizNameMap[biz] ?? 'Business';

    const bizPayments = allPayments.filter((p: AnyPayment) => p.businessId.toString() === biz);

    const duesSettlementPayments = bizPayments.filter((p: AnyPayment) => p.settleType === 'DUES_SETTLE');

    const normalPaidPayments = bizPayments.filter((p: AnyPayment) => p.mode !== 'dues' && p.settleType !== 'DUES_SETTLE');

    const duesPayments = bizPayments.filter((p: AnyPayment) => p.mode === 'dues' && p.settleType !== 'DUES_SETTLE');

    const paidPayments = [...normalPaidPayments, ...duesSettlementPayments];

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
    let totalDuesGetBack = 0;

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

      const isDuesSettle = p.settleType === 'DUES_SETTLE';
      const isComplementary = p.mode === 'complementary';

      if (isComplementary) totalComplementary += billValue;
      if (isDuesSettle && !isComplementary) totalDuesGetBack += billValue;
      if (p.mode === 'npc') totalNpc += billValue;
    }

    const allDiscounts = totalDiscount + totalCouponDiscount + totalClaimedCoins;
    const discountWithNpcAndComp = totalComplementary + totalNpc + allDiscounts;
    const netSales = totalBillValue - discountWithNpcAndComp;

    let duesSubtotal = 0;
    let duesTax = 0;
    let duesServiceCharge = 0;
    let duesDiscount = 0;
    let duesTotal = 0;

    for (const p of duesPayments) {
      duesSubtotal += p.billValue || 0;
      duesTax += p.tax || 0;
      duesServiceCharge += p.serviceCharge || 0;
      duesTotal += p.total || 0;
      duesDiscount += (p.claimedCoins || 0) + (p.discount || 0) + (p.couponDiscount || 0);
    }

    const paidOrdersCount = paidPayments.length;
    const duesOrdersCount = duesPayments.length;
    const fromDateStr = formatDateToIST(from);
    const toDateStr = formatDateToIST(to);

    const itemEligiblePaid = filterPaymentsForItemReports(paidPayments as any[]);
    const parentResult = await buildParentCategoryReport(itemEligiblePaid, [biz], { includeChildBreakdown: false });

    const parentCategories = parentResult.parentCategories.map((parent) => {
      const subTotal = parent.grossAmount || 0;
      const discountAmt = parent.discount || 0;
      const netAmt = subTotal - discountAmt;
      const taxAmt = parent.totalTax || 0;
      const grossAmt = parent.finalAmount || 0;
      return {
        parentCategoryName: parent.parentCategoryName,
        subTotal: Number(subTotal.toFixed(2)),
        discount: Number(discountAmt.toFixed(2)),
        netAmount: Number(netAmt.toFixed(2)),
        tax: Number(taxAmt.toFixed(2)),
        grossAmount: Number(grossAmt.toFixed(2)),
      };
    });

    const categoriesRaw = await buildCategoryReport(paidPayments as any[]);
    const categories = (categoriesRaw as any[]).map((cat) => {
      const subTotal = cat.totalAmount || 0;
      const discountAmt = cat.totalDiscount || 0;
      const netAmt = subTotal - discountAmt;
      const taxAmt = cat.totalTax || 0;
      const grossAmt = cat.totalSales || 0;
      return {
        categoryName: cat.categoryName,
        subTotal: Number(subTotal.toFixed(2)),
        discountAmount: Number(discountAmt.toFixed(2)),
        netAmount: Number(netAmt.toFixed(2)),
        tax: Number(taxAmt.toFixed(2)),
        grossAmount: Number(grossAmt.toFixed(2)),
      };
    });

    const paymentTypeMap: Record<string, { amount: number; count: number }> = {};
    for (const p of paidPayments) {
      const mode = p.mode;
      const total = p.total || 0;
      if (mode === 'npc' || mode === 'complementary') continue;
      const key = p.paymentMode || 'unknown';
      if (!paymentTypeMap[key]) paymentTypeMap[key] = { amount: 0, count: 0 };
      paymentTypeMap[key].amount += total;
      paymentTypeMap[key].count += 1;
    }
    const paymentTypes = Object.entries(paymentTypeMap).map(([paymentType, agg]) => ({
      paymentType,
      amount: Number(agg.amount.toFixed(2)),
      totalBills: agg.count,
    }));

    const duesSettleMap: Record<string, { amount: number; count: number }> = {};
    for (const p of duesSettlementPayments) {
      if (p.mode === 'complementary') continue;
      const key = p.paymentMode || 'unknown';
      if (!duesSettleMap[key]) duesSettleMap[key] = { amount: 0, count: 0 };
      duesSettleMap[key].amount += p.billValue || 0;
      duesSettleMap[key].count += 1;
    }
    const duesSettlement = Object.entries(duesSettleMap).map(([paymentType, agg]) => ({
      paymentType,
      duesGetBackAmount: Number(agg.amount.toFixed(2)),
      totalBills: agg.count,
    }));

    const tipsByMode: Record<string, { amount: number; count: number }> = {};
    for (const p of paidPayments) {
      const tips = p.tips || 0;
      if (!tips) continue;
      const key = p.paymentMode || 'unknown';
      if (!tipsByMode[key]) tipsByMode[key] = { amount: 0, count: 0 };
      tipsByMode[key].amount += tips;
      tipsByMode[key].count += 1;
    }
    const tips = Object.entries(tipsByMode).map(([paymentType, agg]) => ({
      paymentType,
      amount: Number(agg.amount.toFixed(2)),
      totalBills: agg.count,
    }));

    result.push({
      businessId: biz,
      businessName,
      from: fromDateStr,
      to: toDateStr,
      summary: {
        netSale: Number(netSales.toFixed(2)),
        grossSale: Number(totalBillValue.toFixed(2)),
        totalOrdersPaid: paidOrdersCount,
        duesGetBack: Number(totalDuesGetBack.toFixed(2)),
        pendingDuesSubtotal: Number(duesSubtotal.toFixed(2)),
      },
      parentCategories,
      categories,
      paymentTypes,
      duesSettlement,
      dues: {
        totalDues: Number(duesSubtotal.toFixed(2)),
        totalDuesGetBack: Number(totalDuesGetBack.toFixed(2)),
        duesOrdersCount,
      },
      complimentaryDiscounts: {
        totalComplementary: Number(totalComplementary.toFixed(2)),
        totalDiscountsAll: Number(allDiscounts.toFixed(2)),
      },
      tips,
    });
  }

  return result;
}

const sectionHeaderStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF1F497D' },
  },
  alignment: { vertical: 'middle' as const, horizontal: 'left' as const },
};

const tableHeaderStyle = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF305496' },
  },
  alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
};

export async function buildConsolidatedSheet(workbook: ExcelJS.Workbook, ctx: BaseContext) {
  const data = await buildConsolidatedData(ctx);

  const sheet = workbook.addWorksheet('Consolidated Report');
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

  for (const block of data) {
    addSectionTitle(`Summary - ${block.businessName}`);
    addKeyValueRow('Date', `${block.from} - ${block.to}`);
    addKeyValueRow('Net Sale', block.summary.netSale);
    addKeyValueRow('Gross Sale (Subtotal)', block.summary.grossSale);
    addKeyValueRow('Total Orders (Paid)', block.summary.totalOrdersPaid);
    addKeyValueRow('Dues Get Back (DUES_SETTLE, non-complementary)', block.summary.duesGetBack);
    addKeyValueRow('Pending Dues Subtotal', block.summary.pendingDuesSubtotal);
    addEmptyRow();

    addSectionTitle('Parent Category');
    const parentHeaders = ['Parent Category', 'Sub Total', 'Discount', 'Net Amount', 'Tax', 'Gross Amount'];
    const parentHeaderRow = sheet.getRow(currentRow);
    for (let i = 0; i < parentHeaders.length; i++) {
      const cell = parentHeaderRow.getCell(i + 1);
      cell.value = parentHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;
    for (const r of block.parentCategories) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.parentCategoryName;
      row.getCell(2).value = r.subTotal;
      row.getCell(3).value = r.discount;
      row.getCell(4).value = r.netAmount;
      row.getCell(5).value = r.tax;
      row.getCell(6).value = r.grossAmount;
      currentRow += 1;
    }
    addEmptyRow();

    addSectionTitle('Category');
    const catHeaders = ['Category', 'Sub Total', 'Discount Amount', 'Net Amount', 'Tax', 'Gross Amount'];
    const catHeaderRow = sheet.getRow(currentRow);
    for (let i = 0; i < catHeaders.length; i++) {
      const cell = catHeaderRow.getCell(i + 1);
      cell.value = catHeaders[i];
      cell.style = tableHeaderStyle;
    }
    currentRow += 1;
    for (const r of block.categories) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.categoryName;
      row.getCell(2).value = r.subTotal;
      row.getCell(3).value = r.discountAmount;
      row.getCell(4).value = r.netAmount;
      row.getCell(5).value = r.tax;
      row.getCell(6).value = r.grossAmount;
      currentRow += 1;
    }
    addEmptyRow();

    addSectionTitle('Payment Types');
    const payHeaderRow = sheet.getRow(currentRow);
    ['Payment Type', 'Amount', 'Total Bills'].forEach((h, i) => {
      payHeaderRow.getCell(i + 1).value = h;
      payHeaderRow.getCell(i + 1).style = tableHeaderStyle;
    });
    currentRow += 1;
    for (const r of block.paymentTypes) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.paymentType;
      row.getCell(2).value = r.amount;
      row.getCell(3).value = r.totalBills;
      currentRow += 1;
    }
    addEmptyRow();

    addSectionTitle('Dues Settlement (DUES_SETTLE)');
    const dsHeaderRow = sheet.getRow(currentRow);
    ['Payment Type', 'Dues Get Back Amount', 'Total Bills'].forEach((h, i) => {
      dsHeaderRow.getCell(i + 1).value = h;
      dsHeaderRow.getCell(i + 1).style = tableHeaderStyle;
    });
    currentRow += 1;
    for (const r of block.duesSettlement) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.paymentType;
      row.getCell(2).value = r.duesGetBackAmount;
      row.getCell(3).value = r.totalBills;
      currentRow += 1;
    }
    addEmptyRow();

    addSectionTitle('Dues');
    const duesHeaderRow = sheet.getRow(currentRow);
    ['Label', 'Amount', 'Total Bills'].forEach((h, i) => {
      duesHeaderRow.getCell(i + 1).value = h;
      duesHeaderRow.getCell(i + 1).style = tableHeaderStyle;
    });
    currentRow += 1;
    const duesRow = sheet.getRow(currentRow);
    duesRow.getCell(1).value = 'Total Dues';
    duesRow.getCell(2).value = block.dues.totalDues;
    duesRow.getCell(3).value = block.dues.duesOrdersCount;
    currentRow += 1;
    const duesGetBackRow = sheet.getRow(currentRow);
    duesGetBackRow.getCell(1).value = 'Total Dues Get Back';
    duesGetBackRow.getCell(2).value = block.dues.totalDuesGetBack;
    duesGetBackRow.getCell(3).value = '';
    currentRow += 1;
    addEmptyRow();

    addSectionTitle('Complimentary & Discounts');
    const compHeaderRow = sheet.getRow(currentRow);
    ['Label', 'Amount', 'Total Bills'].forEach((h, i) => {
      compHeaderRow.getCell(i + 1).value = h;
      compHeaderRow.getCell(i + 1).style = tableHeaderStyle;
    });
    currentRow += 1;
    const compRow = sheet.getRow(currentRow);
    compRow.getCell(1).value = 'Total complimentary';
    compRow.getCell(2).value = block.complimentaryDiscounts.totalComplementary;
    compRow.getCell(3).value = '';
    currentRow += 1;
    const discRow = sheet.getRow(currentRow);
    discRow.getCell(1).value = 'Total discounts (all)';
    discRow.getCell(2).value = block.complimentaryDiscounts.totalDiscountsAll;
    discRow.getCell(3).value = '';
    currentRow += 1;
    addEmptyRow();

    addSectionTitle('Tips');
    const tipsHeaderRow = sheet.getRow(currentRow);
    ['Payment Type', 'Amount', 'Total Bills'].forEach((h, i) => {
      tipsHeaderRow.getCell(i + 1).value = h;
      tipsHeaderRow.getCell(i + 1).style = tableHeaderStyle;
    });
    currentRow += 1;
    for (const r of block.tips) {
      const row = sheet.getRow(currentRow);
      row.getCell(1).value = r.paymentType;
      row.getCell(2).value = r.amount;
      row.getCell(3).value = r.totalBills;
      currentRow += 1;
    }
    currentRow += 2;
  }

  autoFitColumns(sheet);
}
