
export const handleRemoveAlert = async (apiRpc: any, id: string, waiterName: string): Promise<{ status?: number }> => {
  const res = await apiRpc.payments[':pid'].order[':alertId'].$put({
    param: {
      alertId: id,
    },
    json: {
      waiterName,
    },
  });
  return res;
};
