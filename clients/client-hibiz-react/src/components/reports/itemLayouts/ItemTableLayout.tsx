import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BusinessItemReport, ItemReport } from '@/hooks/useReportHook';
import { Package2 } from 'lucide-react';
import { memo, useMemo, useRef, type ReactNode } from 'react';
import { calculateNetRevenue, formatCurrency, formatNumber } from './itemHelper';

interface KitchenInfo {
  _id: string;
  name: string;
}

interface ItemTableLayoutProps {
  business: BusinessItemReport;
  searchQuery?: string;
  kitchenData?: KitchenInfo[];
}

const highlightText = (text: string, query: string | undefined): ReactNode => {
  if (!query || !query.trim()) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: ReactNode[] = [];

  let currentIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery);
  let key = 0;

  while (matchIndex !== -1) {
    if (matchIndex > currentIndex) {
      parts.push(<span key={`text-${key++}`}>{text.slice(currentIndex, matchIndex)}</span>);
    }

    const matchText = text.slice(matchIndex, matchIndex + lowerQuery.length);
    parts.push(
      <span key={`match-${key++}`} className="text-foreground rounded-sm bg-yellow-200/80 px-0.5 font-semibold dark:bg-yellow-500/40">
        {matchText}
      </span>,
    );

    currentIndex = matchIndex + lowerQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, currentIndex);
  }

  if (currentIndex < text.length) {
    parts.push(<span key={`rest-${key++}`}>{text.slice(currentIndex)}</span>);
  }

  return <span>{parts}</span>;
};

