"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRpc } from "@hi/common";
import SubscriptionEnded, { isSubscriptionEnded } from "../subscriptionEnded";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const excludedRouteKeys = new Set([
  "biz",
  "bluetick",
  "hipalzTerms",
  "not-allowed",
]);

type SubscriptionState = {
  blocked: boolean;
  businessName?: string;
};

const readBusinessKey = (pathname: string) => {
  const [, businessId] = pathname.split("/");
  return businessId || "";
};

export default function SubscriptionEndedGuard() {
  const pathname = usePathname();
  const businessKey = useMemo(() => readBusinessKey(pathname || ""), [pathname]);
  const [state, setState] = useState<SubscriptionState>({ blocked: false });

  useEffect(() => {
    let active = true;

    const checkSubscription = async () => {
      if (!businessKey || excludedRouteKeys.has(businessKey)) {
        setState({ blocked: false });
        return;
      }

      try {
        const response = objectIdRegex.test(businessKey)
          ? await apiRpc.businesses.get.Single[":businessId"].$get(
              {
                param: { businessId: businessKey },
              },
              {
                init: {
                  cache: "no-store",
                },
              },
            )
          : await apiRpc.businesses.n[":customLink"].$get(
              {
                param: { customLink: businessKey },
              },
              {
                init: {
                  cache: "no-store",
                },
              },
            );

        const result = (await response.json()) as {
          data?: {
            businessName?: string;
            name?: string;
            subscriptionEnded?: boolean | null;
          } | null;
        };
        const business = result.data;

        if (!active) return;

        setState({
          blocked: isSubscriptionEnded(business),
          businessName: business?.businessName || business?.name,
        });
      } catch {
        if (active) {
          setState({ blocked: false });
        }
      }
    };

    checkSubscription();

    return () => {
      active = false;
    };
  }, [businessKey]);

  if (!state.blocked) return null;

  return (
    <div className="fixed inset-0 z-[2147483647] bg-white">
      <SubscriptionEnded businessName={state.businessName} />
    </div>
  );
}
