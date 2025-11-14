import useBusinessData from '@/components/store/useBusinessData';
import { useKotStore } from '@/components/store/useKotStore';
import useTimings from '@/components/store/useTimings';
import ExecutiveReportButton from '@/components/templates/payment/ExecutiveReportButton';
import { TableKotPopUp } from '@/components/templates/payment/KotPopUp';
import type { OtherAndWarningData, SalesData, SalesExceptionData, TableData } from '@/components/types/paymentTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Gift, IndianRupee } from 'lucide-react';
import { memo, useMemo } from 'react';
import { BarChart } from './BarChart';
import { InfoCard } from './InfoCard';
import { PieChart } from './PieCharts';

const Overview = () => {
  const business = useBusinessData((s) => s.businessData);
  const open = useKotStore((s) => s.open);
  const { handleEnvelope } = useApiErrorHandler();
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const isToday = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const today = new Date();

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const shouldShowCard = isToday(timeStampStart) && isToday(timeStampEnd);

  const handleHistoryData = async (): Promise<SalesData> => {
    const res = await apiRpc.payments[':id'].salesDashboard.$get({
      query: {
        businessId: business?._id,
        from: String(timeStampStart),
        to: String(timeStampEnd),
      },
      param: { id: business?._id || '' },
    });
    return handleEnvelope<SalesData>(res);
  };

  const fetchOtherAndWarning = async (): Promise<OtherAndWarningData> => {
    const res = await apiRpc.payments.sale.other_and_warnings.$get({
      query: {
        businessId: business?._id,
        from: String(timeStampStart),
        to: String(timeStampEnd),
      },
    });
    return handleEnvelope<OtherAndWarningData>(res);
  };

  const fetchSalesException = async (): Promise<SalesExceptionData> => {
    const res = await apiRpc.payments.sale.exception_and_rewards.$get({
      query: {
        businessId: business?._id,
        from: String(timeStampStart),
        to: String(timeStampEnd),
      },
    });
    return handleEnvelope<SalesExceptionData>(res);
  };

  const fetchTables = async (businessId: string): Promise<TableData[]> => {
    const res = await apiRpc.table.all[':businessId'].$get({
      param: { businessId },
    });
    return handleEnvelope<TableData[]>(res);
  };

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ['salesData', business?._id, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const { data: otherData } = useQuery<OtherAndWarningData, Error>({
    queryKey: ['otherAndWarning', business?._id, timeStampStart, timeStampEnd],
    queryFn: fetchOtherAndWarning,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const { data: salesExceptionData } = useQuery<SalesExceptionData, Error>({
    queryKey: ['salesException', business?._id, timeStampStart, timeStampEnd],
    queryFn: fetchSalesException,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const { data: tablesData } = useQuery({
    queryKey: ['tables', business?._id],
    queryFn: () => fetchTables(business?._id || ''),
    enabled: !!business?._id,
    refetchInterval: 1000 * 30,
  });

  const runningTablesBreakdown = useMemo(() => {
    return tablesData
      ? tablesData
          .filter((table) => table.active && table.currentTableAmount > 0)
          .map((table) => ({
            label: ` ${table.name}`,
            value: table.currentTableAmount,
            tableId: table._id,
          }))
      : [];
  }, [tablesData]);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error || !salesData) {
    return (
      <Card className="flex h-[70vh] w-full items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground text-center">No sales data found</p>
        </CardContent>
      </Card>
    );
  }

  const totalOfflineSale = Object.values(salesData.offlineSale).reduce((acc, curr) => acc + curr, 0);

  const totalExceptionAndReward = salesExceptionData
    ? salesExceptionData.exceptionSale.totalComplementary +
      salesExceptionData.exceptionSale.totalDiscount +
      salesExceptionData.rewardSale.totalCoinsGiven +
      salesExceptionData.rewardSale.totalCoinsUsed +
      salesExceptionData.rewardSale.totalCouponDiscount
    : 0;

  const totalOtherAndWarning = otherData ? otherData.otherSale.totalTax + otherData.otherSale.totalTip + otherData.otherSale.totalServiceCharge : 0;

  // Create breakdown data
  const totalSalesBreakdown = [
    { label: 'Hipalz Razorpay Sales', value: salesData.onlineSale.online },
    { label: 'Pay To Captain Sales', value: totalOfflineSale },
  ];

  const onlineSalesBreakdown = [{ label: 'Online Payment', value: salesData.onlineSale.online }];

  const offlineSalesBreakdown = Object.entries(salesData.offlineSale).map(([method, amount]) => ({
    label: method.charAt(0).toUpperCase() + method.slice(1),
    value: amount,
  }));

  const loyaltyRewardsBreakdown = salesExceptionData
    ? [
        {
          label: 'Total Complementary',
          value: salesExceptionData.exceptionSale.totalComplementary,
        },
        {
          label: 'Total Discount',
          value: salesExceptionData.exceptionSale.totalDiscount,
        },
        {
          label: 'Total Coins Given',
          value: salesExceptionData.rewardSale.totalCoinsGiven,
        },
        {
          label: 'Total Coins Used',
          value: salesExceptionData.rewardSale.totalCoinsUsed,
        },
        {
          label: 'Total Coupon Discount',
          value: salesExceptionData.rewardSale.totalCouponDiscount,
        },
      ]
    : [];

  const taxesServiceBreakdown = otherData
    ? [
        { label: 'Total Tax', value: otherData.otherSale.totalTax },
        { label: 'Total Tip', value: otherData.otherSale.totalTip },
        {
          label: 'Total Service Charge',
          value: otherData.otherSale.totalServiceCharge,
        },
      ]
    : [];

  return (
    <div className="container mx-auto">
      <div className="mt-2 flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold">Executive Summary</h2>
        <ExecutiveReportButton
          businessName={business?.name || 'My Business'}
          from={timeStampStart}
          to={timeStampEnd}
          salesData={salesData}
          otherData={otherData}
          salesExceptionData={salesExceptionData}
        />
      </div>
      <section className="col-span-2 mt-4 grid gap-4 px-4">
        <InfoCard
          title={`Total Sales (${salesData.totalOrders} Orders)`}
          value={salesData.overAllAmount}
          icon={<IndianRupee className="h-4 w-4" />}
          gradient="from-blue-600 to-blue-200"
          breakdown={totalSalesBreakdown}
        />
      </section>

      <div className="mt-4 grid grid-cols-2 gap-4 px-4 md:grid-cols-4 lg:grid-cols-4">
        <section className="col-span-2">
          <InfoCard
            title="Hipalz Razorpay Sales"
            value={salesData.onlineSale.online}
            icon={<IndianRupee className="h-4 w-4" />}
            gradient="from-black to-gray-100"
            breakdown={onlineSalesBreakdown}
          />
        </section>

        <InfoCard
          title="Pay To Captain Sales"
          value={totalOfflineSale}
          icon={<CreditCard className="h-4 w-4" />}
          gradient="from-green-600 to-green-100"
          breakdown={offlineSalesBreakdown}
        />

        <InfoCard
          title="Loyalty & Rewards"
          value={totalExceptionAndReward}
          icon={<Gift className="h-4 w-4" />}
          gradient="from-purple-600 to-purple-100"
          breakdown={loyaltyRewardsBreakdown}
        />

        <InfoCard
          title="Taxes & Service Charges"
          value={totalOtherAndWarning}
          icon={<AlertTriangle className="h-4 w-4" />}
          gradient="from-red-900 to-red-200"
          breakdown={taxesServiceBreakdown}
        />
        <InfoCard
          title="Total Guest"
          value={salesData.totalPaxCount}
          icon={<IndianRupee className="h-4 w-4" />}
          gradient="from-blue-600 to-blue-200"
          breakdown={totalSalesBreakdown}
        />

        {shouldShowCard && (
          <InfoCard
            title="Running Tables"
            value={salesData.totalActiveTableValue}
            icon={<CreditCard className="h-4 w-4" />}
            gradient="from-blue-600 to-blue-200"
            breakdown={runningTablesBreakdown}
          />
        )}
      </div>
      {open && <TableKotPopUp />}

      <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-1 md:pb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Total In-store sales</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <PieChart data={[...Object.entries(salesData.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount }))]} />
            </CardContent>
          </Card>
        </motion.div>
        {salesExceptionData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <Card>
              <CardHeader>
                <CardTitle>Loyalty & Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    ...Object.entries(salesExceptionData.exceptionSale).map(([key, value]) => ({ name: key, value })),
                    ...Object.entries(salesExceptionData.rewardSale).map(([key, value]) => ({ name: key, value })),
                  ]}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {otherData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
            <Card>
              <CardHeader>
                <CardTitle>Taxes & Service Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    ...Object.entries(otherData.otherSale).map(([key, value]) => ({ name: key, value })),
                    ...Object.entries(otherData.warningSale).map(([key, value]) => ({ name: key, value })),
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
  <div className="container mx-auto space-y-6 p-4">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Skeleton className="col-span-1 h-40 sm:col-span-2 lg:col-span-3 xl:col-span-4" />
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
