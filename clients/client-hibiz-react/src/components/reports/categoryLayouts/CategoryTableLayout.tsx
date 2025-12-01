import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx';
import type { BusinessCategoryReport, CategoryReport } from '@/hooks/useReportHook.ts';
import { Package } from 'lucide-react';
import { memo, useMemo, useRef, useState, type ReactNode } from 'react';
import { formatCurrency, formatNumber } from './categoryHelper.ts';

const highlightText = (text: string, query: string): ReactNode => {
  if (!query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: ReactNode[] = [];

  let currentIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery);

  let key = 0;

  while (matchIndex !== -1) {
    // normal text before match
    if (matchIndex > currentIndex) {
      parts.push(<span key={`text-${key++}`}>{text.slice(currentIndex, matchIndex)}</span>);
    }

    // highlighted match
    const matchText = text.slice(matchIndex, matchIndex + lowerQuery.length);
    parts.push(
      <span key={`match-${key++}`} className="text-foreground rounded-sm bg-yellow-200/80 px-0.5 font-semibold dark:bg-yellow-500/40">
        {matchText}
      </span>,
    );

    currentIndex = matchIndex + lowerQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, currentIndex);
  }

  // remaining text after last match
  if (currentIndex < text.length) {
    parts.push(<span key={`rest-${key++}`}>{text.slice(currentIndex)}</span>);
  }

  return <span>{parts}</span>;
};

interface CategoryCardLayoutProps {
  business: BusinessCategoryReport;
}

type PerformanceFilter = 'all' | 'top' | 'bottom';

// ---------- main component ----------

const MemoCategoryTableLayout = ({ business }: CategoryCardLayoutProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');

  const { totals, topCategory, lowestCategory, displayCategories } = useMemo(() => {
    if (!business.categories || business.categories.length === 0) {
      return {
        totals: { amount: 0, discount: 0, tax: 0, net: 0 },
        topCategory: null as (CategoryReport & { netRevenue: number }) | null,
        lowestCategory: null as (CategoryReport & { netRevenue: number }) | null,
        displayCategories: [] as (CategoryReport & { netRevenue: number })[],
      };
    }

    const enriched = business.categories.map((c) => {
      const netRevenue = (c.totalAmount || 0) - (c.totalDiscount || 0) + (c.totalTax || 0);
      return { ...c, netRevenue };
    });

    const totals = enriched.reduce(
      (acc, c) => {
        acc.amount += c.totalAmount || 0;
        acc.discount += c.totalDiscount || 0;
        acc.tax += c.totalTax || 0;
        acc.net += c.netRevenue || 0;
        return acc;
      },
      { amount: 0, discount: 0, tax: 0, net: 0 },
    );

    // find top & lowest by net revenue
    let top: (CategoryReport & { netRevenue: number }) | null = enriched[0];
    let low: (CategoryReport & { netRevenue: number }) | null = enriched[0];

    for (let i = 1; i < enriched.length; i++) {
      const c = enriched[i];
      if (c.netRevenue > (top?.netRevenue ?? 0)) top = c;
      if (c.netRevenue < (low?.netRevenue ?? 0)) low = c;
    }

    let filtered = enriched;

    // search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((c) => c.categoryName.toLowerCase().includes(q));
    }

    // performance filter
    if (performanceFilter === 'top' && top) {
      filtered = [top];
    } else if (performanceFilter === 'bottom' && low) {
      filtered = [low];
    }

    return {
      totals,
      topCategory: top,
      lowestCategory: low,
      displayCategories: filtered,
    };
  }, [business.categories, searchTerm, performanceFilter]);

  return (
    <div className="space-y-4">
      {/* Summary + filters */}
      <Card className="border-none !p-0 shadow-none">
        <CardContent className="-mt-4 flex flex-col gap-4 p-0">
          {/* left: totals + best/worst */}
          <div className="w-full max-w-xl rounded-md border text-xs md:text-sm">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground w-1/2 font-medium">Total Amount</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totals.amount)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="text-muted-foreground font-medium">Total Tax</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(totals.tax)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold text-emerald-700">Net Revenue</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-700">{formatCurrency(totals.net)}</TableCell>
                </TableRow>

                {topCategory && (
                  <TableRow>
                    <TableCell className="font-medium text-emerald-700">Top Category</TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="truncate">{topCategory.categoryName}</span>
                        <span className="text-muted-foreground text-[11px]">{formatCurrency(topCategory.netRevenue)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {lowestCategory && (
                  <TableRow>
                    <TableCell className="font-medium text-red-700">Lowest Category</TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="truncate">{lowestCategory.categoryName}</span>
                        <span className="text-muted-foreground text-[11px]">{formatCurrency(lowestCategory.netRevenue)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* right: search + perf filter */}
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            <Input
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-xs text-sm"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={performanceFilter === 'all' ? 'default' : 'outline'}
                className="text-sm"
                onClick={() => setPerformanceFilter('all')}
              >
                All
              </Button>
              <Button
                type="button"
                size="sm"
                variant={performanceFilter === 'top' ? 'default' : 'outline'}
                className="text-sm"
                onClick={() => setPerformanceFilter('top')}
              >
                Max Revenue
              </Button>
              <Button
                type="button"
                size="sm"
                variant={performanceFilter === 'bottom' ? 'default' : 'outline'}
                className="text-xs"
                onClick={() => setPerformanceFilter('bottom')}
              >
                Lowest Revenue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable content */}
      <div ref={contentRef} className="rounded-md border">
        {/* Print-only header */}
        <div className="hidden border-b p-6 print:block">
          <h1 className="text-center text-2xl font-bold">Category Report</h1>
          <p className="text-muted-foreground mt-2 text-center">Business: {business.businessName || 'N/A'}</p>
          <p className="text-muted-foreground text-center">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Category Name</TableHead>
              <TableHead className="text-center font-semibold">Items Count</TableHead>
              <TableHead className="text-right font-semibold">Total Amount</TableHead>
              <TableHead className="text-right font-semibold">Discount</TableHead>
              <TableHead className="text-right font-semibold">Tax</TableHead>
              <TableHead className="text-right font-semibold">Net Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCategories.map((category) => (
              <TableRow key={category.categoryId} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="text-muted-foreground h-4 w-4" />
                    {highlightText(category.categoryName, searchTerm)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{formatNumber(category.categoryCount)}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">{formatCurrency(category.totalAmount)}</TableCell>
                <TableCell className="text-right font-semibold text-orange-600">{formatCurrency(category.totalDiscount)}</TableCell>
                <TableCell className="text-right font-semibold text-blue-600">{formatCurrency(category.totalTax)}</TableCell>
                <TableCell className="text-right text-lg font-bold">
                  {formatCurrency(category.totalAmount - category.totalDiscount + category.totalTax)}
                </TableCell>
              </TableRow>
            ))}

            {displayCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-8 text-center text-sm">
                  No categories found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const CategoryTableLayout = memo(MemoCategoryTableLayout);
export default CategoryTableLayout;