const MemoItemTableLayout = ({ business, searchQuery, kitchenData = [] }: ItemTableLayoutProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const { totals, topItem, lowestItem, kitchenSummary, topKitchen, itemsByKitchen } = useMemo(() => {
    if (!business.items || business.items.length === 0) {
      return {
        totals: { qty: 0, amount: 0, discount: 0, tax: 0, net: 0 },
        topItem: null as (ItemReport & { netRevenue: number }) | null,
        lowestItem: null as (ItemReport & { netRevenue: number }) | null,
        kitchenSummary: [] as {
          kitchenId: string;
          kitchenName: string;
          qty: number;
          net: number;
        }[],
        topKitchen: null as {
          kitchenId: string;
          kitchenName: string;
          qty: number;
          net: number;
        } | null,
        itemsByKitchen: [] as {
          kitchenId: string;
          kitchenName: string;
          items: (ItemReport & { netRevenue: number })[];
        }[],
      };
    }

    const enriched = business.items.map((item) => {
      const netRevenue = calculateNetRevenue(
        item.amount,
        item.discount,
        item.tax,
        item.totalSales,
      );
      return { ...item, netRevenue };
    });

    const totals = enriched.reduce(
      (acc, item) => {
        acc.qty += item.itemCount || 0;
        acc.amount += item.amount || 0;
        acc.discount += item.discount || 0;
        acc.tax += item.tax || 0;
        acc.net += item.netRevenue || 0;
        return acc;
      },
      { qty: 0, amount: 0, discount: 0, tax: 0, net: 0 },
    );

    let top: (ItemReport & { netRevenue: number }) | null = enriched[0];
    let low: (ItemReport & { netRevenue: number }) | null = enriched[0];

    for (let i = 1; i < enriched.length; i++) {
      const it = enriched[i];
      if (it.netRevenue > (top?.netRevenue ?? 0)) top = it;
      if (it.netRevenue < (low?.netRevenue ?? 0)) low = it;
    }

    // Kitchen-wise summary + items grouping
    const kitchenMap: Record<
      string,
      {
        kitchenId: string;
        kitchenName: string;
        qty: number;
        net: number;
        items: (ItemReport & { netRevenue: number })[];
      }
    > = {};

    for (const it of enriched) {
      const kid = (it as any).kitchenId || 'unknown';
      const name = kitchenData.find((k) => k._id === kid)?.name || 'Unknown Kitchen';

      if (!kitchenMap[kid]) {
        kitchenMap[kid] = {
          kitchenId: kid,
          kitchenName: name,
          qty: 0,
          net: 0,
          items: [],
        };
      }

      kitchenMap[kid].qty += it.itemCount || 0;
      kitchenMap[kid].net += it.netRevenue || 0;
      kitchenMap[kid].items.push(it);
    }

    const kitchenSummary = Object.values(kitchenMap).map(({ kitchenId, kitchenName, qty, net }) => ({
      kitchenId,
      kitchenName,
      qty,
      net,
    }));

    const itemsByKitchen = Object.values(kitchenMap);

    // Top kitchen by quantity (most items sold)
    let topKitchen = kitchenSummary.length > 0 ? kitchenSummary[0] : null;

    for (let i = 1; i < kitchenSummary.length; i++) {
      const k = kitchenSummary[i];
      if (k.qty > (topKitchen?.qty ?? 0)) {
        topKitchen = k;
      }
    }

    return { totals, topItem: top, lowestItem: low, kitchenSummary, topKitchen, itemsByKitchen };
  }, [business.items, kitchenData]);

  return (
    <div className="space-y-4">
      {/* Summary table */}
      <div className="w-full max-w-xl rounded-md border text-xs md:text-sm">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-muted-foreground w-1/2 font-medium">Total Quantity</TableCell>
              <TableCell className="text-right font-semibold">{formatNumber(totals.qty)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-muted-foreground font-medium">Total Amount</TableCell>
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

            {topItem && (
              <TableRow>
                <TableCell className="font-medium text-emerald-700">Top Item</TableCell>
                <TableCell className="text-right font-semibold">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="truncate">{topItem.itemName}</span>
                    <span className="text-muted-foreground text-[11px]">{formatCurrency((topItem as any).netRevenue as number)}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {lowestItem && (
              <TableRow>
                <TableCell className="font-medium text-red-700">Lowest Item</TableCell>
                <TableCell className="text-right font-semibold">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="truncate">{lowestItem.itemName}</span>
                    <span className="text-muted-foreground text-[11px]">{formatCurrency((lowestItem as any).netRevenue as number)}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Kitchen-wise summary */}
      {kitchenSummary.length > 0 && (
        <div className="w-full max-w-xl rounded-md border text-xs md:text-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Kitchen</TableHead>
                <TableHead className="text-right font-semibold">Total Quantity</TableHead>
                <TableHead className="text-right font-semibold">Net Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kitchenSummary.map((k) => (
                <TableRow key={k.kitchenId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-between gap-2">
                      <span>{k.kitchenName}</span>
                      {topKitchen && k.kitchenId === topKitchen.kitchenId && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Top kitchen</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatNumber(k.qty)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(k.net)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Printable / detailed content grouped by kitchen */}
      <div ref={contentRef} className="rounded-md border">
        {/* Print Header - Only visible when printing */}
        <div className="hidden border-b p-6 print:block">
          <h1 className="text-center text-2xl font-bold">Item Report</h1>
          <p className="text-muted-foreground mt-2 text-center">Business: {business.businessName || 'N/A'}</p>
          <p className="text-muted-foreground text-center">Generated on: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>

        {itemsByKitchen.map((kitchen) => (
          <div key={kitchen.kitchenId} className="border-t first:border-t-0">
            {/* Kitchen header row */}
            <div className="bg-muted/60 flex items-center justify-between px-4 py-2">
              <span className="text-sm font-semibold">Kitchen: {kitchen.kitchenName}</span>
              <span className="text-muted-foreground text-xs">
                {kitchen.items.length} item{kitchen.items.length !== 1 ? 's' : ''}
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
                {kitchen.items.map((item, index) => (
                  <TableRow
                    key={`${item.categoryId}-${item.itemName}-${index}-${kitchen.kitchenId}`}
                    className="hover:bg-muted/50 print:hover:bg-transparent"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package2 className="text-muted-foreground h-4 w-4" />
                        <span className="max-w-[200px] truncate">{highlightText(item.itemName, searchQuery)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="print:border-gray-400">
                        {formatNumber(item.itemCount)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600 print:text-black">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right font-semibold text-orange-600 print:text-black">{formatCurrency(item.discount)}</TableCell>
                    <TableCell className="text-right font-semibold text-blue-600 print:text-black">{formatCurrency(item.tax)}</TableCell>
                    <TableCell className="text-right text-lg font-bold print:text-black">
                      {formatCurrency(calculateNetRevenue(item.amount, item.discount, item.tax, item.totalSales))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        {/* Print Footer - Only visible when printing */}
        <div className="hidden border-t p-6 print:block">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>Total Items: {business.items.length}</span>
            <span>
              Total Revenue:{' '}
              {formatCurrency(business.items.reduce((sum, item) => sum + calculateNetRevenue(item.amount, item.discount, item.tax, item.totalSales), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemTableLayout = memo(MemoItemTableLayout);
export default ItemTableLayout;
