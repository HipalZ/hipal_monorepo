import { apiRpc } from "@hi/common";
import type { IBillData } from "../types/hiClientzData.ts";
import { useError } from "../store/useError.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useOrderStore } from "../store/useOrderData.ts";
import { useHiClientZ } from "../store/useHiClientzData.ts";
import toast from "react-hot-toast";
import {
  ApiResponse,
  SplitBillPayload,
  ItemWiseSplitPayload,
} from "../types/api.types.ts";

export const useGetBill = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { setError, setOpenErrorModal } = useError();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setIsBillSplit = useOrderStore((s) => s.setIsBillSplit);
  const { captainData: userData } = useHiClientZ();

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
    const payment = res?.data as IBillData | IBillData[];

    // 1. If it's a non-array and has no keys → empty object
    if (!Array.isArray(payment) && Object.keys(payment).length === 0) {
      navigate(`/${businessId}/alerts`);
      return payment;
    }

    // 2. Otherwise, handle split vs. single as before
    const isSplit = Array.isArray(payment);
    setIsBillSplit(isSplit);

    return payment;
  };

  const {
    isLoading,
    data,
    refetch: getBillCall,
  } = useQuery({
    queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
    queryFn: getTableBill,
    enabled: !!businessId && !!selectedTable && !!userData,
  });

  return {
    isLoading,
    data,
    getBillCall,
  };
};

export const useSplitBill = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: isSplitting, mutateAsync: splitBill } = useMutation({
    mutationFn: async (payload: SplitBillPayload) => {
      const response = await apiRpc.split_bill.portion_and_percentage.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to split bill");
        setOpenErrorModal(true);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Bill split successfully");
        queryClient.invalidateQueries({
          queryKey: ["getTableBill"],
        });
        return;
      }
    },
    onError: (error: any) => {
      setError(error.message || "Something went wrong.");
      setOpenErrorModal(true);
    },
  });

  return {
    isSplitting,
    splitBill,
  };
};

export interface ClubBillPayload {
  businessId: string;
  tableName: string;
}

export const useClubBill = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const { isPending: isClubbing, mutateAsync: clubBill } = useMutation({
    mutationFn: async (payload: ClubBillPayload) => {
      const response = await apiRpc.split_bill.club_bill.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: async (data) => {
      const extraData: ApiResponse = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData.message || "Failed to club bill");
        setOpenErrorModal(true);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        queryClient.invalidateQueries({
          queryKey: ["getTableBill"],
        });
        toast.success("Bill clubbed successfully");
        return;
      }
    },
    onError: (error: any) => {
      setError(error.message || "Something went wrong.");
      setOpenErrorModal(true);
    },
  });
  return { isClubbing, clubBill };
};

export const useItemWiseSplit = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();

  const { isPending: isSplittingItems, mutateAsync: splitBillByItems } =
    useMutation({
      mutationFn: async (payload: ItemWiseSplitPayload) => {
        const response = await apiRpc.split_bill.item.$post({
          json: payload,
        });
        return response;
      },
      onSuccess: async (data) => {
        const extraData: ApiResponse = await data.json();
        if (data.status === 400 || data.status === 401) {
          setError(extraData.message || "Failed to split bill by items");
          setOpenErrorModal(true);
          return;
        }
        if (data.status === 200 || data.status === 201) {
          toast.success("Bill split by items successfully");
          queryClient.invalidateQueries({
            queryKey: ["getTableBill"],
          });
          return;
        }
      },
      onError: (error: any) => {
        setError(error.message || "Something went wrong.");
        setOpenErrorModal(true);
      },
    });

  return {
    isSplittingItems,
    splitBillByItems,
  };
};
