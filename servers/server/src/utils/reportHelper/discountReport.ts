import type { Workbook } from "exceljs";
import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { formatDateToIST } from "./dateFormater";
import type { AnyPayment, BaseContext } from "./types";
import { addBoldHeaderRow, addKeyValueRow, autoFitColumns } from "./excelUtils";

interface DiscountReport {
  businessId: string;
  businessName: string;
  discounts: DiscountDetails[];
}

interface DiscountDetails {
  discountName: string;
  discountCount: number;
  amount: number;
}

// ---------------------------------------------------------------------
// Helper: Discount Report sheet
// ---------------------------------------------------------------------

export async function buildDiscountReport(
  payments: PaymentType[],
  businessIds: string[],
  from: number,
  to: number,
): Promise<DiscountReport[]> {
  // Fetch business names
  const bizDocs = await Business.find({ _id: { $in: businessIds } })
    .lean()
    .select({ name: 1 });

  const nameMap: Record<string, string> = {};
  for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

  // Group payments by businessId
  const paymentsByBiz: Record<string, PaymentType[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of payments) {
    paymentsByBiz[p.businessId]?.push(p);
  }

  const report = businessIds.map((biz) => {
    let discountTypes: Record<
      string,
      { discountCount: number; amount: number }
    > = {
      claimedCoins: { discountCount: 0, amount: 0 },
      couponDiscount: { discountCount: 0, amount: 0 },
      discount: { discountCount: 0, amount: 0 },
    };

    for (const payment of paymentsByBiz[biz]) {
      if (payment.claimedCoins) {
        discountTypes.claimedCoins.discountCount++;
        discountTypes.claimedCoins.amount += payment.claimedCoins;
      }
      if (payment.couponDiscount) {
        discountTypes.couponDiscount.discountCount++;
        discountTypes.couponDiscount.amount += payment.couponDiscount;
      }
      if (payment.discount) {
        discountTypes.discount.discountCount++;
        discountTypes.discount.amount += payment.discount;
      }
    }

    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);
    return {
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      from: fromIST,
      to: toIST,
      discounts: Object.entries(discountTypes).map(
        ([discountName, { discountCount, amount }]) => ({
          discountName,
          discountCount,
          amount,
        }),
      ),
    };
  });

  return report;
}

export async function buildDiscountSheet(workbook: Workbook, ctx: BaseContext) {
  const { businessIds, allPayments, from, to } = ctx;

  const sheet = workbook.addWorksheet("Discount Report");

  const discountEligiblePayments = allPayments.filter((p: AnyPayment) => {
    return (
      typeof p.discount !== "undefined" &&
      typeof p.couponDiscount !== "undefined" &&
      typeof p.claimedCoins !== "undefined"
    );
  }) as PaymentType[];

  const discountReport = await buildDiscountReport(
    discountEligiblePayments,
    businessIds,
    from,
    to,
  );

  const header = ["DiscountName", "DiscountCount", "Amount"];

  for (const { businessId, businessName, discounts } of discountReport) {
    sheet.addRow([]);
    addKeyValueRow(sheet, "BusinessId", businessId);
    addKeyValueRow(sheet, "BusinessName", businessName);
    addBoldHeaderRow(sheet, header);

    for (const discount of discounts as Array<{
      discountName: string;
      discountCount: number;
      amount: number;
    }>) {
      sheet.addRow([
        discount.discountName,
        discount.discountCount,
        discount.amount,
      ]);
    }
  }
  autoFitColumns(sheet);
}
