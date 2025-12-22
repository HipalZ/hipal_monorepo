import { KotOrder } from "@hi/db-models";
import type { ClientSession } from "mongoose";
import { type KotOrderTypes, calculateBillTotals } from "../../utils/bill";
const calculateSubtotal = async (
  tableName: string,
  businessId: string,
  session: ClientSession,
) => {
  const kotOrders = (await KotOrder.find({
    tableName: tableName,
    settled: false,
    accepted: true,
    businessId,
  })
    .session(session)
    .lean()) as KotOrderTypes[];

  const { totalDishTotal, totalGst } = calculateBillTotals(kotOrders);
  return totalDishTotal;
};

export default calculateSubtotal;
