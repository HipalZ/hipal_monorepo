import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "@/components/store/useCart";
import { useOrderStore } from "@/components/store/useOrderData";
import toast from "react-hot-toast";
import type { OrderData } from "../types/hiClientzData.ts";
import { useError } from "../store/useError.ts";

export const useGetAllOrders = () => {
  const { tableId } = useParams();
  const { setIsPlacingNewOrder } = useCart();
  const { setOrderDataStore } = useOrderStore();
  const getTableOrders = useCallback(async () => {
    const response = await apiRpc.kot.table_kot[":tableId"].$get({
      param: { tableId: tableId || "" },
    });

    const res = await response.json();
    const orderData = res.data as OrderData[];
    setOrderDataStore(orderData);
    if (orderData?.length > 0) {
      setIsPlacingNewOrder(false);
    }
    return res.data;
  }, [tableId]);

  const { isLoading, data } = useQuery({
    queryKey: ["getTableOrders", tableId],
    queryFn: getTableOrders,
    enabled: !!tableId,
  });
  return { isLoading, data };
};

interface DeleteKotItems {
  itemId: string;
  quantity: number;
}
interface DeleteKotPayload {
  kotItems: DeleteKotItems[];
  deletedBy: string;
  reasonOfDeletion: string;
  password?: string;
}

export const useDeleteKot = () => {
  const queryClient = useQueryClient();
  const { tableId } = useParams();
  const { setError, setOpenErrorModal } = useError();
  const { isPending, mutateAsync, isError } = useMutation({
    mutationFn: async (payload: DeleteKotPayload) => {
      const response = await apiRpc.kot.delete_kot.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.message);
        setOpenErrorModal(true);
        toast.error(extraData?.message);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["getTableOrders", tableId],
        });
        toast.success("Kot deleted successfully");
        return;
      }
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });
  return { isPending, mutateAsync, isError };
};
