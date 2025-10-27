import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import toast from "react-hot-toast";
import { useError } from "@/components/store/useError";

type UpdateKotPriorityPayload = {
  kotId: string;
};

type UseKotPriorityOptions = {
  invalidateKeys?: Array<unknown[]>;
};

export const useKotPriority = (options: UseKotPriorityOptions = {}) => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { mutateAsync: setPriority, isPending: isPrioritizing } = useMutation({
    mutationFn: async (payload: UpdateKotPriorityPayload) => {
      const res = await apiRpc.kot.priority.$put({ json: payload });
      return res;
    },
    onSuccess: async (res) => {
      const json = await res.json();

      if (
        res.status === 400 ||
        res.status === 401 ||
        res.status === 409 ||
        res.status === 422
      ) {
        const msg = json?.message || "Failed to update KOT priority";
        setError(msg);
        setOpenErrorModal(true);
        return;
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(json?.message || "KOT moved to priority");
        // invalidate any provided queries
        options.invalidateKeys?.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
        return;
      }
    },
    onError: (err: any) => {
      setError(
        err?.message || "Something went wrong while updating KOT priority.",
      );
      setOpenErrorModal(true);
    },
  });

  return { setPriority, isPrioritizing };
};

type ItemStatus = "IN_PROGRESS" | "COOKED" | "DELIVERED" | "CANCELLED";

type SetItemStatusPayload = {
  itemIds: string[];
  itemStatus: ItemStatus;
  staffId: string;
};

export const useKotItemStatus = ({
  invalidateKeys,
}: {
  invalidateKeys?: QueryKey[];
} = {}) => {
  const queryClient = useQueryClient();
  const { setError, setOpenErrorModal } = useError();

  const { isPending: isUpdating, mutateAsync: setItemStatus } = useMutation({
    mutationFn: async (payload: SetItemStatusPayload) => {
      const res = await apiRpc.kot.item_status.$put({ json: payload });
      return res;
    },
    onSuccess: async (res) => {
      const json = await res.json();

      if ([400, 401, 409, 422].includes(res.status)) {
        const msg = json?.message || "Failed to update item status";
        setError(msg);
        setOpenErrorModal(true);
        return;
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(json?.message || "Item status updated");
        // Invalidate any provided keys (orders list, table order etc.)
        if (invalidateKeys) {
          await Promise.all(
            invalidateKeys.map((key) =>
              queryClient.invalidateQueries({ queryKey: key }),
            ),
          );
        }
      }
    },
    onError: (err: any) => {
      setError(
        err?.message || "Something went wrong while updating item status.",
      );
      setOpenErrorModal(true);
    },
  });

  return { isUpdating, setItemStatus };
};
