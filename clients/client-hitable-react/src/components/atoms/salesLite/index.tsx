import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import useTimings from "@/components/store/useTimings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiRpc } from "@hi/common"
import DateRangePickerMemo from "../dateRangePicker"
import { InfoCard } from "./InfoCard"
import { PieChart } from "./PieCharts"
import { BarChart } from "./BarChart"
import { LineChart } from "./LineChart"
import { motion } from "framer-motion"
import { DollarSign, CreditCard, Gift, AlertTriangle } from "lucide-react"

export interface SalesData {
  overAllAmount: number
  onlineSale: Record<string, number>
  offlineSale: Record<string, number>
  totalOrders: number
  totalActiveTableValue: number
}

interface OtherAndWarningData {
  otherSale: {
    totalTax: number
    totalTip: number
    totalServiceCharge: number
  }
  warningSale: {
    totalForceSettle: number
    totalFreeSettle: number
  }
}

interface SalesExceptionData {
  exceptionSale: {
    totalDuesReceived: number
    totalDuesGiven: number
    totalNpc: number
    totalComplementary: number
    totalDiscount: number
  }
  rewardSale: {
    totalCoinsGiven: number
    totalCoinUsed: number
    totalCouponUsed: number
  }
}

const SalesLite = () => {
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }))
  const businessId = selectedBiz?.businessId?._id

  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }))

  const handleHistoryData = async (): Promise<SalesData> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: businessId || "" },
      })
      const data = (await response.json()).data as SalesData
      if (response.status === 200) {
        return data
      }
      throw new Error("Failed to fetch sales data")
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const otherAndWarning = async (): Promise<OtherAndWarningData> => {
    const response = await apiRpc.payments.sale.other_and_warnings.$get({
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    })
    const data = (await response.json()).data as OtherAndWarningData
    return data
  }

  const salesException = async (): Promise<SalesExceptionData> => {
    const response = await apiRpc.payments.sale.exception_and_rewards.$get({
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
      },
    })
    const data = (await response.json()).data as SalesExceptionData
    return data
  }

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ["salesData", businessId, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  })

  const { data: otherData } = useQuery<OtherAndWarningData, Error>({
    queryKey: ["otherAndWarning", businessId, timeStampStart, timeStampEnd],
    queryFn: otherAndWarning,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  })

  const { data: salesExceptionData } = useQuery<SalesExceptionData, Error>({
    queryKey: ["salesException", businessId, timeStampStart, timeStampEnd],
    queryFn: salesException,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  })

  if (isLoading) {
    return <OverviewSkeleton />
  }

  if (error || !salesData) {
    return (
      <Card className="w-full h-[70vh] px-4 mx-auto xl:container">
        <DateRangePickerMemo />
        <CardContent>
          <p className="text-center text-muted-foreground">No sales data found</p>
        </CardContent>
      </Card>
    )
  }

  const totalOfflineSale = Object.values(salesData.offlineSale).reduce((acc, curr) => acc + curr, 0)
  const totalExceptionAndReward = salesExceptionData
    ? Object.values(salesExceptionData.exceptionSale).reduce((acc, curr) => acc + curr, 0) +
    Object.values(salesExceptionData.rewardSale).reduce((acc, curr) => acc + curr, 0)
    : 0
  const totalOtherAndWarning = otherData
    ? Object.values(otherData.otherSale).reduce((acc, curr) => acc + curr, 0) +
    Object.values(otherData.warningSale).reduce((acc, curr) => acc + curr, 0)
    : 0

  return (
    <div className="mx-auto lg:px-4 xl:container">
      <DateRangePickerMemo />

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4 lg:grid-cols-4">
        <section className="col-span-2 md:col-span-2 ">

          <InfoCard
            title="Total Sales"
            value={salesData.overAllAmount}
            icon={<DollarSign className="w-4 h-4" />}
            gradient="from-blue-600 to-blue-200"
          />
        </section>
        <section className="col-span-2 md:col-span-2 ">
          <InfoCard
            title="Online Sales"
            value={salesData.onlineSale.online}
            icon={<DollarSign className="w-4 h-4" />}
            gradient="from-black to-gray-100"
          />
        </section>
        <InfoCard
          title="Offline Sales"
          value={totalOfflineSale}
          icon={<CreditCard className="w-4 h-4" />}
          gradient="from-green-600 to-green-100"
        />
        <InfoCard
          title="Exception & Reward"
          value={totalExceptionAndReward}
          icon={<Gift className="w-4 h-4" />}
          gradient="from-purple-600 to-purple-100"
        />
        <InfoCard
          title="Other & Warning"
          value={totalOtherAndWarning}
          icon={<AlertTriangle className="w-4 h-4" />}
          gradient="from-red-900 to-red-100"
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
                  ...Object.entries(salesData.onlineSale).map(([mode, amount]) => ({ name: mode, value: amount })),
                  ...Object.entries(salesData.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount })),
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
                data={Object.entries(salesData.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount }))}
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
                <CardTitle>Exception & Reward Sales</CardTitle>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Other & Warning Sales</CardTitle>
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
  )
}

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
)

const SalesLiteMemo = memo(SalesLite)
export default SalesLiteMemo

