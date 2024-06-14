"use client"
import { FLOW, FLOW_TYPES, PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { isEmpty } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { _useAllBusiness } from "./useAllBusiness";

function useRoutingFlow() {
  const pathname = usePathname();
  const {businessId, dishId} = useParams<{ businessId: string, dishId: string }>();
  const businessData = _useAllBusiness((s) => s.data);

  /**
   * Get business flow type from the api's store
   * @returns {string} flow type
   */
  const businessFlowType = useMemo(() => {
    if (isEmpty(businessData?.settings?.navigation?.to)) return FLOW_TYPES.DEFAULT;

    const _flowType = businessData?.settings?.navigation?.to?.toLowerCase();
    for (const type in FLOW_TYPES)
      if (FLOW_TYPES[type].toLowerCase() === _flowType) return FLOW_TYPES[type];

    return FLOW_TYPES.DEFAULT;
  }, [businessData?.settings?.navigation?.to]);

  /**
   * Get current path key from the router
   * @returns {string} path key
   */
  const pathKey = useMemo(() => {
    const currentPath = pathname;

    for (const key in routePaths) {
      if (routePaths[key](businessId, dishId) === currentPath) return key;
    }

    return PAGE_TYPES.EXPLORER;
  }, [businessId, pathname, dishId]);

  const getNextPath = useCallback(
    (dishIdOrCategoryId?: string) =>
      `${FLOW[businessFlowType][pathKey]?.to(businessId, dishIdOrCategoryId)}`,
    [businessFlowType, businessId, pathKey]
  );

  const getPreviousPath = useCallback(
    (dishIdOrCategoryId?: string) =>
      `${FLOW[businessFlowType][pathKey]?.from(businessId, dishIdOrCategoryId)}`,
    [businessFlowType, businessId, pathKey]
  );

  return { getNextPath, getPreviousPath };
}

export { useRoutingFlow };
