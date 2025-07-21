import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";

interface ServiceChargeReport {
  businessId: string;
  businessName: string;
  serviceCharge: number;
}

export async function buildServiceChargeReport(
  payments: PaymentType[],
  businessIds: string[],
): Promise<ServiceChargeReport[]> {
  // 1) Fetch business names using businessIds
  const bizDocs = await Business.find({ _id: { $in: businessIds } })
    .lean()
    .select({ name: 1 });

  const nameMap: Record<string, string> = {};
  for (const b of bizDocs) nameMap[b._id.toString()] = b.name;

  // 2) Group payments by businessId
  const paymentsByBiz: Record<string, PaymentType[]> = {};
  for (const id of businessIds) paymentsByBiz[id] = [];
  for (const p of payments) {
    paymentsByBiz[p.businessId]?.push(p);
  }

  // 3) Process each business and calculate total service charge
  const report = businessIds.map((biz) => {
    const paymentsForBiz = paymentsByBiz[biz];

    const totalServiceCharge = paymentsForBiz.reduce(
      (total, payment) => total + (payment.serviceCharge || 0),
      0,
    );

    return {
      businessId: biz,
      businessName: nameMap[biz] ?? "Unknown",
      serviceCharge: totalServiceCharge,
    };
  });

  return report;
}
