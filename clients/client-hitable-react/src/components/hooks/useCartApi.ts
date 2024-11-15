import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteCart = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (cartID: string) => {
      const res = await apiRpc.cart[":id"].$delete({
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
