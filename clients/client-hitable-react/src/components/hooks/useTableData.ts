import { apiRpc } from "@hi/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { IMode } from "../atoms/placeOrders/normalsettle";
import useBusinessData from "../store/useBusinessData";
import { useHiClientZ } from "../store/useHiClientzData";
import { useOrderStore } from "../store/useOrderData";
import type { TableData } from "../store/useZonesAndTable";
import { useError } from "../store/useError";

export interface ITransferPayload {
  businessId: string;
  transferBy: string;
  transferType: "TABLE" | "ITEM";
  fromTableId: string;
  toTableId: string;
  itemIds?: string[];
}

type UseTableDataOptions = {
  enabled?: boolean;
  businessIdOverride?: string | null;
  staleTimeMs?: number;
};

export const useTableData = (opts: UseTableDataOptions = {}) => {
  const {
    enabled = false,
    businessIdOverride = null,
    staleTimeMs = 10_000,
  } = opts;

  const [searchTerm, setSearchTerm] = useState("");
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const businessId = businessIdOverride ?? outletInfo?.businessId ?? null;

  const getAllTables = async (): Promise<TableData[]> => {
    const response = await apiRpc.table.empty_table[":businessId"].$get({
      param: { businessId: businessId as string },
    });
    const res = await response.json();
    return res?.data || [];
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["getAllTables", businessId],
    queryFn: getAllTables,
    enabled: !!businessId && enabled,
    staleTime: staleTimeMs,
  });

  const filteredTables = useMemo(
    () =>
      (data || []).filter((t) =>
        (t?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [data, searchTerm],
  );

  const fetchNow = useCallback(() => {
    if (businessId) return refetch();
  }, [refetch, businessId]);

  return {
    // data
    filteredTables,
    raw: data || [],
    // search
    searchTerm,
    setSearchTerm,
    // network state
    isLoading,
    isFetching,
    // manual trigger
    fetchNow,
  };
};

export const useTableTransfer = (businessId: string) => {
  const navigate = useNavigate();
  const [toTable, setToTable] = useState<TableData | null>(null);
  const { setError, setOpenErrorModal } = useError();
  const [isConfirming, setIsConfirming] = useState(false);
  const {
    selectedTable,
    setTransferModal,
    setTransferTable,
    setOpenOrderModal,
    selectedItems,
    setSelectedItems,
    transferTable,
  } = useOrderStore();
  const captainData = useHiClientZ((s) => s.captainData);

  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: ITransferPayload) => {
      const response = await apiRpc.table.transfer_table.$post({
        json: payload,
      });
      return response;
    },
    onSuccess: (data) => {
      if (!data?.ok) {
        setOpenErrorModal(true);
        setError("Bill already fetched");
      }
      if (data?.ok) {
        toast.success("Transferred successfully");
        closeTransferModal();
        setOpenOrderModal(false);
        navigate(`/${businessId}/alerts`);
      }
    },
    onError: () => {
      toast.error("Failed to transfer table");
    },
  });

  const closeTransferModal = () => {
    setTransferModal(false);
    setTransferTable("");
    setToTable(null);
    setSelectedItems([]);
    setIsConfirming(false);
  };

  const confirmTransfer = async () => {
    if (!toTable) {
      return toast.error("Please select a table to transfer");
    }
    if (transferTable === "TABLE" && toTable && selectedTable) {
      const payload: ITransferPayload = {
        businessId: businessId,
        transferBy: captainData._id || "",
        transferType: transferTable?.toUpperCase() as "TABLE",
        fromTableId: selectedTable?._id,
        toTableId: toTable?._id,
      };
      await mutateAsync(payload);
    }
    if (transferTable === "ITEM" && toTable && selectedTable) {
      const payload: ITransferPayload = {
        businessId: businessId,
        transferBy: captainData._id || "",
        transferType: transferTable?.toUpperCase() as "ITEM",
        fromTableId: selectedTable._id,
        toTableId: toTable?._id || "",
        itemIds: selectedItems,
      };
      await mutateAsync(payload);
    }
  };

  return {
    toTable,
    setToTable,
    isConfirming,
    setIsConfirming,
    isPending,
    closeTransferModal,
    confirmTransfer,
  };
};

export const useGetAllModes = (
  businessId: string,
  showPaymentMode: boolean,
) => {
  const { isLoading, data: paymentMode } = useQuery({
    queryKey: ["getAllModes"],
    queryFn: async () => {
      const response = await apiRpc.upi_mode.all[":businessId"].$get({
        param: {
          businessId: businessId || "",
        },
      });
      const res = await response.json();
      return (res?.data as IMode[]) || [];
    },
    enabled: !!businessId && !!showPaymentMode,
    staleTime: 1000 * 60,
  });

  return {
    isLoading,
    paymentMode,
  };
};

export const useCheckLoyalty = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const checkLoyalty = async () => {
    const response = await apiRpc.businesses[":businessId"].loyalty.$get({
      param: {
        businessId,
      },
    });
    const res = await response.json();
    return res?.data || false;
  };

  const { isLoading, data: loyaltyData } = useQuery({
    queryKey: ["checkLoyalty", businessId],
    queryFn: checkLoyalty,
    enabled: !!businessId,
  });

  return {
    isLoading,
    loyaltyData,
  };
};

export const useCustomerLogin = () => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [customerName, setCustomerName] = useState<string>("");

  const customerLogin = async (phone: string) => {
    const response = await apiRpc.users.resendOtp.$post({ json: { phone } });
    const res = await response.json();

    if (!response.ok) {
      throw new Error("Failed to send OTP");
    }

    if (response.status === 400) return toast.error("Invalid phone number");
    if (response.status === 200) toast.success("check your phone for OTP");

    if (res?.data?.name) setCustomerName(res?.data.name);
    return { ...res, phone };
  };

  const customerVerify = async ({
    phone,
    otp,
  }: {
    phone: string;
    otp?: string;
  }) => {
    const response = await apiRpc.loyalty.verify_otp.$post({
      json: {
        phone,
        otp,
        businessId,
        ...(customerName && { name: customerName }),
      },
    });

    const res = await response.json();

    if (!response.ok) {
      throw new Error("OTP verification failed");
    }

    return res;
  };

  const { mutateAsync: sendOtp } = useMutation({
    mutationFn: customerLogin,
    onError: (err: any) => toast.error(err.message || "Failed to send OTP"),
  });

  const { mutateAsync: verifyOtp } = useMutation({
    mutationFn: customerVerify,
  });

  return { sendOtp, verifyOtp };
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  const updateBill = async (data) => {
    const { coinz, couponId, tableName, total, businessId, userId } = data;
    const response = await apiRpc.payments.fetch_update_bill[
      ":businessId"
    ].$post({
      param: {
        businessId,
      },
      json: {
        tableName: tableName,
        total: total,
        ...(coinz && { claimedCoins: coinz }),
        ...(coinz === 0 && { removeCoins: true }),
        ...(couponId && { couponId }),
        ...(userId && { userId }),
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      toast.success("Bill updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["getTableBill"],
      });
    }
    return res;
  };

  return { updateBill };
};
