import { apiRpc } from "@hi/common";
import type { IBillData } from "../types/hiClientzData.ts";
import { useError } from "../store/useError.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useOrderStore } from "../store/useOrderData.ts";
import { useHiClientZ } from "../store/useHiClientzData.ts";
import toast from "react-hot-toast";
export const useGetBill = () => {
  const { businessId } = useParams();
  const { setError, setOpenErrorModal } = useError();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { captainData: userData } = useHiClientZ();

  const queryClient = useQueryClient();

  const getTableBill = async () => {
    const response = await apiRpc.pos.get_bill.$get({
      query: {
        businessId: businessId || "",
        tableName: selectedTable?.name || "",
        generatedBy: userData?.name || "",
      },
    });

    if (response.status === 400) {
      return Promise.reject({
        status: 400,
        message: "Server timeout occurred",
      });
    }
    if (response.status === 403 || response.status === 401) {
      setOpenErrorModal(true);
      setError("You are not authorized to perform this action");
      return;
    }

    const res = await response.json();
    const payment = res?.data as IBillData;
    return payment;
  };

  const { isLoading, data } = useQuery({
    queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
    queryFn: getTableBill,
    enabled: !!businessId && !!selectedTable && !!userData,
  });

  return {
    isLoading,
    data,
  };
};

export type DiscountType = "ON_BILL" | "ON_DISH";
export interface DiscountPayload {
  businessId: string;
  tableName: string;
  value: number;
  reasonOfDiscount: string;
  discountAppliedBy: string;
  discountAppliedOn: DiscountType;
  dishIds: string[];
}

export const useAddDiscount = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: addingDiscountLoader, mutateAsync: addingDiscount } =
    useMutation({
      mutationFn: async (payload: DiscountPayload) => {
        const response = await apiRpc.pos.add_discount.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues[0]?.message || "Failed to add discount",
          );
          setOpenErrorModal(true);
          toast.error("Failed to add discount");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Discount added successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error adding discount");
        setOpenErrorModal(true);
        toast.error("Error adding discount");
      },
    });

  return {
    addingDiscountLoader,
    addingDiscount,
  };
};

export interface RemoveDiscountPayload {
  businessId: string;
  tableName: string;
  discountRemovedBy: string;
}

export const useRemoveDiscount = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: removingDiscountLoader, mutateAsync: removingDiscount } =
    useMutation({
      mutationFn: async (payload: RemoveDiscountPayload) => {
        const response = await apiRpc.pos.remove_discount.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues[0]?.message || "Failed to remove discount",
          );
          setOpenErrorModal(true);
          toast.error("Failed to remove discount");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Discount removed successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing discount");
        setOpenErrorModal(true);
        toast.error("Error removing discount");
      },
    });

  return {
    removingDiscountLoader,
    removingDiscount,
  };
};

export interface AddCoinzPayload {
  businessId: string;
  tableName: string;
  value: number;
}

export const useAddCoinz = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: addingCoinzLoader, mutateAsync: addingCoinz } =
    useMutation({
      mutationFn: async (payload: AddCoinzPayload) => {
        const response = await apiRpc.pos.add_coins.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues[0]?.message || "Failed to add coinz",
          );
          setOpenErrorModal(true);
          toast.error("Failed to add coinz");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Coinz added successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error adding coinz");
        setOpenErrorModal(true);
        toast.error("Error adding coinz");
      },
    });

  return {
    addingCoinzLoader,
    addingCoinz,
  };
};

export interface RemoveCoinzPayload {
  businessId: string;
  tableName: string;
  coinzRemovedBy: string;
}

export const useRemoveCoinz = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: removingCoinzLoader, mutateAsync: removingCoinz } =
    useMutation({
      mutationFn: async (payload: RemoveCoinzPayload) => {
        const response = await apiRpc.pos.remove_coins.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues[0]?.message || "Failed to remove coinz",
          );
          setOpenErrorModal(true);
          toast.error("Failed to remove coinz");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Coinz removed successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing coinz");
        setOpenErrorModal(true);
        toast.error("Error removing coinz");
      },
    });

  return {
    removingCoinzLoader,
    removingCoinz,
  };
};

export interface AddCouponPayload {
  businessId: string;
  tableName: string;
  couponId: string;
}

export const useAddCoupon = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: addingCouponLoader, mutateAsync: addingCoupon } =
    useMutation({
      mutationFn: async (payload: AddCouponPayload) => {
        const response = await apiRpc.pos.add_coupon.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to add coupon");
          setOpenErrorModal(true);
          toast.error("Failed to add coupon");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Coupon added successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error adding coupon");
        setOpenErrorModal(true);
        toast.error("Error adding coupon");
      },
    });

  return {
    addingCouponLoader,
    addingCoupon,
  };
};

