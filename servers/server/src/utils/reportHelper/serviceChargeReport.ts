import type { Workbook, Worksheet } from "exceljs";
import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { formatDateToIST } from "./dateFormater";
import type { AnyPayment, BaseContext } from "./types";
import { addBoldHeaderRow, autoFitColumns } from "./excelUtils";

interface ServiceChargeReport {
  businessId: string;
  businessName: string;
  serviceCharge: number;
}

// ---------------------------------------------------------------------
// Helper: Service Charge Report sheet
// ---------------------------------------------------------------------

export async function buildServiceChargeReport(
  payments: PaymentType[],
  businessIds: string[],
  from: number,
  to: number,
): Promise<ServiceChargeReport[]> {
  const bizDocs = await Business.find({ _id: { $in: businessIds } })
    .lean()
    .select({ name: 1 });

  const nameMap: Record<string, string> = {};
  for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

  const paymentsByBiz: Record<string, PaymentType[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of payments) {
    paymentsByBiz[p.businessId]?.push(p);
  }

  const report = businessIds.map((biz) => {
    const paymentsForBiz = paymentsByBiz[biz];

    const totalServiceCharge = paymentsForBiz.reduce(
      (total, payment) => total + (payment.serviceCharge || 0),
      0,
    );
    const fromIST = formatDateToIST(from);
    const toIST = formatDateToIST(to);

    return {
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      from: fromIST,
      to: toIST,
      serviceCharge: totalServiceCharge,
    };
  });

  return report;
}

export async function buildServiceChargeSheet(
  workbook: Workbook,
  ctx: BaseContext,
) {
  const { businessIds, allPayments, from, to } = ctx;

  const sheet: Worksheet = workbook.addWorksheet("Service Charge Report");

  const serviceChargePayments = allPayments.filter(
    (p: AnyPayment) => typeof p.serviceCharge !== "undefined",
  ) as PaymentType[];

  const serviceChargeData = await buildServiceChargeReport(
    serviceChargePayments,
    businessIds,
    from,
    to,
  );

  const header = ["BusinessId", "BusinessName", "ServiceCharge"];
  addBoldHeaderRow(sheet, header);

  for (const item of serviceChargeData) {
    sheet.addRow([item.businessId, item.businessName, item.serviceCharge]);
  }
  autoFitColumns(sheet);
}
