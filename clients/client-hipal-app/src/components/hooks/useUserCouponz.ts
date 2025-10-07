import { apiRpc } from "@hi/common";
import { useCouponz } from "../store/useCouponz";
import { useQuery } from "@tanstack/react-query";

const useUserCouponz = (businessId: string, userId: string) => {
  const setUserCouponz = useCouponz((s) => s.setCouponz);
  const getUserCouponz = async () => {
    try {
      const response = await apiRpc.couponz["eligible-coupons"][":businessId"][
        ":userId"
      ].$get({
        param: {
          businessId: businessId,
          userId: userId,
        },
      });
      const res = await response.json();
      setUserCouponz(res.data || []);
      return res.data;
    } catch (err) {
      console.error("Error fetching user coupons:", err);
    }
  };

  const {
    data: couponData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["getUserCouponz", businessId, userId],
    queryFn: getUserCouponz,
    enabled: !!businessId && !!userId,
  });

  return { couponData, error, isLoading };
};

export default useUserCouponz;
