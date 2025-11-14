// src/hooks/useTablesKotMutation.ts
import { useMutation } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useKotStore, type TableKot } from "@/components/store/useKotStore";

type Req = { tableIds: string[] };
type Res = TableKot[]; // matches your grouped-by-table response

export const useTablesKotMutation = () => {
  const { handleEnvelope } = useApiErrorHandler();
  const { setKotData } = useKotStore();

  return useMutation({
    mutationKey: ["tablesKot:post"],
    mutationFn: async (payload: Req) => {
      const res = await apiRpc.kot.tables_kot.$post({
        json: payload,
      });
      return handleEnvelope<Res>(res);
    },
    onSuccess: (data) => {
      setKotData(data);
    },
  });
};
