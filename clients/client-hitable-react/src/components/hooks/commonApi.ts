import { useUserToken } from "@/components/store/useTokenStore";

export const handleRemoveAlert = async (apiRpc: any, id: string, waiterName: string): Promise<{ status?: number }> => {
  const accessToken = useUserToken.getState().accessToken;
  const refreshToken = useUserToken.getState().refreshToken;
  const res = await apiRpc.payments[':pid'].order[':alertId'].$put({
    header: {
      x_access_token: accessToken,
      x_refresh_token: refreshToken
    },
    param: {
      alertId: id,
    },
    json: {
      waiterName,
    },
  });
  return res;
};
