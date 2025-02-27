import BottomSection from "./bottomSection";
import CouponInfoTopSection from "./couponInfoTopSection";
import SummarySection from "./summarySection";

import useCouponsStore from "@/components/store/useCouponsStore";
import { useIndividualCouponAnalytics } from "@/hooks/useCoupon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import CouponChannelDetails from "./couponChannelDetails";
import BottomButton from "@/components/atom/bottomButton";
import { useCallback } from "react";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import useTimings from "@/components/store/useTimings";

const CouponAnalyticsInfo = () => {
  const { setSelectedPage } = useCouponsStore((s) => ({
    setSelectedPage: s.setSelectedPage,
  }));
  const goToLinkChannels = useCallback(() => {
    setSelectedPage("LINK_CHANNELS");
  }, []);

  const {
    timeStampEnd
  } = useTimings((s) => ({
    timeStampEnd: s.timeStampEnd,
  }));

  const { analytics, isLoading } = useIndividualCouponAnalytics(timeStampEnd);

  return (
    <div className="pb-[7rem]">
      <section className="flex flex-col justify-center gap-6 space-y-4 lg:mx-6 lg:space-y-0 lg:flex-row md:items-center lg:items-start">
        <section className="flex-1">
          <CouponInfoTopSection />
          <DateRangePicker />
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
      <BottomButton
        fixed
        buttons={[
          {
            text: "Link Channels",
            onClick: goToLinkChannels,
          },
        ]}
      />
    </div>
  );
};

export default CouponAnalyticsInfo;
