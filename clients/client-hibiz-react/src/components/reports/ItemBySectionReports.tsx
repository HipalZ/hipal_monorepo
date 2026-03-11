import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BusinessItemBySectionReport } from '@/hooks/useReportHook';
import { useGetItemBySectionReportsExcel, useItemBySectionReports } from '@/hooks/useReportHook';
import { Download, Layers, RefreshCw, Search, TrendingUp, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton';
import useReports from '../store/useReports';
import useTimings from '../store/useTimings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatCurrency, formatNumber } from './itemLayouts/itemHelper';

const MemoItemBySectionReports = () => {
  const params = useParams();
  const businessId = params.businessId ?? '';

  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const itemBySectionReports = useReports((s) => s.itemBySectionReports);
  const { isPending, getItemBySectionReports } = useItemBySectionReports();
  const { isPending: isExcelPending, getItemBySectionReportsExcel } = useGetItemBySectionReportsExcel();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return itemBySectionReports;
    const q = searchQuery.toLowerCase().trim();
    return itemBySectionReports
      .map((b) => ({
        ...b,
        sections: b.sections
          .map((sec) => ({
            ...sec,
            items: sec.items.filter(
              (item) =>
                item.itemName?.toLowerCase().includes(q) ||
                sec.sectionName?.toLowerCase().includes(q),
            ),
          }))
          .filter((sec) => sec.items.length > 0),
      }))
      .filter((b) => b.sections.length > 0);
  }, [itemBySectionReports, searchQuery]);

  const hasReports = itemBySectionReports.length > 0;
  const hasItems = hasReports && itemBySectionReports.some((b) => b.sections.some((s) => s.items.length > 0));
  const hasFiltered = filteredReports.length > 0 && filteredReports.some((b) => b.sections.some((s) => s.items.length > 0));

  const payload = {
    from: timeStampStart,
    to: timeStampEnd,
    businessIds: businessId ? [businessId] : [],
  };
  const getReports = async () => {
    await getItemBySectionReports(payload);
  };
  const handleDownloadExcel = () => {
    getItemBySectionReportsExcel(payload);
  };

  const listToRender = searchQuery ? filteredReports : itemBySectionReports;

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Item by Areas</p>
            <p className="text-primary w-[60%] text-sm md:w-full">
              {listToRender[0]?.from} ~ {listToRender[0]?.to}
            </p>
          </h2>
        </div>

        <p className="text-muted-foreground text-sm">
          Items grouped by area (zone or kitchen). Only item-related columns are shown.
        </p>

        {hasItems && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by item or section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-muted absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {searchQuery && !hasFiltered ? (
              <Card className="w-full">
                <CardContent className="p-8 text-center">
                  <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No items found</h3>
                  <p className="text-muted-foreground mb-4">No items or sections match "{searchQuery}"</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              listToRender.map((business: BusinessItemBySectionReport) => (
                <Card key={business.businessId} className="w-full border-none !p-0 shadow-none">
                  <CardHeader className="w-full border-none p-0 pb-4 shadow-none">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Layers className="h-5 w-5" />
                      {business.businessName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="border-none !p-0 shadow-none">
                    {business.sections.length === 0 ? (
                      <p className="text-muted-foreground py-8 text-center">No section data for the selected date range.</p>
                    ) : (
                      <div className="space-y-6 rounded-md border">
                        {business.sections.map((section) => (
                          <div key={section.sectionId} className="border-t first:border-t-0">
                            <div className="bg-muted/60 flex items-center justify-between px-4 py-2">
                              <span className="text-sm font-semibold">
                                {business.reportFlow === 'zone' ? 'Zone' : 'Kitchen'}: {section.sectionName}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {section.items.length} item{section.items.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="font-semibold">Item Name</TableHead>
                                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                                  <TableHead className="text-right font-semibold">Amount</TableHead>
                                  <TableHead className="text-right font-semibold">Discount</TableHead>
                                  <TableHead className="text-right font-semibold">Tax</TableHead>
                                  <TableHead className="text-right font-semibold">Net Revenue</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {section.items.map((item, index) => (
                                  <TableRow key={`${item.categoryId}-${item.itemName}-${index}`} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                    <TableCell className="text-center">{formatNumber(item.itemCount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.discount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.tax)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(item.totalSales)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {!hasReports && !isPending && <EmptyStateInstructions text="Item by Areas" />}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          {
            text: isPending ? 'Generating...' : 'Generate Report',
            onClick: getReports,
            className: hasItems ? 'w-full md:max-w-[14rem]' : 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
          ...(hasItems
            ? [
                {
                  text: isExcelPending ? 'Downloading...' : 'Download Excel',
                  onClick: handleDownloadExcel,
                  className: 'w-full md:max-w-[14rem]',
                  disable: isExcelPending,
                  isBackButton: false,
                  icon: isExcelPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />,
                },
              ]
            : []),
        ]}
      />
    </>
  );
};

const ItemBySectionReports = memo(MemoItemBySectionReports);
export default ItemBySectionReports;
