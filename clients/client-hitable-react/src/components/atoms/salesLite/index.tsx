import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import useTimings from "@/components/store/useTimings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiRpc } from "@hi/common";
import { Coins, CreditCard, DollarSign, Globe, Percent, Tag } from "lucide-react";
import DateRangePickerMemo from "../dateRangePicker";


export interface ISalesLite {
  totalSale: number;
  modeObj: Record<string, number>;
  totalTips: number;
  totalTax: number;
  totalServiceCharge: number;
  totalClaimedCoins: number;
  totalEarnCoins: number;
  totalDiscount: number;
  forceSettle: number;
}

const salesDataFallback = {
  totalSale: 0,
  modeObj: {},
  totalTips: 0,
  totalTax: 0,
  totalServiceCharge: 0,
  totalClaimedCoins: 0,
  totalEarnCoins: 0,
  totalDiscount: 0,
  forceSettle: 0,
};


const SalesLite = () => {
  const { selectedBiz } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
  }));
  const businessId = selectedBiz?.businessId?._id;

  const { timeStampStart, timeStampEnd } = useTimings((s) => ({
    timeStampStart: s.timeStampStart,
    timeStampEnd: s.timeStampEnd,
  }));

  const handleHistoryData = async (): Promise<ISalesLite> => {
    try {
      const response = await apiRpc.payments[":id"].salesDashboard.$get({
        query: {
          businessId: businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
        },
        param: { id: businessId || "" },
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

  const { data: salesData, isLoading } = useQuery<ISalesLite, Error>({
    queryKey: ["salesData", businessId, timeStampStart, timeStampEnd],
    queryFn: handleHistoryData,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd,
  })

  const salesDataFinal = salesData || salesDataFallback;


  if (isLoading) {
    return <OverviewSkeleton />
  }

  return (
    <div className="px-4 mx-auto xl:container">
      <DateRangePickerMemo />

      <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="text-white col-span-full md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-500 to-blue-600">
          <CardHeader>
            <CardTitle className="text-2xl">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-5xl font-bold">₹ {salesDataFinal.totalSale.toLocaleString("en-IN")}</h2>
          </CardContent>
        </Card>

        <PaymentModes modeObj={salesDataFinal.modeObj} />

        <InfoCard
          title="Total Discount"
          value={salesDataFinal.totalDiscount}
          icon={<Percent className="w-6 h-6" />}
          gradient="from-red-400 to-red-500"
        />

        <InfoCard
          title="Service Charge"
          value={salesDataFinal.totalServiceCharge}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-green-400 to-green-500"
        />

        <InfoCard
          title="Total Tax"
          value={salesDataFinal.totalTax}
          icon={<Percent className="w-6 h-6" />}
          gradient="from-purple-400 to-purple-500"
        />

        <InfoCard
          title="Total Tips"
          value={salesDataFinal.totalTips}
          icon={<Tag className="w-6 h-6" />}
          gradient="from-yellow-600 to-yellow-900"
        />

        <InfoCard
          title="Coins Earned"
          value={salesDataFinal.totalEarnCoins}
          icon={<Coins className="w-6 h-6" />}
          gradient="from-indigo-400 to-indigo-500"
        />

        <InfoCard
          title="Coins Claimed"
          value={salesDataFinal.totalClaimedCoins}
          icon={<Coins className="w-6 h-6" />}
          gradient="from-teal-400 to-teal-500"
        />

        <InfoCard
          title="Forced Settle"
          value={salesDataFinal.forceSettle}
          icon={<CreditCard className="w-6 h-6" />}
          gradient="from-orange-400 to-orange-500"
        />
      </div>
    </div>
  )
}

const PaymentModes = memo(({ modeObj }: { modeObj: Record<string, number> }) => (
  <Card className="col-span-full md:col-span-2 lg:col-span-4">
    <CardHeader>
      <CardTitle className="text-xl">Sales by Payment Mode</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(modeObj).map(([mode, amount]) => (
          <Card
            key={mode}
            className={`bg-gradient-to-r ${mode.toLowerCase() === "offline" ? "from-blue-400 to-blue-500" : "from-green-400 to-green-500"} text-white`}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium capitalize">{mode}</p>
                <p className="text-2xl font-bold">₹ {amount.toLocaleString("en-IN")}</p>
              </div>
              {mode.toLowerCase() === "offline" ? <CreditCard className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
))

const InfoCard = ({
  title,
  value,
  icon,
  gradient,
}: { title: string; value: number; icon: React.ReactNode; gradient: string }) => (
  <Card className={`bg-gradient-to-r ${gradient} text-white`}>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-3xl font-bold">₹ {value.toLocaleString("en-IN")}</p>
      </div>
      <div className="p-3 bg-white rounded-full bg-opacity-20">{icon}</div>
    </CardContent>
  </Card>
)

const OverviewSkeleton = () => (
  <div className="container px-4 py-8 mx-auto space-y-6">
    <Skeleton className="w-64 h-10" />
    <Skeleton className="w-full h-16" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="w-full h-40 col-span-full md:col-span-2 lg:col-span-3" />
      <Skeleton className="w-full h-40 col-span-full md:col-span-2 lg:col-span-3" />
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} className="w-full h-40" />
      ))}
    </div>
  </div>
)

const SalesLiteMemo = memo(SalesLite)
export default SalesLiteMemo


