// src/hooks/useStaffPermissions.ts
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useStaffPermissionStore } from "@/components/store/usePermissions";

export interface StaffPermissionsMap {
  [key: string]: boolean;
}

export interface StaffInfo {
  name: string;
  phone: string;
  permissions: StaffPermissionsMap;
}

export const useStaffPermissions = (staffId?: string, businessId?: string) => {
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const setPermissions = useStaffPermissionStore((s) => s.setPermissions);
  return useQuery<StaffInfo>({
    queryKey: ["staffPermissions", staffId, businessId],
    enabled: Boolean(staffId && businessId),
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      const res = await apiRpc.users.fetch_staff[":staffId"][
        ":businessId"
      ].$get({
        param: {
          staffId: staffId as string,
          businessId: businessId as string,
        },
      });

      const data = (await handleEnvelope(res)) as StaffInfo;
      setPermissions(data.permissions);

      return data;
    },
  });
};
