// Overview.tsx
import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useTimings from "@/components/store/useTimings";
import useBusinessData from "@/components/store/useBusinessData";
import { InfoCard } from "./InfoCard";
import { PieChart } from "./PieCharts";
import { motion } from "framer-motion";
import { CreditCard, Gift, AlertTriangle, IndianRupee } from "lucide-react";
import { BarChart } from "./BarChart";

import {
  useSalesData,
  useOtherAndWarning,
  useSalesException,
  useTables,
} from "@/hooks/payments/usePayment.ts";

const isToday = (timestamp: string | number | Date) => {
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const Overview = () => {
  const business = useBusinessData((s) => s.businessData);
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const shouldShowRunningTables =
    isToday(timeStampStart) && isToday(timeStampEnd);

  const {
    data: salesData,
    isLoading,
    error,
  } = useSalesData(timeStampStart, timeStampEnd);

  const { data: otherData } = useOtherAndWarning(timeStampStart, timeStampEnd);

  const { data: salesExceptionData } = useSalesException(
    timeStampStart,
    timeStampEnd,
  );

  const { data: tablesData } = useTables(business?._id);

  const totalOfflineSale = useMemo(() => {
    if (!salesData?.offlineSale) return 0;
    return Object.values(salesData.offlineSale).reduce(
      (acc, curr) => acc + curr,
      0,
    );
  }, [salesData]);

  const totalExceptionAndReward = useMemo(() => {
    if (!salesExceptionData) return 0;
    const ex = salesExceptionData.exceptionSale;
    const rw = salesExceptionData.rewardSale;
    // handle both totalCoinUsed/totalCoinsUsed just in case
    const coinsUsed = (rw.totalCoinsUsed ?? 0) + (rw.totalCoinUsed ?? 0);
    return (
      (ex.totalComplementary ?? 0) +
      (ex.totalDiscount ?? 0) +
      (rw.totalCoinsGiven ?? 0) +
      coinsUsed +
      (rw.totalCouponDiscount ?? 0)
    );
  }, [salesExceptionData]);

  const totalOtherAndWarning = useMemo(() => {
    if (!otherData) return 0;
    const o = otherData.otherSale;
    return (o.totalTax ?? 0) + (o.totalTip ?? 0) + (o.totalServiceCharge ?? 0);
  }, [otherData]);

  const runningTablesBreakdown = useMemo(() => {
    if (!tablesData) return [];
    return tablesData
      .filter((t) => t.active && t.currentTableAmount > 0)
      .map((t) => ({ label: `${t.name}`, value: t.currentTableAmount }));
  }, [tablesData]);

  const totalSalesBreakdown = useMemo(
    () =>
      salesData
        ? [
            {
              label: "Hipalz Razorpay Sales",
              value: salesData.onlineSale?.online ?? 0,
            },
            { label: "Pay To Captain Sales", value: totalOfflineSale },
          ].filter((x) => x.value > 0)
        : [],
    [salesData, totalOfflineSale],
  );

  const onlineSalesBreakdown = useMemo(
    () =>
      salesData
        ? [
            {
              label: "Online Payment",
              value: salesData.onlineSale?.online ?? 0,
            },
          ].filter((x) => x.value > 0)
        : [],
    [salesData],
  );

  const offlineSalesBreakdown = useMemo(() => {
    if (!salesData) return [];
    return Object.entries(salesData.offlineSale || {})
      .map(([method, amount]) => ({
        label: method.charAt(0).toUpperCase() + method.slice(1),
        value: amount,
      }))
      .filter((x) => x.value > 0);
  }, [salesData]);

  const loyaltyRewardsBreakdown = useMemo(() => {
    if (!salesExceptionData) return [];
    const ex = salesExceptionData.exceptionSale;
    const rw = salesExceptionData.rewardSale;
    const coinsUsed = (rw.totalCoinsUsed ?? 0) + (rw.totalCoinUsed ?? 0);
    const items = [
      { label: "Total Complementary", value: ex.totalComplementary ?? 0 },
      { label: "Total Discount", value: ex.totalDiscount ?? 0 },
      { label: "Total Coins Given", value: rw.totalCoinsGiven ?? 0 },
      { label: "Total Coins Used", value: coinsUsed },
      { label: "Total Coupon Discount", value: rw.totalCouponDiscount ?? 0 },
    ];
    return items.filter((i) => i.value > 0);
  }, [salesExceptionData]);

  const taxesServiceBreakdown = useMemo(() => {
    if (!otherData) return [];
    const o = otherData.otherSale;
    const items = [
      { label: "Total Tax", value: o.totalTax ?? 0 },
      { label: "Total Tip", value: o.totalTip ?? 0 },
      { label: "Total Service Charge", value: o.totalServiceCharge ?? 0 },
    ];
    return items.filter((i) => i.value > 0);
  }, [otherData]);

  if (isLoading) return <OverviewSkeleton />;

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

  // --- Show "no sale today" if total is zero ---
  if ((salesData.overAllAmount ?? 0) === 0) {
    return (
      <Card className="w-full h-[60vh] flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground text-lg">
            There is no sale today.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasOfflineAny = totalOfflineSale > 0;
  const hasOnlineAny = (salesData.onlineSale?.online ?? 0) > 0;
  const hasLoyaltyAny = totalExceptionAndReward > 0;
  const hasOtherAny = totalOtherAndWarning > 0;
  const hasRunningTables =
    shouldShowRunningTables && (salesData.totalActiveTableValue ?? 0) > 0;

  return (
    <div className="container mx-auto">
      {/* TOTAL SALES */}
      {salesData.overAllAmount > 0 && (
        <section className="col-span-2 grid gap-4 px-4 mt-4">
          <InfoCard
            title="Total Sales"
            value={salesData.overAllAmount}
            icon={<IndianRupee className="w-4 h-4" />}
            gradient="from-blue-600 to-blue-200"
            breakdown={totalSalesBreakdown}
          />
        </section>
      )}

      {/* TOP CARDS (auto-hide when value is 0) */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-4 md:grid-cols-4 lg:grid-cols-4">
        {hasOnlineAny && (
          <section className="col-span-2">
            <InfoCard
              title="Hipalz Razorpay Sales"
              value={salesData.onlineSale.online}
              icon={<IndianRupee className="w-4 h-4" />}
              gradient="from-black to-gray-100"
              breakdown={onlineSalesBreakdown}
            />
          </section>
        )}

        {hasOfflineAny && (
          <InfoCard
            title="Pay To Captain Sales"
            value={totalOfflineSale}
            icon={<CreditCard className="w-4 h-4" />}
            gradient="from-green-600 to-green-100"
            breakdown={offlineSalesBreakdown}
          />
        )}

        {hasLoyaltyAny && (
          <InfoCard
            title="Loyalty & Rewards"
            value={totalExceptionAndReward}
            icon={<Gift className="w-4 h-4" />}
            gradient="from-purple-600 to-purple-100"
            breakdown={loyaltyRewardsBreakdown}
          />
        )}

        {hasOtherAny && (
          <InfoCard
            title="Taxes & Service Charges"
            value={totalOtherAndWarning}
            icon={<AlertTriangle className="w-4 h-4" />}
            gradient="from-red-900 to-red-200"
            breakdown={taxesServiceBreakdown}
          />
        )}

        {hasRunningTables && (
          <InfoCard
            title="Running Tables"
            value={salesData.totalActiveTableValue}
            icon={<CreditCard className="w-4 h-4" />}
            gradient="from-blue-600 to-blue-200"
            breakdown={runningTablesBreakdown}
          />
        )}
      </div>

      {/* CHARTS: render only when there’s data > 0 */}
      <div className="grid grid-cols-1 gap-6 p-4 md:pb-4 md:grid-cols-1">
        {hasOfflineAny && (
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
                  data={offlineSalesBreakdown.map((x) => ({
                    name: x.label,
                    value: x.value,
                  }))}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {hasLoyaltyAny && salesExceptionData && (
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
                    ...Object.entries(salesExceptionData.exceptionSale)
                      .map(([k, v]) => ({ name: k, value: v as number }))
                      .filter((d) => d.value > 0),
                    ...Object.entries(salesExceptionData.rewardSale)
                      .map(([k, v]) => ({ name: k, value: v as number }))
                      .filter((d) => d.value > 0),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {hasOtherAny && otherData && (
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
                    ...Object.entries(otherData.otherSale)
                      .map(([k, v]) => ({ name: k, value: v as number }))
                      .filter((d) => d.value > 0),
                    ...Object.entries(otherData.warningSale)
                      .map(([k, v]) => ({ name: k, value: v as number }))
                      .filter((d) => d.value > 0),
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

export default memo(Overview);
