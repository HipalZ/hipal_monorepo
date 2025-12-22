import { apiRpc } from "@hi/common";
import {
  type QueryObserverResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useError } from "../store/useError.ts";
import { useHiClientZ } from "../store/useHiClientzData.ts";
import { useOrderStore } from "../store/useOrderData.ts";
import type { ApiResponse } from "../types/api.types.ts";
import type { IBillData } from "../types/hiClientzData.ts";
import type {
  ItemWiseSplitPayload,
  SplitBillPayload,
} from "../types/split.types.ts";

type BillResponse = IBillData | IBillData[] | undefined;

export type UseGetBillResult = UseQueryResult<BillResponse, unknown> & {
  getBillCall: () => Promise<QueryObserverResult<BillResponse, unknown>>;
};

export const useGetBill = (): UseGetBillResult => {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const { setError, setOpenErrorModal } = useError();

  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setIsBillSplit = useOrderStore((s) => s.setIsBillSplit);
  const isBillSplit = useOrderStore((s) => s.isBillSplit);

  const userData = useHiClientZ((s) => s.captainData);

  const getTableBill = async (): Promise<BillResponse> => {
    // Guard at runtime as well (enabled flag also prevents fetch)
    if (!businessId || !selectedTable?.name || !userData?.name)
      return undefined;

    const response = await apiRpc.pos.get_bill.$get({
      query: {
        businessId,
        tableName: selectedTable.name,
        generatedBy: userData.name,
      },
    });
    console.log("response", response);

    if (response.status === 401 || response.status === 403) {
      setOpenErrorModal(true);
      setError("You are not authorized to perform this action");
      return {};
    }

    if (response.status === 400 || response.status === 404) {
      // If user was in split-bill flow but bill no longer available, route back to alerts
      if (isBillSplit) {
        navigate(`/${businessId}/alerts`);
      }
      return {};
    }

    const res = await response.json();
    const payment = res?.data as IBillData | IBillData[] | undefined;

    // If non-array empty object → treat as no bill & route to alerts
    if (
      !Array.isArray(payment) &&
      payment &&
      Object.keys(payment).length === 0
    ) {
      navigate(`/${businessId}/alerts`);
      return payment; // empty object returned (keeps type soundness)
    }

    // Track split state
    const split = Array.isArray(payment);
    setIsBillSplit(split);

    return payment;
  };

  const query = useQuery<BillResponse, unknown>({
    queryKey: ["getTableBill", businessId, selectedTable?.name, userData?.name],
    queryFn: getTableBill,
    enabled: Boolean(
      businessId && selectedTable && selectedTable.active && userData,
    ),
  });

  return {
    ...query,
    getBillCall: query.refetch,
  };
};

export const useGetBillWithTableName = () => {
  const { businessId } = useParams();
  const userData = useHiClientZ((s) => s.captainData);
  const { isPending: isBillPending, mutateAsync } = useMutation({
    mutationFn: async (tableName: string) => {
      const response = await apiRpc.pos.get_bill.$get({
        query: {
          businessId,
          tableName: tableName,
          generatedBy: userData.name,
        },
      });
      const res = await response.json();
      const payment = res?.data as IBillData | IBillData[] | undefined;
      return payment;
    },
  });

  return {
    isBillPending,
    mutateAsync: mutateAsync,
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
