
import { memo, useState } from "react"
import useTimings from "../store/useTimings.ts"
import { useParams } from "react-router-dom"
import { useDiscountReports, useGetDiscountReportsCsv } from "@/hooks/useReportHook.ts"
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
  Percent,
} from "lucide-react"
import DiscountCardLayout from "./discountLayouts/DiscountCardLayout.tsx"
import DiscountTableLayout from "./discountLayouts/DiscountTableLayout.tsx"
import DiscountCompactLayout from "./discountLayouts/DiscountCompactLayout.tsx"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx"
import useReports from "../store/useReports.ts"
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx"

type LayoutType = "cards" | "table" | "compact"

const MemoDiscountReports = () => {
  const businessId = useParams().businessId
  const timeStampStart = useTimings((s) => s.timeStampStart)
  const timeStampEnd = useTimings((s) => s.timeStampEnd)
  const discountReports = useReports((s) => s.discountReports)
  const { isPending, getDiscountReports } = useDiscountReports()
  const { isPending: isPendingCsv, getDiscountReportsCsv } = useGetDiscountReportsCsv()
  const [layout, setLayout] = useState<LayoutType>("cards")

  const hasReports = discountReports.length > 0
  const hasDiscounts = hasReports && discountReports.some((business) => business.discounts.length > 0)

  const getReports = () => {
    getDiscountReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  const downloadReports = () => {
    getDiscountReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Discount Reports</h2>
          {hasDiscounts && (
            <div className="flex items-center gap-2">
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
            {discountReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5" />
                      {business.businessName}
                    </div>
                    <div className="text-sm text-muted-foreground">{business.discounts.length} discount types</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.discounts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No discount data available for the selected date range.
                    </p>
                  ) : (
                    <>
                      {layout === "cards" && <DiscountCardLayout business={business} />}
                      {layout === "table" && <DiscountTableLayout business={business} />}
                      {layout === "compact" && <DiscountCompactLayout business={business} />}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Discount" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          // Only show download button if reports exist and have discounts
          ...(hasDiscounts
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
            className: hasDiscounts ? "w-full md:max-w-[14rem]" : "w-full md:max-w-[24rem]",
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />,
          },
        ]}
      />
    </>
  )
}

const DiscountReports = memo(MemoDiscountReports)
export default DiscountReports
