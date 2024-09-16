import { apiRpc } from "@hi/common";
import { useCouponz } from "../store/useCouponz";
import { useQuery } from "@tanstack/react-query";

const useUserCouponz = (businessId: string, userId: string) => {
  const { userCouponz, setUserCouponz } = useCouponz((s) => ({
    userCouponz: s.userCouponz,
    setUserCouponz: s.setUserCouponz,
  }));
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
      console.log("res", res);
      setUserCouponz(res.data || []);
      return res.data;
    } catch (err) {
      console.error("Error fetching user coupons:", err);
    }
  };

  const { error, isLoading } = useQuery({
    queryKey: ["getUserCouponz", businessId, userId],
    queryFn: getUserCouponz,
    enabled: !!businessId && !!userId,
  });

  return { userCouponz, error, isLoading };
};

export default useUserCouponz;
