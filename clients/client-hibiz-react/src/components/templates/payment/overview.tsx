import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useTimings from "@/components/store/useTimings";
import { apiRpc } from "@hi/common";
import useBusinessData from "@/components/store/useBusinessData";
import { InfoCard } from "./InfoCard";
import { PieChart } from "./PieCharts";
import { motion } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  Gift,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { BarChart } from "./BarChart";

export interface SalesData {
  overAllAmount: number;
  onlineSale: Record<string, number>;
  offlineSale: Record<string, number>;
  totalOrders: number;
  totalActiveTableValue: number;
}

interface OtherAndWarningData {
  otherSale: {
    totalTax: number;
    totalTip: number;
    totalServiceCharge: number;
  };
  warningSale: {
    totalForceSettle: number;
    totalFreeSettle: number;
  };
}

interface SalesExceptionData {
  exceptionSale: {
    totalDuesReceived: number;
    totalDuesGiven: number;
    totalNpc: number;
    totalComplementary: number;
    totalDiscount: number;
  };
  rewardSale: {
    totalCoinsGiven: number;
    totalCoinUsed: number;
    totalCouponUsed: number;
  };
}

const Overview = () => {
  const business = useBusinessData((s) => s.businessData);
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));

  const handleHistoryData = async (): Promise<SalesData> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: business?._id,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: business?._id || "" },
      });
      const data = (await response.json()).data as SalesData;
      if (response.status === 200) {
        return data;
      }
      throw new Error("Failed to fetch sales data");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const otherAndWarning = async (): Promise<OtherAndWarningData> => {
    const response = await apiRpc.payments.sale.other_and_warnings.$get({
      query: {
        businessId: business?._id,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    const data = (await response.json()).data as OtherAndWarningData;
    return data;
  };

  const salesException = async (): Promise<SalesExceptionData> => {
    const response = await apiRpc.payments.sale.exception_and_rewards.$get({
      query: {
        businessId: business?._id,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    const data = (await response.json()).data as SalesExceptionData;
    return data;
  };

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ["salesData", business?._id, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
  });

  const { data: otherData } = useQuery<OtherAndWarningData, Error>({
    queryKey: ["otherAndWarning", business?._id, timeStampStart, timeStampEnd],
    queryFn: otherAndWarning,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
  });

  const { data: salesExceptionData } = useQuery<SalesExceptionData, Error>({
    queryKey: ["salesException", business?._id, timeStampStart, timeStampEnd],
    queryFn: salesException,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
  });

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error || !salesData) {
    return (
      <Card className="w-full h-[70vh] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground">
            No sales data found
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalOfflineSale = Object.values(salesData.offlineSale).reduce(
    (acc, curr) => acc + curr,
    0,
  );

  const totalExceptionAndReward = salesExceptionData
    ? salesExceptionData.exceptionSale.totalComplementary +
      salesExceptionData.exceptionSale.totalDiscount +
      salesExceptionData.rewardSale.totalCoinsGiven +
      salesExceptionData.rewardSale.totalCoinsUsed +
      salesExceptionData.rewardSale.totalCouponDiscount
    : 0;

  const totalOtherAndWarning = otherData
    ? otherData.otherSale.totalTax +
      otherData.otherSale.totalTip +
      otherData.otherSale.totalServiceCharge
    : 0;

  // Create breakdown data
  const totalSalesBreakdown = [
    { label: "Hipalz Razorpay Sales", value: salesData.onlineSale.online },
    { label: "Pay To Captain Sales", value: totalOfflineSale },
  ];

  const onlineSalesBreakdown = [
    { label: "Online Payment", value: salesData.onlineSale.online },
  ];

  const offlineSalesBreakdown = Object.entries(salesData.offlineSale).map(
    ([method, amount]) => ({
      label: method.charAt(0).toUpperCase() + method.slice(1),
      value: amount,
    }),
  );

  const loyaltyRewardsBreakdown = salesExceptionData
    ? [
        {
          label: "Total Complementary",
          value: salesExceptionData.exceptionSale.totalComplementary,
        },
        {
          label: "Total Discount",
          value: salesExceptionData.exceptionSale.totalDiscount,
        },
        {
          label: "Total Coins Given",
          value: salesExceptionData.rewardSale.totalCoinsGiven,
        },
        {
          label: "Total Coins Used",
          value: salesExceptionData.rewardSale.totalCoinsUsed,
        },
        {
          label: "Total Coupon Discount",
          value: salesExceptionData.rewardSale.totalCouponDiscount,
        },
      ]
    : [];

  const taxesServiceBreakdown = otherData
    ? [
        { label: "Total Tax", value: otherData.otherSale.totalTax },
        { label: "Total Tip", value: otherData.otherSale.totalTip },
        {
          label: "Total Service Charge",
          value: otherData.otherSale.totalServiceCharge,
        },
      ]
    : [];

  return (
    <div className="container mx-auto">
      <section className="col-span-2 grid gap-4 px-4 mt-4">
        <InfoCard
          title="Total Sales"
          value={salesData.overAllAmount}
          icon={<IndianRupee className="w-4 h-4" />}
          gradient="from-blue-600 to-blue-200"
          breakdown={totalSalesBreakdown}
        />
      </section>

      <div className="grid grid-cols-2 gap-4 px-4 mt-4 md:grid-cols-4 lg:grid-cols-4">
        <section className="col-span-2">
          <InfoCard
            title="Hipalz Razorpay Sales"
            value={salesData.onlineSale.online}
            icon={<IndianRupee className="w-4 h-4" />}
            gradient="from-black to-gray-100"
            breakdown={onlineSalesBreakdown}
          />
        </section>

        <InfoCard
          title="Pay To Captain Sales"
          value={totalOfflineSale}
          icon={<CreditCard className="w-4 h-4" />}
          gradient="from-green-600 to-green-100"
          breakdown={offlineSalesBreakdown}
        />

        <InfoCard
          title="Loyalty & Rewards"
          value={totalExceptionAndReward}
          icon={<Gift className="w-4 h-4" />}
          gradient="from-purple-600 to-purple-100"
          breakdown={loyaltyRewardsBreakdown}
        />

        <InfoCard
          title="Taxes & Service Charges"
          value={totalOtherAndWarning}
          icon={<AlertTriangle className="w-4 h-4" />}
          gradient="from-red-900 to-red-200"
          breakdown={taxesServiceBreakdown}
        />

        <InfoCard
          title="Running Tables"
          value={salesData.totalActiveTableValue}
          icon={<CreditCard className="w-4 h-4" />}
          gradient="from-blue-600 to-blue-200"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 md:pb-4 md:grid-cols-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Total In-store sales</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PieChart
                data={[
                  ...Object.entries(salesData.offlineSale).map(
                    ([mode, amount]) => ({ name: mode, value: amount }),
                  ),
                ]}
              />
            </CardContent>
          </Card>
        </motion.div>
        {salesExceptionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Loyalty & Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    ...Object.entries(salesExceptionData.exceptionSale).map(
                      ([key, value]) => ({ name: key, value }),
                    ),
                    ...Object.entries(salesExceptionData.rewardSale).map(
                      ([key, value]) => ({ name: key, value }),
                    ),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {otherData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Taxes & Service Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    ...Object.entries(otherData.otherSale).map(
                      ([key, value]) => ({ name: key, value }),
                    ),
                    ...Object.entries(otherData.warningSale).map(
                      ([key, value]) => ({ name: key, value }),
                    ),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const OverviewSkeleton = () => (
  <div className="container p-4 mx-auto space-y-6">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Skeleton className="h-40 col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4" />
      <Skeleton className="col-span-1 h-80 sm:col-span-2 lg:col-span-3" />
      <Skeleton className="col-span-1 h-80" />
      <Skeleton className="col-span-1 h-80 sm:col-span-2 lg:col-span-3" />
      <Skeleton className="col-span-1 h-80 sm:col-span-2" />
      <Skeleton className="col-span-1 h-80 sm:col-span-2" />
    </div>
  </div>
);

const MemoizedOverview = memo(Overview);

export default MemoizedOverview;
