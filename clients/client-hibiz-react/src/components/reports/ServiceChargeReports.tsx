import { memo, useState } from "react"
import useTimings from "../store/useTimings.ts"
import { useParams } from "react-router-dom"
import { useServiceChargeReports, useGetServiceChargeReportsCsv } from "@/hooks/useReportHook.ts"
import { Button } from "../ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx"
import {
  TrendingUp,
  Grid3X3,
  List,
  LayoutGrid,
  RefreshCw,
  Download,
  Calendar,
  MousePointer,
  BarChart3,
  CreditCard,
  IndianRupee,
} from "lucide-react"
import ServiceChargeCardLayout from "./serviceChargeLayouts/ServiceChargeCardLayout.tsx"
import ServiceChargeTableLayout from "./serviceChargeLayouts/ServiceChargeTableLayout.tsx"
import ServiceChargeCompactLayout from "./serviceChargeLayouts/ServiceChargeCompactLayout.tsx"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx"
import useReports from "../store/useReports.ts"
import { formatCurrency } from "./serviceChargeLayouts/serviceChargeHelper.ts"
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx"

type LayoutType = "cards" | "table" | "compact"

const MemoServiceChargeReports = () => {
  const businessId = useParams().businessId
  const timeStampStart = useTimings((s) => s.timeStampStart)
  const timeStampEnd = useTimings((s) => s.timeStampEnd)
  const serviceChargeReports = useReports((s) => s.serviceChargeReports)
  const { isPending, getServiceChargeReports } = useServiceChargeReports()
  const { isPending: isPendingCsv, getServiceChargeReportsCsv } = useGetServiceChargeReportsCsv()
  const [layout, setLayout] = useState<LayoutType>("cards")

  const hasReports = serviceChargeReports.length > 0
  const totalServiceCharge = hasReports
    ? serviceChargeReports.reduce((acc, report) => acc + report.serviceCharge, 0)
    : 0

  const getReports = () => {
    getServiceChargeReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  const downloadReports = () => {
    getServiceChargeReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Service Charge Reports</h2>
          {hasReports && (
            <div className="flex items-center gap-2">
              {/* Summary Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg border">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  Total: {formatCurrency(totalServiceCharge)}
                </span>
              </div>
              {/* Layout Toggle Buttons */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={layout === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("cards")}
                  className="h-8 px-2"
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("table")}
                  className="h-8 px-2"
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={layout === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("compact")}
                  className="h-8 px-2"
                  title="Compact View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Service Charge Summary
                  </div>
                  <div className="text-sm text-muted-foreground">{serviceChargeReports.length} business(es)</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {serviceChargeReports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No service charge data available for the selected date range.
                  </p>
                ) : (
                  <>
                    {layout === "cards" && <ServiceChargeCardLayout reports={serviceChargeReports} />}
                    {layout === "table" && <ServiceChargeTableLayout reports={serviceChargeReports} />}
                    {layout === "compact" && <ServiceChargeCompactLayout reports={serviceChargeReports} />}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Service Charge" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          // Only show download button if reports exist
          ...(hasReports
            ? [
                {
                  text: isPendingCsv ? "Downloading..." : "Download CSV",
                  onClick: downloadReports,
                  className: "w-full md:max-w-[12rem] !bg-purple-600",
                  disable: isPendingCsv,
                  isBackButton: false,
                  icon: isPendingCsv ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  ),
                },
              ]
            : []),
          {
            text: isPending ? "Generating..." : "Generate Report",
            onClick: getReports,
            className: hasReports ? "w-full md:max-w-[14rem]" : "w-full md:max-w-[24rem]",
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />,
          },
        ]}
      />
    </>
  )
}

const ServiceChargeReports = memo(MemoServiceChargeReports)
export default ServiceChargeReports
