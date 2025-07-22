import { memo, useState } from "react";
import useTimings from "../store/useTimings.ts";
import { useParams } from "react-router-dom";
import { useCategoryReports, useGetReportsCsv } from "@/hooks/useReportHook.ts";
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
} from "lucide-react";
import CategoryCardLayout from "./categoryLayouts/CategoryCardLayout.tsx";
import CategoryTableLayout from "./categoryLayouts/CategoryTableLayout.tsx";
import CategoryCompactLayout from "./categoryLayouts/CategoryCompactLayout.tsx";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton.tsx";
import useReports from "../store/useReports.ts";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions.tsx";

type LayoutType = "cards" | "table" | "compact";

const MemoCategoryReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const categoryReports = useReports((s) => s.categoryReports);
  const { isPending, getCategoryReports } = useCategoryReports();
  const { isPending: isPendingCsv, getReportsCsv } = useGetReportsCsv();
  const [layout, setLayout] = useState<LayoutType>("cards");

  const hasReports = categoryReports.length > 0;
  const hasCategories =
    hasReports &&
    categoryReports.some((business) => business.categories.length > 0);

  const getReports = () => {
    getCategoryReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  const downloadReports = () => {
    getReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: [businessId],
    });
  };

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          {hasCategories && (
            <h2 className="text-2xl font-bold">Category Reports</h2>
          )}
          {hasCategories && (
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
            {categoryReports.map((business) => (
              <Card key={business.businessId} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {business.businessName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {business.categories.length} categories
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  {business.categories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No category data available for the selected date range.
                    </p>
                  ) : (
                    <>
                      {layout === "cards" && (
                        <CategoryCardLayout business={business} />
                      )}
                      {layout === "table" && (
                        <CategoryTableLayout business={business} />
                      )}
                      {layout === "compact" && (
                        <CategoryCompactLayout business={business} />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Category" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          ...(hasCategories
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
            className: hasCategories
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

const CategoryReports = memo(MemoCategoryReports);
export default CategoryReports;
