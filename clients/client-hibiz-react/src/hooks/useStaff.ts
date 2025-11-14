import type { UserProfile } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import useZoneStore from "@/components/store/useZone";

// src/hooks/useStaffSave.ts
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import useBusinessData from "@/components/store/useBusinessData";

export const useGetAllStaff = (businessId: string) => {
  const { setAllStaff } = useZoneStore();
  const getStaff = async () => {
    const res = await apiRpc.users[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });

    const response = (await res.json()).data as UserProfile[];
    if (res.status === 200 || res.status === 201) {
      setAllStaff(response);
    }
    return response;
  };

  const { data: rawStaffDetails, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["getStaffs", businessId],
    queryFn: getStaff,
    enabled: !!businessId,
  });

  return { rawStaffDetails, isLoadingStaff };
};

type SaveMode = "add" | "edit";

interface SaveStaffPayload {
  mode: SaveMode;
  userId?: string;
  data: {
    name: string;
    phone: string;
    password?: string;
    role:
      | "CO_OWNER"
      | "MANAGER"
      | "CAPTAIN"
      | "MARKETING_AGENT"
      | "OWNER"
      | "HIPAL_ADMIN"
      | "HIPAL_CUSTOMER";
    permissionIds: string[];
  };
}

export const useStaffSave = () => {
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const businessData = useBusinessData((s) => s.businessData);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ mode, userId, data }: SaveStaffPayload) => {
      if (!businessData?._id) {
        throw new Error("Business not found");
      }

      let res: Response;

      if (mode === "edit") {
        if (!userId) {
          throw new Error("userId is required for edit");
        }

        // EDIT STAFF: use your staff update API
        res = await apiRpc.users[":staffId"].staff.$put({
          param: { staffId: userId },
          json: {
            businessId: businessData._id,
            role: data.role,
            permissionIds: data.permissionIds,
          },
        });
      } else {
        // ADD STAFF: use addStaff API
        res = await apiRpc.users.addStaff.$post({
          json: {
            businessId: businessData._id,
            name: data.name,
            phone: data.phone,
            role: data.role,
            permissionIds: data.permissionIds,
            ...(data.password ? { password: data.password } : {}),
          },
        });
      }

      await handleEnvelope(res);

      return res;
    },
    onSuccess: (_, variables) => {
      // refetch staff list
      queryClient.invalidateQueries({
        queryKey: ["getStaffs", businessData?._id],
      });
    },
  });

  const saveStaff = useCallback(
    (payload: SaveStaffPayload) => mutation.mutateAsync(payload),
    [mutation],
  );

  return {
    saveStaff,
    isSaving: mutation.isPending,
  };
};
