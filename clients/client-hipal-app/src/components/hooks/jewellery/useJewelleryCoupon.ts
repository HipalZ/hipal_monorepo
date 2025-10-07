import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useError } from "../../store/useError";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { toast } from "react-toastify";

interface IUseApplyJewelleryCouponPayload {
  couponId: string;
  orderId: string;
}

export const useApplyJewelleryCoupon = () => {
  const queryClient = useQueryClient();
  const setError = useError((s) => s.setError);
  const setOpenError = useError((s) => s.setOpenErrorModal);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: IUseApplyJewelleryCouponPayload) => {
      const res = await apiRpc.jewellery.payments.discounts.coupons.add.$post({
        json: payload,
      });

      // 🔑 Parse here instead of later
      const response = await res.json();
      return { status: res.status, body: response };
    },
    onSuccess: ({ status, body }) => {
      if (status === 200 || status === 201) {
        queryClient.invalidateQueries({ queryKey: ["jewelleryOrder"] });
        return;
      }
      if (status === 400 || status === 404) {
        setOpenError(true);
        setError(body?.message || "Failed to apply coupon");
      }
      if (status === 401 || status === 403) {
        setOpenError(true);
        setError("You are not   authorized to perform this action");
        setCheckLogin(true);
      }
      if (status === 409) {
        setOpenError(true);
        setError("Coupon already applied");
      }
    },
    onError: (error: any) => {
      setOpenError(true);
      setError(error?.message || "Something went wrong");
    },
  });

  return { isApplyingCoupon: isPending, applyJewelleryCoupon: mutateAsync };
};

interface IUseRemoveJewelleryCouponPayload {
  orderId: string;
}

export const useRemoveJewelleryCoupon = () => {
  const queryClient = useQueryClient();
  const setError = useError((s) => s.setError);
  const setOpenError = useError((s) => s.setOpenErrorModal);
  const setCheckLogin = useError((s) => s.setCheckLogin);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: IUseRemoveJewelleryCouponPayload) => {
      const res =
        await apiRpc.jewellery.payments.discounts.coupons.remove.$post({
          json: payload,
        });

      // 🔑 Parse here instead of later
      const response = await res.json();
      return { status: res.status, body: response };
    },
    onSuccess: ({ status, body }) => {
      if (status === 200 || status === 201) {
        queryClient.invalidateQueries({ queryKey: ["jewelleryOrder"] });
        return;
      }
      if (status === 400 || status === 404) {
        setOpenError(true);
        setError(body?.message || "Failed to remove coupon");
      }
      if (status === 401 || status === 403) {
        setOpenError(true);
        setError("You are not authorized to perform this action");
        setCheckLogin(true);
      }
      if (status === 409) {
        setOpenError(true);
        setError("No coupon applied");
      }
    },
    onError: (error: any) => {
      setOpenError(true);
      setError(error?.message || "Something went wrong");
    },
  });

  return { isRemovingCoupon: isPending, removeJewelleryCoupon: mutateAsync };
};
