import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import useBusinessDetails from "../store/useBusinessDetails";
import { useLogin } from "../store/useLogin";
import { usePaymentStore } from "../store/usePaymentStore";
import type { UserData } from "../types/businessData";
import { useCallback } from "react";

export const useUserCoinz = (loyaltyId: string) => {
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const { userDetails } = useLogin();
  const setUserLoginCoinz = useLogin((s) => s.setUserCoinZ);
  const setUserCoinz = usePaymentStore((s) => s.setUserCoinz);

  const handleUserCoinz = useCallback(async () => {
    const res = await apiRpc.users[":businessId"].getUserReward.$get({
      param: {
        businessId: businessId || "",
      },
      query: {
        userId: userDetails?._id,
        loyaltyId: loyaltyId,
      },
    });
    const response = (await res.json()) as unknown as { data: UserData };
    if (res.status === 200) {
      setUserCoinz(response?.data?.rewards || 0);
      setUserLoginCoinz(response?.data?.rewards || 0);
    }
    return response?.data?.rewards || 0;
  }, [
    businessId,
    loyaltyId,
    userDetails?._id,
    setUserCoinz,
    setUserLoginCoinz,
  ]);

  useQuery({
    queryKey: ["getUserReward", userDetails?._id, loyaltyId],
    queryFn: handleUserCoinz,
    enabled: !!userDetails?._id && !!loyaltyId,
    staleTime: 1000 * 60,
  });
};
