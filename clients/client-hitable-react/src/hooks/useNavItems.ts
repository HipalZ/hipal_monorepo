import { useStaffPermissionStore } from "@/components/store/usePermissions";
import type { NavItemTypes } from "@/components/types/hiClientzData";
import { createNavItems } from "@/components/utils/helpers";
import { useMemo } from "react";
import type { IconType } from "react-icons";

export function useNavItems(isPos: boolean): Array<{
  type: NavItemTypes;
  icon: IconType;
}> {
  const canViewSales = useStaffPermissionStore(
    (s) => s.permissions?.sale_summary ?? false,
  );

  return useMemo(
    () => createNavItems(isPos, canViewSales),
    [isPos, canViewSales],
  );
}

export default useNavItems;
