//@ts-nocheck
"use client"
import { FLOW, FLOW_TYPES, PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { useCallback, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { _useAllBusiness } from "./useAllBusiness";
import useBusinessDetails from "./useBusinessDetails";

function useRoutingFlow() {
  const pathname = usePathname();
  const customLink = useBusinessDetails((s) => s.businessDetails?.customLink);
  const { dishId } = useParams<{ customLink: string, dishId: string }>();
  const businessData = _useAllBusiness((s) => s.data);

  /**
   * Get business flow type from the api's store
   * @returns {string} flow type
   */
  const businessFlowType = useMemo(() => {
    return FLOW_TYPES.DEFAULT;
  }, [businessData?.settings?.navigation?.to]);

  /**
   * Get current path key from the router
   * @returns {string} path key
   */
  const pathKey = useMemo(() => {
    const currentPath = pathname;

    for (const key in routePaths) {
      if (routePaths[key](customLink, dishId) === currentPath) return key;
    }

    return PAGE_TYPES.EXPLORER;
  }, [customLink, pathname, dishId]);

  const getNextPath = useCallback(
    (dishIdOrCategoryId?: string) =>
      `${FLOW[businessFlowType][pathKey]?.to(customLink, dishIdOrCategoryId)}`,
    [businessFlowType, customLink, pathKey]
  );

  const getPreviousPath = useCallback(
    (dishIdOrCategoryId?: string) =>
      `${FLOW[businessFlowType][pathKey]?.from(customLink, dishIdOrCategoryId)}`,
    [businessFlowType, customLink, pathKey]
  );

  return { getNextPath, getPreviousPath };
}

export { useRoutingFlow };
