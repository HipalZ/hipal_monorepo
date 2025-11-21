import DateRangePicker from '@/components/atoms/dateRangePicker';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import useTimings from '@/components/store/useTimings';
import type { TableData } from '@/components/store/useZonesAndTable.ts';
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
import { LineChart } from './LineChart';
import { PieChart } from './PieCharts';

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
  const selectedBiz = useHiClientZ((s) => s.selectedBiz);
  const businessId = selectedBiz?.businessId?._id;
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const isToday = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const today = new Date();

    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const shouldShowCard = isToday(timeStampStart) && isToday(timeStampEnd);

  const handleHistoryData = async (): Promise<SalesData> => {
    try {
      const response = await apiRpc.payments[':id'].salesDashboard.$get({
        query: {
          businessId: businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: businessId || '' },
      });
      return handleEnvelope<SalesData>(response);
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
    return handleEnvelope<OtherAndWarningData>(response);
  };

  const salesException = async (): Promise<SalesExceptionData> => {
    const response = await apiRpc.payments.sale.exception_and_rewards.$get({
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    });
    return handleEnvelope<SalesExceptionData>(response);
  };

  const fetchTables = async (businessId: string): Promise<TableData[]> => {
    const response = await apiRpc.table.all[':businessId'].$get({
      param: { businessId },
    });
    return handleEnvelope<TableData[]>(response);
  };

  const {
    data: salesData,
    isLoading: isLoadingSales,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ['salesData', businessId, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: otherData, isLoading: isLoadingOther } = useQuery<OtherAndWarningData, Error>({
    queryKey: ['otherAndWarning', businessId, timeStampStart, timeStampEnd],
    queryFn: otherAndWarning,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: salesExceptionData, isLoading: isLoadingExc } = useQuery<SalesExceptionData, Error>({
    queryKey: ['salesException', businessId, timeStampStart, timeStampEnd],
    queryFn: salesException,
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: tablesData } = useQuery({
    queryKey: ['tables', businessId],
    queryFn: () => fetchTables(businessId || ''),
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

  if (isLoadingSales || isLoadingOther || isLoadingExc) {
    return <OverviewSkeleton />;
  }

  if (error || !salesData) {
    return (
      <Card className="mx-auto h-[70vh] w-full px-4 xl:container">
        <DateRangePicker />
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
    <div className="mx-auto xl:container lg:px-4">
      <DateRangePicker />

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 lg:grid-cols-4">
        <section className="col-span-2">
          <InfoCard title="Total Sales" value={salesData.overAllAmount} icon={<IndianRupee className="h-4 w-4" />} breakdown={totalSalesBreakdown} />
        </section>
        <section className="col-span-2">
          <InfoCard
            title="Hipalz Razorpay Sales"
            value={salesData.onlineSale.online}
            icon={<IndianRupee className="h-4 w-4" />}
            breakdown={onlineSalesBreakdown}
          />
        </section>

        <InfoCard title="Pay To Captain Sales" value={totalOfflineSale} icon={<CreditCard className="h-4 w-4" />} breakdown={offlineSalesBreakdown} />
        <InfoCard title="Loyalty & Rewards" value={totalExceptionAndReward} icon={<Gift className="h-4 w-4" />} breakdown={loyaltyRewardsBreakdown} />

        <InfoCard
          title="Taxes & Service Charges"
          value={totalOtherAndWarning}
          icon={<AlertTriangle className="h-4 w-4" />}
          breakdown={taxesServiceBreakdown}
        />

        {shouldShowCard && (
          <InfoCard
            title="Running Tables"
            value={salesData.totalActiveTableValue}
            icon={<CreditCard className="h-4 w-4" />}
            breakdown={runningTablesBreakdown}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Sales Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={[...Object.entries(salesData.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount }))]} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Offline Payment Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={Object.entries(salesData.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount }))} />
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
                <LineChart
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

const SalesLiteMemo = memo(SalesLite);
export default SalesLiteMemo;
