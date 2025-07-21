import { Business } from "@hi/db-models";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { formatDateToIST } from "./dateFormater";

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
