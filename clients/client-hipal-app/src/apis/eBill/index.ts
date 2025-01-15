import type { IBusinessData } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

async function eBillApis(tableId: string) {
  const response = await apiRpc.kot.table_kot[":tableId"].$get({
    param: {
      tableId,
    },
  });
  const res = await response.json();
  const data = {} as IBusinessData;
  data["kot"] = res?.data || [];
  return data;
}

export const eBillApi = {
  all: eBillApis,
};

export async function fetchAllBusinessIds() {
  const res = await apiRpc.businesses.get.allbusiness.$get({});
  const response = await res.json();
  return response?.data.map((business: { _id: string }) => business._id);
}
