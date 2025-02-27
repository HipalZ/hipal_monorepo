import useBusinessData from "@/components/store/useBusinessData";
import type { IPaymentMode } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export const useAllModes = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const getAllModes = async () => {
    const response = await apiRpc.upi_mode.all_modes[":businessId"].$get({
      param: {
        businessId,
      },
    });
    const res = await response.json();
    return res.data as IPaymentMode[];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["allModes", businessId],
    queryFn: getAllModes,
    enabled: !!businessId,
  });

  return { isLoading, data };
};
