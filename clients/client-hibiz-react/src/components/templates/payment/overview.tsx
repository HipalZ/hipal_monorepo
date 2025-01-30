import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import useTimings from "@/components/store/useTimings"
import { apiRpc } from "@hi/common"
import useBusinessData from "@/components/store/useBusinessData"
import { InfoCard } from "./InfoCard"
import { PieChart } from "./PieCharts"

interface SalesData {
  overAllAmount: number
  onlineSale: {
    [key: string]: number
  }
  offlineSale: {
    [key: string]: number
  }
}

const Overview = () => {
  const business = useBusinessData((s) => s.businessData)
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }))

  const handleHistoryData = async (): Promise<SalesData> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: business?._id,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: business?._id || "" },
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
    queryKey: ["salesData", business?._id, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!business?._id && !!timeStampStart && !!timeStampEnd,
  })

  if (isLoading) {
    return <OverviewSkeleton />
  }

  if (error || !salesData) {
    return (
      <Card className="w-full h-[70vh] flex items-center justify-center">
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
    <div className="container mx-auto">
      <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <section className="flex flex-col gap-6" >
          <InfoCard title="Today's Sales" value={salesData.overAllAmount} />
          {Object.entries(salesData?.onlineSale).map(([mode, amount]) => (
            <InfoCard key={`online-${mode}`} title={`${mode}`} value={amount} />
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
          <CardTitle>Offline Payment Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(salesData.offlineSale).map(([mode, amount]) => (
              <InfoCard key={`offline-${mode}`} title={` ${mode}`} value={amount} />
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

const MemoizedOverview = memo(Overview)

export default MemoizedOverview

