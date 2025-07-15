import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import useTimings from "@/components/store/useTimings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRpc } from "@hi/common";
import DateRangePickerMemo from "../dateRangePicker";
import { InfoCard } from "./InfoCard";
import { PieChart } from "./PieCharts";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";
import { motion } from "framer-motion";
import { CreditCard, Gift, AlertTriangle, IndianRupee } from "lucide-react";
import type { TableData } from "@/components/store/useZonesAndTable.ts";

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

const SalesLite = () => {
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const businessId = selectedBiz?.businessId?._id;

  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));

  const handleHistoryData = async (): Promise<SalesData> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: businessId || "" },
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
        businessId: businessId,
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
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    const data = (await response.json()).data as SalesExceptionData;
    return data;
  };

 const fetchTables = async (businessId: string): Promise<TableData[]> => {
    const response = await apiRpc.table.all[":businessId"].$get({
      param: { businessId },
    });
    const json = await response.json();
    return json.data || [];
  };

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ["salesData", businessId, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  });

  const { data: otherData } = useQuery<OtherAndWarningData, Error>({
    queryKey: ["otherAndWarning", businessId, timeStampStart, timeStampEnd],
    queryFn: otherAndWarning,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  });

  const { data: salesExceptionData } = useQuery<SalesExceptionData, Error>({
    queryKey: ["salesException", businessId, timeStampStart, timeStampEnd],
    queryFn: salesException,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  });

    const {  data: tablesData } = useQuery({
      queryKey: ["tables", businessId],
      queryFn: () => fetchTables(businessId || ""),
      enabled: !!businessId,
      refetchInterval: 1000 * 30,
    });
  
    const runningTablesBreakdown = useMemo(() => {
      return tablesData
        ? tablesData
            .filter((table) => table.active && table.currentTableAmount > 0)
            .map((table) => ({
              label: ` ${table.name}`,
              value: table.currentTableAmount,
            }))
        : [];
    }, [tablesData]);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error || !salesData) {
    return (
      <Card className="w-full h-[70vh] px-4 mx-auto xl:container">
        <DateRangePickerMemo />
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
    <div className="mx-auto lg:px-4 xl:container">
      <DateRangePickerMemo />

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 lg:grid-cols-4">
        <section className="col-span-2">
          <InfoCard
            title="Total Sales"
            value={salesData.overAllAmount}
            icon={<IndianRupee className="w-4 h-4" />}
            breakdown={totalSalesBreakdown}
          />
        </section>
        <section className="col-span-2">
        <InfoCard
                    title="Hipalz Razorpay Sales"
                    value={salesData.onlineSale.online}
                    icon={<IndianRupee className="w-4 h-4" />}
                    breakdown={onlineSalesBreakdown}
                  />
        </section>
       
               <InfoCard
                 title="Pay To Captain Sales"
                 value={totalOfflineSale}
                 icon={<CreditCard className="w-4 h-4" />}
                 breakdown={offlineSalesBreakdown}
               />
          <InfoCard
          title="Loyalty & Rewards"
          value={totalExceptionAndReward}
          icon={<Gift className="w-4 h-4" />}
          breakdown={loyaltyRewardsBreakdown}
        />

        <InfoCard
          title="Taxes & Service Charges"
          value={totalOtherAndWarning}
          icon={<AlertTriangle className="w-4 h-4" />}
          breakdown={taxesServiceBreakdown}
        />

        <InfoCard
          title="Running Tables"
          value={salesData.totalActiveTableValue}
          icon={<CreditCard className="w-4 h-4" />}
          breakdown={runningTablesBreakdown}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Distribution</CardTitle>
            </CardHeader>
            <CardContent>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Offline Payment Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(salesData.offlineSale).map(
                  ([mode, amount]) => ({ name: mode, value: amount }),
                )}
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
                <LineChart
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

const SalesLiteMemo = memo(SalesLite);
export default SalesLiteMemo;
