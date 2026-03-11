import type { ConsolidatedBusinessBlock } from '@/hooks/useReportHook';
import { useConsolidateReports } from '@/hooks/useReportHook';
import { Layers, RefreshCw, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton';
import useReports from '../store/useReports';
import useTimings from '../store/useTimings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import EmptyStateInstructions from './categoryLayouts/EmptyStateInstructions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { formatCurrency } from './itemLayouts/itemHelper';

const MemoConsolidatedReports = () => {
  const businessId = useParams().businessId ?? '';
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const consolidateReports = useReports((s) => s.consolidateReports);
  const { isPending, getConsolidateReports } = useConsolidateReports();

  const hasReports = consolidateReports.length > 0;

  const getReports = async () => {
    await getConsolidateReports({
      from: String(timeStampStart),
      to: String(timeStampEnd),
      businessIds: businessId ? [businessId] : [],
    });
  };

  return (
    <>
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <p>Consolidate Report</p>
            {hasReports && (
              <p className="text-primary w-[60%] text-sm md:w-full">
                {consolidateReports[0]?.from} ~ {consolidateReports[0]?.to}
              </p>
            )}
          </h2>
        </div>

        <p className="text-muted-foreground text-sm">
          Summary view: Net Sale, Gross Sale, Parent Category, Category, Payment Types, Dues, Tips. Same data as the Consolidated sheet in the Combined Excel download.
        </p>

        {hasReports && (
          <div className="space-y-6 pb-[5rem]">
            {consolidateReports.map((business: ConsolidatedBusinessBlock) => (
              <Card
                key={business.businessId}
                className="w-full border-none shadow-none"
              >
                <CardHeader className="border-none p-0 pb-4 shadow-none">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Layers className="h-5 w-5" />
                    {business.businessName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-none p-0 shadow-none">
                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h3 className="mb-3 font-semibold">Summary</h3>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Sale</span>
                        <span className="font-medium">{formatCurrency(business.summary.netSale)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gross Sale</span>
                        <span className="font-medium">{formatCurrency(business.summary.grossSale)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Orders (Paid)</span>
                        <span className="font-medium">{business.summary.totalOrdersPaid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dues Get Back</span>
                        <span className="font-medium">{formatCurrency(business.summary.duesGetBack)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending Dues Subtotal</span>
                        <span className="font-medium">{formatCurrency(business.summary.pendingDuesSubtotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Category */}
                  {business.parentCategories.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Parent Category</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parent Category</TableHead>
                            <TableHead className="text-right">Sub Total</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Net Amount</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Gross Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {business.parentCategories.map((row) => (
                            <TableRow key={row.parentCategoryName}>
                              <TableCell className="font-medium">{row.parentCategoryName}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.subTotal)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.discount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.netAmount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.tax)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.grossAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Category */}
                  {business.categories.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Category</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Sub Total</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Net Amount</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Gross Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {business.categories.map((row) => (
                            <TableRow key={row.categoryName}>
                              <TableCell className="font-medium">{row.categoryName}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.subTotal)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.discountAmount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.netAmount)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.tax)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.grossAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Payment Types */}
                  {business.paymentTypes.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Payment Types</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Total Bills</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {business.paymentTypes.map((row) => (
                            <TableRow key={row.paymentType}>
                              <TableCell className="font-medium">{row.paymentType}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                              <TableCell className="text-right">{row.totalBills}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Dues */}
                  <div>
                    <h3 className="mb-2 font-semibold">Dues</h3>
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Dues</span>
                        <span>{formatCurrency(business.dues.totalDues)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Dues Get Back</span>
                        <span>{formatCurrency(business.dues.totalDuesGetBack)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dues Orders Count</span>
                        <span>{business.dues.duesOrdersCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complimentary & Discounts */}
                  <div>
                    <h3 className="mb-2 font-semibold">Complimentary & Discounts</h3>
                    <div className="rounded-lg border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total complimentary</span>
                        <span>{formatCurrency(business.complimentaryDiscounts.totalComplementary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total discounts (all)</span>
                        <span>{formatCurrency(business.complimentaryDiscounts.totalDiscountsAll)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {business.tips.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Tips</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Payment Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Total Bills</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {business.tips.map((row) => (
                            <TableRow key={row.paymentType}>
                              <TableCell className="font-medium">{row.paymentType}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                              <TableCell className="text-right">{row.totalBills}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasReports && !isPending && (
          <EmptyStateInstructions text="Consolidate Report" />
        )}
      </div>

      <AdvancedBottomButton
        maxWidth="28rem"
        fixed={true}
        buttons={[
          {
            text: isPending ? 'Loading...' : 'Generate Report',
            onClick: getReports,
            className: 'w-full md:max-w-[24rem]',
            disable: isPending,
            isBackButton: false,
            icon: isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />,
          },
        ]}
      />
    </>
  );
};

const ConsolidatedReports = memo(MemoConsolidatedReports);
export default ConsolidatedReports;
