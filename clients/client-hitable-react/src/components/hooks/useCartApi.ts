import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCartStore } from "../store/useCartStore";
import { useOrderStore } from "../store/useOrderData";
import { useCart } from "../store/useCart";
import { useError } from "../store/useError";

export const useDeleteCart = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (cartID: string) => {
      const res = await apiRpc.cart.archive[":id"].$put({
        param: {
          id: cartID,
        },
        json: {},
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

  const { setOpenOrderModal, setModalType, setOrderError, setShowOrderError } =
    useOrderStore();
  const { setError, setOpenErrorModal } = useError();
  const { setIsPlacingNewOrder } = useCart();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (order: any) => {
      const res = await apiRpc.pos.captain.save_kot.$post({
        json: order,
      });
      if (res.status === 401 || res.status === 403) {
        setOpenErrorModal(true);
        setError("You are not authorized to perform this action");
      }
      if (res.status === 200 || res.status === 201) {
        setOpenOrderModal(false);
        setIsPlacingNewOrder(false);
        setModalType("addItem");
        useCartStore.setState({ cart: [] });
        queryClient.invalidateQueries({ queryKey: ["getTableOrders"] });
        queryClient.invalidateQueries({ queryKey: ["fetchIndividualTable"] });
        toast.success("Order placed successfully");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.err) {
        setOrderError(data.message);
        setShowOrderError(true);
        return;
      }
    },
    onError: (error: any) => {
      toast.error(`Error creating order: ${error.message}`);
    },
  });
  return { createOrder: mutateAsync, isPending };
};

export interface IUpdateOrderAction {
  orderAction: "ACCEPT" | "REJECT" | "EDIT";
  orderId: string;
  performBy: string;
  reasonOfRejection?: string;
}

export const useUpdateOrderAction = () => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: IUpdateOrderAction) => {
      const requestBody: IUpdateOrderAction = {
        orderAction: payload.orderAction,
        orderId: payload.orderId,
        performBy: payload.performBy,
      };

      if (payload.orderAction === "REJECT") {
        requestBody.reasonOfRejection = payload.reasonOfRejection;
      }

      const response = await apiRpc.kot.$put({
        json: requestBody,
      });

      if (response.status === 200 || response.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["carts"] });
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.err) {
        toast.error(data.message);
        return;
      }
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(`Error updating order action: ${error.message}`);
    },
  });

  return { updateOrderAction: mutateAsync, isPending };
};
