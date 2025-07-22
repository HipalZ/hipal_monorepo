import { memo, useState } from "react";
import useTimings from "../store/useTimings.ts";
import { useParams } from "react-router-dom";
import { useItemReports, useGetItemReportsCsv } from "@/hooks/useReportHook.ts";
import { Button } from "../ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
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
} from "lucide-react";
import ItemTableLayout from "./itemLayouts/ItemTableLayout.tsx";
import ItemCompactLayout from "./itemLayouts/ItemCompactLayout.tsx";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import useReports from "../store/useReports.ts";
import ItemCardLayout from "./itemLayouts/ItemCardLayout.tsx";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx";

type LayoutType = "cards" | "table" | "compact";

const MemoItemReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const itemReports = useReports((s) => s.itemReports);
  const { isPending, getItemReports } = useItemReports();
  const { isPending: isPendingCsv, getItemReportsCsv } = useGetItemReportsCsv();
  const [layout, setLayout] = useState<LayoutType>("cards");

  const hasReports = itemReports.length > 0;
  const hasItems =
    hasReports && itemReports.some((business) => business.items.length > 0);

  const getReports = () => {
    getItemReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getItemReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

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
                    <div className="text-sm text-muted-foreground">
                      {business.items.length} items
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No item data available for the selected date range.
                    </p>
                  ) : (
                    <>
                      {layout === "cards" && (
                        <ItemCardLayout business={business} />
                      )}
                      {layout === "table" && (
                        <ItemTableLayout business={business} />
                      )}
                      {layout === "compact" && (
                        <ItemCompactLayout business={business} />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Item" />}
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
            className: hasItems
              ? "w-full md:max-w-[14rem]"
              : "w-full md:max-w-[24rem]",
            disable: isPending,
            isBackButton: false,
            icon: isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            ),
          },
        ]}
      />
    </>
  );
};

const ItemReports = memo(MemoItemReports);
export default ItemReports;
