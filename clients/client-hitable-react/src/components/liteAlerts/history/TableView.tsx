import type { IExistingPayments } from '@/components/types/sales.types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { hideMiddleNumbers } from '@/lib/utils';
import { IndianRupee, Percent, Receipt, Table2, Wallet } from 'lucide-react';
import { MdTableBar } from 'react-icons/md';

interface TableViewProps {
  data: IExistingPayments[];
  onRowClick: (data: IExistingPayments) => void;
}

const formatBillDateTime = (item: IExistingPayments) => {
  const raw = (item as any)?.date ?? item?.order_id?.date ?? item?.createdAt;
  if (!raw) return '';
  const d = new Date(Number(raw));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export function TableView({ data, onRowClick }: TableViewProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Receipt className="h-3 w-3" />
                Bill / Table
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1.5 text-xs font-semibold">Date &amp; Time</div>
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Captain</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
                <IndianRupee className="h-3 w-3" />
                Bill Value
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
                <Percent className="h-3 w-3" />
                Discount
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
                <Wallet className="h-3 w-3" />
                Collected / Mode
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => {
            const totalDiscount = (item?.claimedCoins ?? 0) + (item?.discount ?? 0) + (item?.couponDiscount ?? 0);

            const baseBillValue = item?.order_id?.billValue ?? item?.billValue ?? 0;
            const billAfterDiscount = Math.max(baseBillValue - totalDiscount, 0);
            const finalTotal = item?.order_id?.total ?? item?.total ?? baseBillValue;

            const isSplit = item?.paymentMode === 'split' || item?.mode === 'split';
            const modeLabel = item?.paymentMode || item?.mode || 'N/A';
            const splitModes = Array.isArray(item?.splitModes) ? item.splitModes : [];

            const dateStr = formatBillDateTime(item);

            return (
              <TableRow key={item._id} className="hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => onRowClick(item)}>
                {/* Bill + Table */}
                <TableCell className="align-top text-xs font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                      <Receipt className="h-3 w-3" />#{item?.billInvoice}
                    </span>
                    {item?.tableName && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                        <MdTableBar className="h-3 w-3" />
                        {item.tableName}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Date & Time */}
                <TableCell className="align-top text-xs text-slate-600 dark:text-slate-300">{dateStr}</TableCell>

                {/* Customer */}
                <TableCell className="align-top text-sm">
                  <div className="font-semibold">{item?.userId?.name?.trim() || 'Customer'}</div>
                  {item?.userId?.phone && <div className="text-xs text-slate-500 dark:text-slate-400">{hideMiddleNumbers(item.userId.phone)}</div>}
                </TableCell>

                {/* Captain */}
                <TableCell className="align-top text-sm">{item?.waiterName || '-'}</TableCell>

                {/* Bill Value (original vs after discount) */}
                <TableCell className="text-right align-top text-sm">
                  {totalDiscount > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400 line-through dark:text-slate-500">₹{baseBillValue.toFixed(2)}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">₹{billAfterDiscount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="font-semibold text-slate-900 dark:text-slate-50">₹{baseBillValue.toFixed(2)}</span>
                  )}
                </TableCell>

                {/* Discount */}
                <TableCell className="text-right align-top text-sm">
                  {totalDiscount > 0 ? (
                    <span className="font-semibold text-rose-500 dark:text-rose-400">-₹{totalDiscount.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">No discount</span>
                  )}
                </TableCell>

                {/* Collected + Mode(s) */}
                <TableCell className="text-right align-top text-sm">
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{finalTotal.toFixed(2)}</span>

                    {/* Primary mode badge */}
                    <Badge
                      variant="outline"
                      className="border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                    >
                      {modeLabel}
                    </Badge>

                    {/* Split table (if split) */}
                    {isSplit && splitModes.length > 0 && (
                      <div className="mt-1 w-full max-w-[220px] rounded-md border border-slate-200 bg-white text-[11px] dark:border-slate-700 dark:bg-slate-900">
                        <div className="border-b border-slate-200 bg-slate-50 px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Split Payment
                        </div>
                        <div className="grid grid-cols-[1.1fr_0.9fr] border-b border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <span>Mode</span>
                          <span className="text-right">Amount (₹)</span>
                        </div>
                        {splitModes.map((m: any) => (
                          <div
                            key={m._id}
                            className="grid grid-cols-[1.1fr_0.9fr] border-t border-slate-100 px-2 py-1 text-[11px] text-slate-700 dark:border-slate-800 dark:text-slate-200"
                          >
                            <span className="capitalize">{m.name}</span>
                            <span className="text-right font-semibold">{Number(m.amount || 0).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
