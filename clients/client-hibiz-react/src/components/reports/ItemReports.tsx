import { memo, useState } from "react"
import useTimings from "../store/useTimings.ts"
import { useParams } from "react-router-dom"
import { useItemReports, useGetItemReportsCsv } from "@/hooks/useReportHook.ts"
import { Button } from "../ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx"
import {
  TrendingUp,
  Package,
  Grid3X3,
  List,
  LayoutGrid,
  RefreshCw,
  Download,
  Calendar,
  MousePointer,
  BarChart3,
} from "lucide-react"
import ItemTableLayout from "./itemLayouts/ItemTableLayout.tsx"
import ItemCompactLayout from "./itemLayouts/ItemCompactLayout.tsx"
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx"
import useReports from "../store/useReports.ts"
import ItemCardLayout from "./itemLayouts/ItemCardLayout.tsx"

type LayoutType = "cards" | "table" | "compact"

const MemoItemReports = () => {
  const businessId = useParams().businessId
  const timeStampStart = useTimings((s) => s.timeStampStart)
  const timeStampEnd = useTimings((s) => s.timeStampEnd)
  const itemReports = useReports((s) => s.itemReports)
  const { isPending, getItemReports } = useItemReports()
  const { isPending: isPendingCsv, getItemReportsCsv } = useGetItemReportsCsv()
  const [layout, setLayout] = useState<LayoutType>("cards")

  const hasReports = itemReports.length > 0
  const hasItems = hasReports && itemReports.some((business) => business.items.length > 0)

  const getReports = () => {
    getItemReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  const downloadReports = () => {
    getItemReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    })
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Item Reports</h2>
          {hasItems && (
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
            {itemReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {business.businessName}
                    </div>
                    <div className="text-sm text-muted-foreground">{business.items.length} items</div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No item data available for the selected date range.
                    </p>
                  ) : (
                    <>
                      {layout === "cards" && <ItemCardLayout business={business} />}
                      {layout === "table" && <ItemTableLayout business={business} />}
                      {layout === "compact" && <ItemCompactLayout business={business} />}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-4">Generate Your Item Report</h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Follow these simple steps to generate your item analytics report
              </p>

              {/* Step-by-step instructions */}
              <div className="w-full max-w-md space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Select Date Range</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose your desired date range using the date picker above
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MousePointer className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">Generate Report</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click the "Generate Report" button below to fetch your data
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">View Analytics</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Analyze your item performance with detailed insights
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasItems
            ? [
                {
                  text: isPendingCsv ? "Downloading..." : "Downloads CSV",
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
            className: hasItems ? "w-full md:max-w-[14rem]" : "w-full md:max-w-[24rem]",
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />,
          },
        ]}
      />
    </>
  )
}

const ItemReports = memo(MemoItemReports)
export default ItemReports
