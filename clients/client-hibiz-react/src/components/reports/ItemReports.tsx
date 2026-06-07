import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetAllKitchenByBusiness } from '@/hooks/useKItchenHook';
import type { BusinessItemReport } from '@/hooks/useReportHook';
import { useGetItemReportsCsv, useItemReports } from '@/hooks/useReportHook';
import { Download, Package, RefreshCw, Search, TrendingUp, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton';
import useReports from '../store/useReports';
import useTimings from '../store/useTimings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions';
import ItemCompactLayout from './itemLayouts/ItemCompactLayout';
import ItemTableLayout from './itemLayouts/ItemTableLayout';
import LayoutToggleButtons from './LayoutToggleButtons';

const MemoItemReports = () => {
  const params = useParams();
  const businessId = params.businessId ?? '';

  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const itemReports = useReports((s) => s.itemReports);
  const { isPending, getItemReports } = useItemReports();
  const { isPending: isPendingCsv, getItemReportsCsv } = useGetItemReportsCsv();
  const layout = useReports((s) => s.layoutType);
  const { kitchenByBusinessData: kitchenData } = useGetAllKitchenByBusiness();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search query
  const filteredItemReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return itemReports;
    }

    const query = searchQuery?.toLowerCase().trim();

    return itemReports
      .map((business: BusinessItemReport) => ({
        ...business,
        items: business?.items?.filter(
          (item) =>
            item?.itemName?.toLowerCase().includes(query) ||
            item?.categoryId?.toLowerCase().includes(query) ||
            (item?.zoneNames?.some((z) => z.toLowerCase().includes(query))) ||
            (item?.kitchenName?.toLowerCase().includes(query)),
        ),
      }))
      .filter((business) => business.items.length > 0);
  }, [itemReports, searchQuery]);

  const hasReports = itemReports.length > 0;
  const hasFilteredItems = filteredItemReports.length > 0 && filteredItemReports.some((business) => business.items.length > 0);
  const hasItems = hasReports && itemReports.some((business) => business.items.length > 0);

  // Calculate total items for search results
  const totalFilteredItems = filteredItemReports.reduce((total, business) => total + business.items.length, 0);
  const totalItems = itemReports.reduce((total, business) => total + business.items.length, 0);

  const getReports = async () => {
    await getItemReports({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: businessId ? [businessId] : [],
    });
  };

  const downloadReports = async () => {
    await getItemReportsCsv({
      from: timeStampStart,
      to: timeStampEnd,
      businessIds: businessId ? [businessId] : [],
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const listToRender = searchQuery ? filteredItemReports : itemReports;

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Item Reports</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {listToRender[0]?.from} ~ {listToRender[0]?.to}
            </p>
          </h2>
          {hasItems && <LayoutToggleButtons />}
        </div>

        {/* Search Section */}
        {hasItems && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search items by name ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="hover:bg-muted absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results Summary */}
            {searchQuery && (
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <span>
                  {hasFilteredItems
                    ? `Found ${totalFilteredItems} item${totalFilteredItems !== 1 ? 's' : ''} matching "${searchQuery}"`
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
                  <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No items found</h3>
                  <p className="text-muted-foreground mb-4">No items match your search for "{searchQuery}"</p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              listToRender.map((business) => (
                <Card key={business.businessId} className="w-full border-none !p-0 shadow-none">
                  <CardHeader className="w-full border-none p-0 pb-6 shadow-none">
                    <CardTitle className="flex items-center justify-start gap-4 text-lg font-semibold">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {business.businessName}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {business.items.length} item
                        {business.items.length !== 1 ? 's' : ''}
                        {searchQuery && <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-1 text-xs">filtered</span>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="border-none !p-0 shadow-none">
                    {business.items.length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center">No item data available for the selected date range.</p>
                    ) : (
                      <>
                        {layout === 'table' && <ItemTableLayout business={business} searchQuery={searchQuery} kitchenData={kitchenData || []} />}
                        {layout === 'compact' && <ItemCompactLayout business={business} />}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
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
                  text: isPendingCsv ? 'Preparing Report...' : 'Download Report',
                  onClick: downloadReports,
                  className: 'w-full md:max-w-[12rem]',
                  color: '#2563eb',
                  disable: isPendingCsv,
                  isBackButton: false,
                  icon: isPendingCsv ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
                },
              ]
            : []),
          {
            text: isPending ? 'Generating...' : 'Generate Report',
            onClick: getReports,
            className: hasItems ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const ItemReports = memo(MemoItemReports);
export default ItemReports;
