import { memo } from "react";
import CouponListAnalytics from "./couponListAnalytics";
import { useAnalyticsDashBoard } from "@/hooks/useCoupon";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const MemoCouponAnalytics = () => {
  const { analytics, isLoading } = useAnalyticsDashBoard();

  const isEmptyAnalytics = analytics && Object.keys(analytics).length === 0;

  if (isEmptyAnalytics) {
    return (
      <section className="">
        <h2 className="ml-4 font-semibold opacity-50">Coupon Analytics</h2>
        <p className="mt-4 ml-4 text-sm text-gray-500">
          No analytics data available.
        </p>
      </section>
    );
  }

  return (
    <section className="">
      <h2 className="ml-4 font-semibold opacity-50">Coupon Analytics</h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <section className="business_system_cards !mt-4 !gap-2 !pb-2">
          {Object.keys(analytics).map((key, index) => {
            return (
              <center
                key={index}
                className="rounded-2xl bg-[#FFFFFF] p-2 py-6 capitalize text-[#6F649B]"
              >
                <h3 className="text-sm">{key?.split(/(?=[A-Z])/).join(" ")}</h3>
                <p className="mt-2 text-xl font-semibold text-black truncate">
                  {analytics?.[key]}
                </p>
              </center>
            );
          })}
        </section>
      )}

      <CouponListAnalytics />
    </section>
  );
};

const CouponAnalytics = memo(MemoCouponAnalytics);

export default CouponAnalytics;
