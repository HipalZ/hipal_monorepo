import { memo, useState } from "react";
import { CiGlobe } from "react-icons/ci";
import { useQuery } from "@tanstack/react-query";
import useTimings from "@/components/store/useTimings";
import type { ISalesLite } from "@/components/types/businessData";
import { timestampToDateTime } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import useBusinessData from "@/components/store/useBusinessData";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useUserToken } from "@hi/common/src/useUserToken";

const Overview = () => {
  const business = useBusinessData((s) => s.businessData);
  const [salesData, setSalesData] = useState<ISalesLite>();
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));
  const handleHistoryData = async () => {
    try {
      // Await the response directly and convert it to JSON in the next line.
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: business?._id,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: business?._id || "" },
      });
      const data = (await response.json()).data as ISalesLite;

      if (response.status === 200) {
        setSalesData(data);
        return data;
      }
      return {};
    } catch (err) {
      console.log(err);
      return {};
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["onlineAlerts", business?._id, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
  });

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className="payment_layout">
            <article className="card_payment_overview">
              <div className="sales_payment_background_effect1" />
              <div className="sales_payment_background_effect2" />
              <div className="sales_payment_background_effect3" />
              <center className="mt-4">
                {timestampToDateTime(timeStampStart)}
              </center>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[0.125rem] bg-white h-[50%] mt-10"></div>
              </div>
              <section>
                <h3 className="absolute left-4 bottom-14 opacity-60">
                  Today’s Sales
                </h3>
                <h1 className="absolute text-3xl left-4 bottom-6">
                  ₹ {salesData?.totalSale?.toLocaleString("en-IN") || 0}
                </h1>
              </section>
              <section>
                <h3 className="absolute right-4 bottom-14 opacity-60">
                  Total Discounts
                </h3>
                <h1 className="absolute text-3xl right-4 bottom-6">
                  ₹ {salesData?.totalDiscount?.toLocaleString("en-IN") || 0}
                </h1>
              </section>
            </article>
            <section className="flex gap-4 mx-4">
              <article className="online_card1">
                <div className="sales_payment_background_effect4"></div>
                <p className="flex">
                  <CiGlobe className="mr-2" />
                  <small>Online</small>
                </p>
                <h1 className="mt-6 text-2xl">
                  ₹ {salesData?.totalOnlineSale?.toLocaleString("en-IN") || 0}
                </h1>
              </article>

              <article className="online_card2">
                <div className="sales_payment_background_effect5"></div>
                <p className="flex">
                  <CiGlobe className="mr-2" />
                  <small>On floor</small>
                </p>
                <h1 className="mt-6 text-2xl">
                  ₹ {salesData?.totalOfflineSale?.toLocaleString("en-IN") || 0}
                </h1>
              </article>
            </section>
          </section>
          <section className="flex justify-between gap-4 mx-4 mt-6">
            <article className="w-full p-4 border border-[#00000050] rounded-xl">
              <b>
                {" "}
                OverAll <br />
                Coinz issued
              </b>
              <h6>₹ {salesData?.coinzIssued?.toLocaleString("en-IN") || 0}</h6>
            </article>
            <article className="w-full p-4 border border-[#00000050] rounded-xl">
              <b>
                {" "}
                OverAll
                <br />
                Coinz used
              </b>
              <h6>
                ₹ {salesData?.coinzRedeemed?.toLocaleString("en-IN") || 0}
              </h6>
            </article>
          </section>
        </>
      )}
    </>
  );
};

const MemoizedOverview = memo(Overview);

export default MemoizedOverview;
