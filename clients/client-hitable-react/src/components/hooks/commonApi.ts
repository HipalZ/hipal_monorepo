import { apiRpc } from "@hi/common";

export const handleRemoveAlert = async (id: string, waiterName:string): Promise<{ status?: number }> => {
    try {
      const res = await apiRpc.payments[':pid'].order[':alertId'].$put({
        param: {
          alertId: id,
        },
        json:{
          waiterName,
        }
      })
      return res;
    } catch (err) {
      throw new Error("Failed to remove alert");
    }
  };