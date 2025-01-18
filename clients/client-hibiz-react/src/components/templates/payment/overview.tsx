'use client'

import { memo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe, CreditCard, DollarSign, Percent, Tag, Coins } from 'lucide-react'
import useTimings from "@/components/store/useTimings"
import { apiRpc } from "@hi/common"
import useBusinessData from "@/components/store/useBusinessData"
import type { ISalesLite } from "@/components/types/businessData"
import { PieChart } from "./piechart"

const Overview = () => {
  const business = useBusinessData((s) => s.businessData)
  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }))

  const handleHistoryData = async (): Promise<ISalesLite> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: business?._id,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: business?._id || "" },
      })
      const data = (await response.json()).data as ISalesLite

      if (response.status === 200) {
        return data
      }
      throw new Error("Failed to fetch sales data")
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const { data: salesData, isLoading, error } = useQuery<ISalesLite, Error>({
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

  const pieChartData = Object.entries(salesData.modeObj).map(([mode, amount]) => ({
    name: mode,
    value: amount,
  }))

  return (
    <div className="mx-4 mt-4 space-y-6 md:mt-6 pb-[7rem]">
      {/* <Card className="shadow-lg bg-gradient-to-br from-secondary/80 to-secondary text-secondary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 text-center">
            <Calendar className="w-6 h-6" />
            <span>Selected Period</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl font-semibold">{timestampToDateTime(timeStampStart)} - {timestampToDateTime(timeStampEnd)}</p>
        </CardContent>
      </Card> */}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg bg-gradient-to-br from-secondary/50 to-secondary text-secondary-foreground">
          <CardHeader>
            <CardTitle>Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-4xl font-bold">₹ {salesData?.totalSale.toLocaleString("en-IN")}</h2>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-gradient-to-br from-destructive/50 to-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Total Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-4xl font-bold">₹ {salesData?.totalTips.toLocaleString("en-IN")}</h2>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sales by Payment Mode</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-between md:flex-row">
          <div className="grid grid-cols-2 gap-2 mb-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 md:mb-0">
            {Object.entries(salesData?.modeObj).map(([mode, amount]) => (
              <InfoCard
                key={mode}
                title={mode}
                value={amount}
                icon={mode === "offline" ? <CreditCard className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                gradient={mode === "offline" ? "from-blue-300 to-blue-600" : "from-green-400 to-green-600"}
              />
            ))}
          </div>
          <div className="w-full h-64 md:w-[40%]">
            <PieChart data={pieChartData} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <InfoCard
          title="Service Charge"
          value={salesData?.totalServiceCharge}
          icon={<DollarSign className="w-4 h-4" />}
          gradient="from-yellow-300 to-yellow-600"
        />
        <InfoCard
          title="Total Tax"
          value={salesData?.totalTax}
          icon={<Percent className="w-4 h-4" />}
          gradient="from-purple-300 to-purple-600"
        />
        <InfoCard
          title="Total Tips"
          value={salesData?.totalTips}
          icon={<Tag className="w-4 h-4" />}
          gradient="from-pink-300 to-pink-600"
        />
        <InfoCard
          title="Coins Earned"
          value={salesData?.totalEarnCoins}
          icon={<Coins className="w-4 h-4" />}
          gradient="from-indigo-300 to-indigo-600"
        />
        <InfoCard
          title="Coins Claimed"
          value={salesData?.totalClaimedCoins}
          icon={<Coins className="w-4 h-4" />}
          gradient="from-zinc-300 to-zinc-600"
        />
        <InfoCard
          title="Forced Settle"
          value={salesData?.forceSettle}
          icon={<Coins className="w-4 h-4" />}
          gradient="from-red-300 to-red-600"
        />
      </div>
    </div>
  )
}

const InfoCard = ({ title, value, icon, gradient }: { title: string; value: number; icon: React.ReactNode; gradient: string }) => (
  <Card className={`bg-gradient-to-br ${gradient} text-white shadow-lg`}>
    <CardContent className="pt-6">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center mb-2 space-x-2">
          {icon}
          <span className="text-sm font-semibold capitalize">{title}</span>
        </div>
        <span className="text-2xl font-bold text-nowrap">₹ {value?.toLocaleString("en-IN")}</span>
      </div>
    </CardContent>
  </Card>
)

const OverviewSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="w-full h-40" />
    <div className="grid grid-cols-2 gap-6">
      <Skeleton className="w-full h-40" />
      <Skeleton className="w-full h-40" />
    </div>
    <Skeleton className="w-full h-96" />
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="w-full h-32" />
      ))}
    </div>
  </div>
)

const MemoizedOverview = memo(Overview)

export default MemoizedOverview

