import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { formatDateToIST } from "./dateFormater";

interface AddOnReport {
  businessId: string;
  businessName: string;
  addOns: AddOnDetails[];
}

interface AddOnDetails {
  addOnName: string;
  addOnCount: number;
  quantity: number;
  amount: number;
}

export async function buildAddOnReport(
  payments: PaymentType[],
  businessIds: string[],
  from: number,
  to: number,
): Promise<AddOnReport[]> {
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
    const addOnMap: Record<
      string,
      { addOnCount: number; quantity: number; amount: number }
    > = {};

    for (const payment of paymentsByBiz[biz]) {
      for (const billItem of payment.billItems) {
        if (billItem.extras) {
          for (const extra of billItem.extras) {
            const addOnName = extra.name;

            // Initialize or update the add-on data
            if (!addOnMap[addOnName]) {
              addOnMap[addOnName] = {
                addOnCount: 0,
                quantity: 0,
                amount: 0,
              };
            }

            const addOn = addOnMap[addOnName];
            addOn.addOnCount += 1;
            addOn.quantity += extra.quantity || 1;
            addOn.amount += (extra.price || 0) * (extra.quantity || 1);
          }
        }
      }
    }

    const addOns = Object.entries(addOnMap).map(
      ([addOnName, { addOnCount, quantity, amount }]) => ({
        addOnName,
        addOnCount,
        quantity,
        amount,
      }),
    );

    addOns.sort((a, b) => b.addOnCount - a.addOnCount);

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
