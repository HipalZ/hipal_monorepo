import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import useBusinessData from "../store/useBusinessData";
import type { TableData } from "../store/useZonesAndTable";
import { useNavigate } from "react-router-dom";
import { useOrderStore } from "../store/useOrderData";
import { useHiClientZ } from "../store/useHiClientzData";
import toast from "react-hot-toast";

export interface ITransferPayload {
  businessId: string;
  transferBy: string;
  transferType: "TABLE" | "ITEM";
  fromTableId: string;
  toTableId: string;
  itemIds?: string[];
}

export const useTableData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const outletInfo = useBusinessData((s) => s.outletInfo);

  const getAllTables = async (): Promise<TableData[]> => {
    const response = await apiRpc.table.empty_table[":businessId"].$get({
      param: {
        businessId: outletInfo?.businessId,
      },
    });
    const res = await response.json();
    return res?.data || [];
  };

  const { isLoading, data } = useQuery({
    queryKey: ["getAllTables", outletInfo?.businessId],
    queryFn: getAllTables,
    enabled: !!outletInfo?.businessId,
  });

  const filteredTables = useMemo(
    () =>
      data?.filter((t) =>
        t?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || [],
    [data, searchTerm],
  );

  return {
    isLoading,
    filteredTables,
    searchTerm,
    setSearchTerm,
  };
};

export const useTableTransfer = (businessId: string) => {
  const navigate = useNavigate();
  const [toTable, setToTable] = useState<TableData | null>(null);
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
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Table transferred successfully");
      closeTransferModal();
      setOpenOrderModal(false);
      navigate(`/${businessId}/alerts`);
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
