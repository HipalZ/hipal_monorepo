import { memo, useState } from "react";
import useTimings from "../store/useTimings.ts";
import { useParams } from "react-router-dom";
import {
  useAddonReports,
  useGetAddonReportsCsv,
} from "@/hooks/useReportHook.ts";
import { Button } from "../ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
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
  Plus,
} from "lucide-react";
import AddonCardLayout from "./addOnLayouts/AddCardLayout.tsx";
import AddonTableLayout from "./addOnLayouts/AddonTableLayout.tsx";
import AddonCompactLayout from "./addOnLayouts/AddOnCompactLayout.tsx";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import useReports from "../store/useReports.ts";

type LayoutType = "cards" | "table" | "compact";

const MemoAddonReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const addonReports = useReports((s) => s.addonReports);
  const { isPending, getAddonReports } = useAddonReports();
  const { isPending: isPendingCsv, getAddonReportsCsv } =
    useGetAddonReportsCsv();
  const [layout, setLayout] = useState<LayoutType>("cards");

  const hasReports = addonReports.length > 0;
  const hasAddons =
    hasReports && addonReports.some((business) => business.addOns.length > 0);

  const getReports = () => {
    getAddonReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getAddonReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Addon Reports</h2>
          {hasAddons && (
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
            {addonReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      {business.businessName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {business.addOns.length} addon types
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.addOns.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No addon data available for the selected date range.
                    </p>
                  ) : (
                    <>
                      {layout === "cards" && (
                        <AddonCardLayout business={business} />
                      )}
                      {layout === "table" && (
                        <AddonTableLayout business={business} />
                      )}
                      {layout === "compact" && (
                        <AddonCompactLayout business={business} />
                      )}
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
              <h3 className="text-xl font-semibold mb-4">
                Generate Your Addon Report
              </h3>
              <p className="text-muted-foreground text-center mb-8 max-w-md">
                Follow these simple steps to generate your addon analytics
                report
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
                      Click the "Generate Report" button below to fetch your
                      data
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
                      Analyze your addon performance with detailed insights
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
          // Only show download button if reports exist and have addons
          ...(hasAddons
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
            className: hasAddons
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

const AddonReports = memo(MemoAddonReports);
export default AddonReports;
