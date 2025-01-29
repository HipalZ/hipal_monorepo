import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import useTimings from "@/components/store/useTimings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiRpc } from "@hi/common";
import DateRangePickerMemo from "../dateRangePicker";
import { InfoCard } from "./InfoCard";
import { PieChart } from "./PieCharts";


export interface SalesData {
  overAllAmount: number
  onlineSale: {
    [key: string]: number
  }
  offlineSale: {
    [key: string]: number
  }
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

  const {
    data: salesData,
    isLoading,
    error,
  } = useQuery<SalesData, Error>({
    queryKey: ["salesData", businessId, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
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

  const pieChartData = [
    ...Object.entries(salesData?.onlineSale).map(([mode, amount]) => ({ name: mode, value: amount })),
    ...Object.entries(salesData?.offlineSale).map(([mode, amount]) => ({ name: mode, value: amount })),
  ]

  return (
    <div className="mx-auto lg:px-4 xl:container">
      <DateRangePickerMemo />

      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="flex flex-col gap-6" >
          <InfoCard title="Today's Sales" value={salesData.overAllAmount} />
          {Object.entries(salesData?.onlineSale).map(([mode, amount]) => (
            <InfoCard key={`online-${mode}`} title={`Online - ${mode}`} value={amount} />
          ))}
        </section>
        <Card className="col-span-1 sm:col-span-2">
          <CardContent>
            <PieChart data={pieChartData} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Payment Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(salesData.offlineSale).map(([mode, amount]) => (
              <InfoCard key={`offline-${mode}`} title={`Offline - ${mode}`} value={amount} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const OverviewSkeleton = () => (
  <div className="container p-4 mx-auto space-y-6">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-40 sm:col-span-2 lg:col-span-1" />
      <Skeleton className="col-span-1 h-80 sm:col-span-2" />
    </div>
    <Skeleton className="h-96" />
  </div>
)
const SalesLiteMemo = memo(SalesLite)
export default SalesLiteMemo


