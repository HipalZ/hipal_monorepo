import AnalyticsDatePicker from "./analyticsDatePicker";
import BottomSection from "./bottomSection";
import CouponInfoTopSection from "./couponInfoTopSection";
import SummarySection from "./summarySection";

import useCouponsStore from "@/components/store/useCouponsStore";
import { useIndividualCouponAnalytics } from "@/hooks/useCoupon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import CouponChannelDetails from "./couponChannelDetails";

const CouponAnalyticsInfo = () => {
  const { couponEndDate } = useCouponsStore();
  const { analytics, isLoading } = useIndividualCouponAnalytics(couponEndDate);

  return (
    <div className="pb-[7rem]">
      <section className="flex flex-col justify-center gap-6 space-y-4 lg:mx-6 lg:space-y-0 lg:flex-row md:items-center lg:items-start">
        <section className="flex-1">
          <CouponInfoTopSection />
          <AnalyticsDatePicker />
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <SummarySection analytics={analytics} />
          )}
        </section>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <BottomSection analytics={analytics} />
        )}
      </section>
      <CouponChannelDetails />
    </div>
  );
};

export default CouponAnalyticsInfo;