export interface RemoveCouponPayload {
  businessId: string;
  tableName: string;
}

export const useRemoveCoupon = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: removingCouponLoader, mutateAsync: removingCoupon } =
    useMutation({
      mutationFn: async (payload: RemoveCouponPayload) => {
        const response = await apiRpc.pos.remove_coupon.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(
            extraData.error?.issues[0]?.message || "Failed to remove coupon",
          );
          setOpenErrorModal(true);
          toast.error("Failed to remove coupon");
          return;
        }

        if (data.status === 200 || data.status === 201) {
          toast.success("Coupon removed successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
        }
      },
      onError: (err: any) => {
        setError(err?.message || "Error removing coupon");
        setOpenErrorModal(true);
        toast.error("Error removing coupon");
      },
    });

  return {
    removingCouponLoader,
    removingCoupon,
  };
};

export interface AddServiceChargePayload {
  businessId: string;
  tableName: string;
  serviceChargeAppliedBy: string;
}

export const useAddServiceCharge = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const {
    isPending: addingServiceChargeLoader,
    mutateAsync: addingServiceCharge,
  } = useMutation({
    mutationFn: async (payload: AddServiceChargePayload) => {
      const response = await apiRpc.pos.add_service_charge.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(
          extraData.error?.issues[0]?.message || "Failed to add service charge",
        );
        setOpenErrorModal(true);
        toast.error("Failed to add service charge");
        return;
      }

      if (data.status === 200 || data.status === 201) {
        toast.success("Service charge added successfully");
        queryClient.invalidateQueries({
          queryKey: ["getTableBill"],
        });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error adding service charge");
      setOpenErrorModal(true);
      toast.error("Error adding service charge");
    },
  });

  return {
    addingServiceChargeLoader,
    addingServiceCharge,
  };
};

export interface RemoveServiceChargePayload {
  businessId: string;
  tableName: string;
  serviceChargeRemovedBy: string;
  reasonOfServiceCharge: string;
}

export const useRemoveServiceCharge = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const {
    isPending: removingServiceChargeLoader,
    mutateAsync: removingServiceCharge,
  } = useMutation({
    mutationFn: async (payload: RemoveServiceChargePayload) => {
      const response = await apiRpc.pos.remove_service_charge.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(
          extraData.error?.issues[0]?.message ||
            "Failed to remove service charge",
        );
        setOpenErrorModal(true);
        toast.error("Failed to remove service charge");
        return;
      }

      if (data.status === 200 || data.status === 201) {
        toast.success("Service charge removed successfully");
        queryClient.invalidateQueries({
          queryKey: ["getTableBill"],
        });
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Error removing service charge");
      setOpenErrorModal(true);
      toast.error("Error removing service charge");
    },
  });

  return {
    removingServiceChargeLoader,
    removingServiceCharge,
  };
};

export interface SettleTypePayload {
  businessId: string;
  tableName: string;
}

export const useConfirmSettle = () => {
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isConfirming, mutateAsync: confirmSettle } = useMutation({
    mutationFn: async (payload: SettleTypePayload) => {
      const response = await apiRpc.pos.settle.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(
          extraData?.message || "Failed to confirm settle",
        );
        setOpenErrorModal(true);
        toast.error("Failed to confirm settle");
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Settle confirmed successfully");
        return;
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
  return {
    isPending: isConfirming,
    confirmSettle,
  };
};

export interface reprintPayload {
    businessId: string;
    tableName: string;
}

export const useReprintBill = () => {
    const { setError, setOpenErrorModal } = useError();
    const { isPending, mutateAsync } = useMutation({
        mutationFn: async (payload: reprintPayload) => {
            const response = await apiRpc.pos.re_print_bill.$post({
                json: payload,
            });
            return response;
        },
        onSuccess: async (data) => {
            const extraData = await data.json();
            if (data.status === 400 || data.status === 401) {
                setError(
                    extraData.error?.issues[0]?.message || "Failed to reprint bill",
                );
                setOpenErrorModal(true);
                toast.error("Failed to reprint bill");
                return;
            }
            if (data.status === 200 || data.status === 201) {
                toast.success("Bill reprinted successfully");
               
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || "Something went wrong.");
        },
    });
    return {
        isPrinting: isPending,
        reprintBill: mutateAsync,
    };
};