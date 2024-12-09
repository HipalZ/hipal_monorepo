import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import React, { memo } from "react";

const MemoCartPayment = () => {
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);
  const { tableName } = useTableData();
  const getBill = async () => {
    const response = await apiRpc.pos.get_bill.$get({
      query: {
        businessId: outletInfo?.businessId || "",
        tableName,
        generatedBy: userDetails?.name || "",
      },
    });
    const res = await response.json();
    console.log(res);

    return res;
  };

  const { isLoading } = useQuery({
    queryKey: ["getBill", outletInfo?.businessId, tableName],
    queryFn: getBill,
    staleTime: 60 * 5,
  });

  

  return <div>cartPayment</div>;
};

const CartPayment = memo(MemoCartPayment);
export default CartPayment;
