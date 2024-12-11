import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import useTimings from "@/components/store/useTimings";
import type { ISalesLite } from "@/components/types/hiClientzData";
import { getDate, useErrorHandling } from "@/components/utils/helpers";
import { CiGlobe } from "react-icons/ci";
import { FaCoins, FaMoneyBillWave, FaPercent } from "react-icons/fa";
import DateRangePickerMemo from "../dateRangePicker";
import { apiRpc } from "@hi/common";

const SalesLite = () => {
  const { errorText } = useErrorHandling();
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const businessId = selectedBiz?.businessId?._id;
  const { salesData, setSalesData, setLoading } = useLiteStore((s) => ({
    salesData: s.salesData,
    setSalesData: s.setSalesData,
    setLoading: s.setLoading,
  }));
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));

  const handleSales = async () => {
    setLoading(true);
    const res = await apiRpc.payments[":id"].salesDashboard.$get({
      param: { id: businessId },
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    if (res.status === 401) {
      return errorText();
    }
    const response = (await res.json()).data as ISalesLite;
    if (res.status === 200) {
      setSalesData(response);
      setLoading(false);
      return response;
    }
    return {};
  };

  useQuery({
    queryKey: ["onlineAlerts", businessId, timeStampStart, timeStampEnd],
    queryFn: handleSales,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  });

  return (
    <div className="p-4 ">
      <div className="mx-auto max-w-7xl">
        <DateRangePickerMemo />
        <div className="mt-6 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#4E62FF] to-[#B494FF] rounded-xl text-white p-6 shadow-lg  w-full md:w-[92%] h-36 max-w-[30rem]">
            <div className="absolute text-sm transform -translate-x-1/2 opacity-75 top-4 left-1/2">
              {getDate(timeStampStart)}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-10"></div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div>
                <h3 className="text-sm opacity-75">Sales</h3>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl lg:text-4xl">
                  ₹ {salesData?.totalSale}
                </h1>
              </div>
              <div className="text-right">
                <h3 className="text-sm opacity-75">Total Discounts</h3>
                <h1 className="mt-1 text-2xl font-bold md:text-3xl lg:text-4xl">
                  ₹ {salesData?.totalDiscount}
                </h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SalesCard
              icon={<CiGlobe className="text-blue-500" />}
              title="Online"
              amount={salesData?.totalOnlineSale}
              bgColor="bg-blue-100"
            />
            <SalesCard
              icon={<FaMoneyBillWave className="text-green-500" />}
              title="On floor"
              amount={salesData?.totalOfflineSale}
              bgColor="bg-green-100"
            />
            <CoinzCard
              title="Coinz issued"
              amount={salesData?.coinzIssued}
              icon={<FaCoins className="text-yellow-500" />}
            />
            <CoinzCard
              title="Coinz used"
              amount={salesData?.coinzRedeemed}
              icon={<FaPercent className="text-purple-500" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesCard = ({ icon, title, amount, bgColor }) => (
  <div className={`rounded-xl p-6 shadow-md ${bgColor} h-full`}>
    <div className="flex items-center space-x-2 text-gray-600">
      {icon}
      <small>{title}</small>
    </div>
    <h1 className="mt-4 text-xl font-bold text-gray-800 sm:text-2xl">
      ₹ {amount}
    </h1>
  </div>
);

const CoinzCard = ({ title, amount, icon }) => (
  <div className="h-full p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
    <div className="flex items-center justify-between">
      <b className="text-gray-700">{title}</b>
      {icon}
    </div>
    <h6 className="mt-2 text-lg font-semibold text-gray-800 sm:text-xl">
      ₹ {amount}
    </h6>
  </div>
);

const SalesLiteMemo = memo(SalesLite);
export default SalesLiteMemo;
