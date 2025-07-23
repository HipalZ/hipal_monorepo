import { memo, useState, useMemo } from "react";
import useTimings from "../store/useTimings";
import { useParams } from "react-router-dom";
import { useItemReports, useGetItemReportsCsv } from "@/hooks/useReportHook";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  Package,
  RefreshCw,
  Download,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemTableLayout from "./itemLayouts/ItemTableLayout";
import ItemCompactLayout from "./itemLayouts/ItemCompactLayout";
import AdvancedBottomButton from "../atom/bottomButton/advancedBottomButton";
import useReports from "../store/useReports";
import ItemCardLayout from "./itemLayouts/ItemCardLayout";
import EmptyStateInstructions from "./categoryLayouts/EmptyStateInstructions";
import LayoutToggleButtons from "./LayoutToggleButtons";
import type { BusinessItemReport } from "@/hooks/useReportHook";

const MemoItemReports = () => {
  const businessId = useParams().businessId;
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const itemReports = useReports((s) => s.itemReports);
  const { isPending, getItemReports } = useItemReports();
  const { isPending: isPendingCsv, getItemReportsCsv } = useGetItemReportsCsv();
  const layout = useReports((s) => s.layoutType);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on search query
  const filteredItemReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return itemReports;
    }

    const query = searchQuery.toLowerCase().trim();

    return itemReports
      .map((business: BusinessItemReport) => ({
        ...business,
        items: business.items.filter(
          (item) =>
            item.itemName.toLowerCase().includes(query) ||
            item.categoryId.toLowerCase().includes(query),
        ),
      }))
      .filter((business) => business.items.length > 0);
  }, [itemReports, searchQuery]);

  const hasReports = itemReports.length > 0;
  const hasFilteredItems =
    filteredItemReports.length > 0 &&
    filteredItemReports.some((business) => business.items.length > 0);
  const hasItems =
    hasReports && itemReports.some((business) => business.items.length > 0);

  // Calculate total items for search results
  const totalFilteredItems = filteredItemReports.reduce(
    (total, business) => total + business.items.length,
    0,
  );
  const totalItems = itemReports.reduce(
    (total, business) => total + business.items.length,
    0,
  );

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

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Item Reports</h2>
          {hasItems && <LayoutToggleButtons />}
        </div>

        {/* Search Section */}
        {hasItems && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search items by name ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Search Results Summary */}
            {searchQuery && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {hasFilteredItems
                    ? `Found ${totalFilteredItems} item${
                        totalFilteredItems !== 1 ? "s" : ""
                      } matching "${searchQuery}"`
                    : `No items found matching "${searchQuery}"`}
                </span>
                {hasFilteredItems && (
                  <span>
                    {totalFilteredItems} of {totalItems} items
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {/* Show filtered results or no results message */}
            {searchQuery && !hasFilteredItems ? (
              <Card className="w-full">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    No items match your search for "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Display filtered or all results */
              (searchQuery ? filteredItemReports : itemReports).map(
                (business) => (
                  <Card key={business.businessId} className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          {business.businessName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {business.items.length} item
                          {business.items.length !== 1 ? "s" : ""}
                          {searchQuery && (
                            <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              filtered
                            </span>
                          )}
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
                ),
              )
            )}
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
