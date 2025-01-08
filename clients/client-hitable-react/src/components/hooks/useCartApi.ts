import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderData";

export const useDeleteCart = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (cartID: string) => {
      const res = await apiRpc.cart.archive[":id"].$put({
        param: {
          id: cartID,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.err) {
        toast.error(data.message);
        return;
      }
      if (!data.err) {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(`Error Cart coupon: ${error.message}`);
    },
  });
  return { deleteCart: mutateAsync, isPending };
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const { setOpenOrderModal, setModalType } = useOrderStore();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (order: any) => {
      const res = await apiRpc.pos.captain.save_kot.$post({
        json: order,
      });
      if (res.status === 200 || res.status === 201) {
        setOpenOrderModal(false);
        setModalType("addItem");
        useCartStore.setState({ cart: [] });
        queryClient.invalidateQueries({ queryKey: ["getTableOrders"] });
        return true;
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.err) {
        toast.error(data.message);
        return;
      }
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(`Error creating order: ${error.message}`);
    },
  });
  return { createOrder: mutateAsync, isPending };
};
