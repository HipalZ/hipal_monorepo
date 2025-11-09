import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { useError } from "@/components/store/useError"; // same pattern as your SplitBill hook
import useBusinessData from "../store/useBusinessData";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import { useCart } from "../store/useCart";
import { useOrderStore } from "../store/useOrderData";

export interface MergeTablesPayload {
  fromTableIds: string[];
  toTableId: string;
  staffId: string;
}

export const useMergeTables = () => {
  const { setError, setOpenErrorModal } = useError();
  const queryClient = useQueryClient();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const navigate = useNavigate();
  const setIsPlacingNewOrder = useCart((s) => s.setIsPlacingNewOrder);
  const setModalType = useOrderStore((s) => s.setModalType);

  const isMobile = useIsMobile();

  const { isPending: isMerging, mutateAsync: mergeTables } = useMutation({
    mutationFn: async (payload: MergeTablesPayload) => {
      const res = await apiRpc.table.merge.$post({ json: payload });
      return res;
    },
    onSuccess: async (res, variables) => {
      const json = await res.json();
      if (
        res.status === 400 ||
        res.status === 401 ||
        res.status === 409 ||
        res.status === 422
      ) {
        const msg = json?.message || "Failed to merge tables";
        setError(msg);
        setOpenErrorModal(true);
        return;
      }
      if (res.status === 200 || res.status === 201) {
        toast.success(json?.message || "Tables merged successfully");
        if (isMobile) {
          setModalType("addItem");
          setIsPlacingNewOrder(true);
        }
        queryClient.invalidateQueries({
          queryKey: ["fetchIndividualTable", variables.toTableId],
        });
        navigate(`/${businessId}/alerts/${variables.toTableId}`);
        return;
      }
    },
    onError: (err: any) => {
      setError(err?.message || "Something went wrong while merging.");
      setOpenErrorModal(true);
    },
  });

  return { isMerging, mergeTables };
};
