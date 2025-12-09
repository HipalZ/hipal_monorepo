import type * as ExcelJS from "exceljs";
import type { Workbook } from "exceljs";
import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { formatDateToIST } from "./dateFormater";
import { autoFitColumns } from "./excelUtils";
import type { BaseContext } from "./types";

interface AddOnReport {
  businessId: string;
  businessName: string;
  from: string;
  to: string;
  addOns: AddOnDetails[];
}

interface AddOnDetails {
  addOnName: string;
  addOnCount: number;
  amount: number;
  totalSales: number;
}

const addKeyValueRow = (
  sheet: ExcelJS.Worksheet,
  key: string,
  value: string | number,
) => {
  const row = sheet.addRow([key, value]);
  row.getCell(1).font = { bold: true };
};

const addBoldHeaderRow = (sheet: ExcelJS.Worksheet, headers: string[]) => {
  const row = sheet.addRow(headers);
  row.eachCell((cell) => {
    cell.font = { bold: true };
  });
};

// ---------------------------------------------------------------------
// Helper: Add-on Report sheet
// ---------------------------------------------------------------------

export async function buildAddOnReport(
  payments: PaymentType[],
  businessIds: string[],
  from: number,
  to: number,
): Promise<AddOnReport[]> {
  // Fetch business names for each businessId
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

  // Process the data for each business
  const report = businessIds.map((biz) => {
    const addOnMap: Record<
      string,
      {
        addOnCount: number;
        amount: number;
        totalSales: number;
      }
    > = {};

    // Process each payment and its bill items to gather add-on information
    for (const payment of paymentsByBiz[biz]) {
      for (const billItem of payment.billItems) {
        if (billItem.extras) {
          for (const extra of billItem.extras) {
            const addOnName = extra.name;

            // Initialize or update the add-on data for each extra
            if (!addOnMap[addOnName]) {
              addOnMap[addOnName] = {
                addOnCount: 0,
                amount: 0,
                totalSales: 0,
              };
            }

            const addOn = addOnMap[addOnName];
            addOn.addOnCount += 1;
            const extraAmount = (extra.price || 0) * (extra.quantity || 1);
            addOn.amount += extraAmount;
            addOn.totalSales += extraAmount; // This accumulates the total sales for each add-on
          }
        }
      }
    }

    // Convert the map to an array of AddOnDetails
    const addOns = Object.entries(addOnMap).map(
      ([addOnName, { addOnCount, amount, totalSales }]) => ({
        addOnName,
        addOnCount,
        amount,
        totalSales: Number(totalSales.toFixed(2)) * addOnCount,
      }),
    );

    // Sort by addOnCount in descending order
    addOns.sort((a, b) => b.addOnCount - a.addOnCount);

    // Format the date range in IST
    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    return {
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      from: fromIST,
      to: toIST,
      addOns,
    };
  });

  return report;
}

export async function buildAddOnSheet(workbook: Workbook, ctx: BaseContext) {
  const { businessIds, allPayments, from, to } = ctx;

  const sheet = workbook.addWorksheet("AddOn Report");

  const addOnPayments = allPayments.filter((p) =>
    (p.billItems || []).some(
      (bi: any) =>
        bi.extras && Array.isArray(bi.extras) && bi.extras.length > 0,
    ),
  ) as PaymentType[];

  const addOnReport = await buildAddOnReport(
    addOnPayments,
    businessIds,
    from,
    to,
  );

  const header = ["Name", "No.of Orders", "Net Amount", "Total Sales"];

  for (const item of addOnReport) {
    sheet.addRow([]);
    addKeyValueRow(sheet, "businessId", item.businessId);
    addKeyValueRow(sheet, "businessName", item.businessName);
    addBoldHeaderRow(sheet, header);

    for (const addOn of item.addOns) {
      sheet.addRow([
        addOn.addOnName,
        addOn.addOnCount,
        addOn.amount,
        addOn.totalSales,
      ]);
    }
  }
  autoFitColumns(sheet);
}
