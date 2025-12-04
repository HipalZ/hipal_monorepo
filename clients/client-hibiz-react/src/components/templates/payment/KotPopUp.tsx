import PopUp from '@/components/atom/popUp';
import { type KotOrderDoc, useKotStore } from '@/components/store/useKotStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock4, ListChecks, Receipt, User, UtensilsCrossed } from 'lucide-react';
import { useMemo } from 'react';
import { MdTableBar } from 'react-icons/md';

const fmtKotDate = (d?: string | number | Date) => {
  if (!d) return '';
  const dt = typeof d === 'number' || d instanceof Date ? new Date(d) : new Date(String(d));
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getKotStatusClasses = (status?: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800 border-amber-200';
  if (s === 'COMPLETED' || s === 'CLOSED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (s === 'REJECTED') return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const getItemStatusClasses = (status?: string) => {
  const s = (status || '').toUpperCase();
  if (s === 'DELIVERED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (s === 'COOKED') return 'bg-sky-100 text-sky-700 border-sky-200';
  if (s === 'IN_PROGRESS') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

type TableGroup = {
  tableId: string;
  tableName: string;
  kots: KotOrderDoc[];
};

type BreakdownDirection = 'positive' | 'negative' | 'neutral';

type BreakdownItem = {
  label: string;
  value: number;
  direction?: BreakdownDirection;
};

interface TableKotPopUpProps {
  runningTablesBreakdown?: BreakdownItem[];
}

export const TableKotPopUp = ({ runningTablesBreakdown }: TableKotPopUpProps) => {
  const open = useKotStore((s) => s.open);
  const setOpen = useKotStore((s) => s.setOpen);
  const kotData = useKotStore((s) => s.kotData);

  const list = Array.isArray(kotData) ? (kotData as KotOrderDoc[]) : ([] as KotOrderDoc[]);

  // Group KOTs by tableId
  const groupedByTable: TableGroup[] = useMemo(() => {
    const map = new Map<string, TableGroup>();

    for (const kot of list) {
      const tableId = (kot as any).tableId || 'unknown';
      const tableName = ((kot as any).tableName || 'Unknown').trim();

      if (!map.has(tableId)) {
        map.set(tableId, {
          tableId,
          tableName,
          kots: [],
        });
      }
      map.get(tableId)!.kots.push(kot);
    }

    return Array.from(map.values()).sort((a, b) => a.tableName.localeCompare(b.tableName));
  }, [list]);

  // Build: { [tableName]: amount }
  const runningTableCostByTable = useMemo(() => {
    const costMap: Record<string, number> = {};

    if (Array.isArray(runningTablesBreakdown)) {
      for (const item of runningTablesBreakdown) {
        console.log('item in breakdown', item);
        const label = (item.label || '').trim();
        if (!label) continue;
        if (label.toLowerCase() === 'active tables') continue;
        costMap[label] = item.value ?? 0;
      }
    }

    return costMap;
  }, [runningTablesBreakdown]);

  const activeTablesCount = runningTablesBreakdown?.find((x) => x.label.toLowerCase() === 'active tables')?.value ?? groupedByTable.length;

  const totalRunningValue = useMemo(() => Object.values(runningTableCostByTable).reduce((sum, v) => sum + v, 0), [runningTableCostByTable]);

  return (
    <PopUp rightTopBack hide height="h-[100dvh] md:h-[85dvh]" width="w-full max-w-[60rem]" onClose={() => setOpen(false)} show={open}>
      <div className="flex h-[80dvh] flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b px-3 pb-2 pt-3">
          <h2 className="text-base font-bold tracking-tight text-slate-900 md:text-lg">Running Tables – KOT History</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600/80">All active tables and their KOTs, grouped clearly by table.</p>

          {activeTablesCount > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                <MdTableBar className="h-3 w-3" />
                Active Tables: {activeTablesCount}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                Total Running Value: ₹{totalRunningValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <div className="h-full overflow-auto p-3">
          {groupedByTable.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No KOTs found for running tables.</div>
          ) : (
            <div className="space-y-3">
              {groupedByTable.map((group) => {
                const { tableId, tableName, kots } = group;
                const tableTotal = runningTableCostByTable[tableName] ?? runningTableCostByTable[tableName.trim()] ?? 0;

                return (
                  <Card key={tableId} className="border-slate-200 bg-white shadow-sm">
                    {/* Table heading */}
                    <CardHeader className="border-b border-slate-100 px-3 pb-2 pt-2">
                      <CardTitle className="flex items-center justify-between text-sm font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                            <MdTableBar className="h-3 w-3" />
                            {tableName}
                          </span>
                        </div>

                        <span className="flex flex-col items-end text-[11px] font-semibold text-slate-600/80">
                          <span>
                            Table Total:&nbsp;
                            <span className="font-bold text-slate-900">₹{tableTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </span>
                          <span className="mt-0.5">
                            {kots.length} KOT{kots.length === 1 ? '' : 's'}
                          </span>
                        </span>
                      </CardTitle>
                    </CardHeader>

                    {/* KOT list for this table */}
                    <CardContent className="px-2 pt-2">
                      <Accordion type="single" collapsible className="space-y-2">
                        {kots.map((kot) => {
                          const when = fmtKotDate(kot?.date ?? kot?.createdAt);
                          const itemsCount = kot?.cart?.length ?? 0;

                          return (
                            <AccordionItem key={kot._id} value={kot._id} className="rounded-lg border border-slate-200 bg-slate-50/70">
                              <AccordionTrigger className="px-2 py-2 hover:no-underline">
                                <div className="flex w-full items-center justify-between gap-3">
                                  <div className="flex flex-col text-left">
                                    {/* KOT heading line */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-900">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px]">
                                        <Receipt className="h-3 w-3 text-slate-700" />
                                        KOT #{kot.kotInvoiceNumber}
                                      </span>

                                      <span
                                        className={cn(
                                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                                          getKotStatusClasses(kot.kotStatus),
                                        )}
                                      >
                                        {kot.kotStatus}
                                      </span>

                                      {kot.priority && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                          Priority
                                        </span>
                                      )}
                                    </div>

                                    {/* KOT subheading: time, items, captain */}
                                    <span className="mt-1 inline-flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600/80">
                                      <span className="inline-flex items-center gap-1">
                                        <Clock4 className="h-3 w-3" />
                                        {when}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <UtensilsCrossed className="h-3 w-3" />
                                        {itemsCount} item{itemsCount === 1 ? '' : 's'}
                                      </span>
                                      <span className="inline-flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {kot.name || kot.phone}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>

                              <AccordionContent className="border-t border-slate-100 bg-white px-2 pb-3 pt-2">
                                <Card className="border-none bg-transparent shadow-none">
                                  {/* Captain & transfer info */}
                                  <CardHeader className="flex flex-col gap-1 px-1 pb-2 pt-1">
                                    <CardTitle className="flex items-center justify-between text-xs font-semibold text-slate-600/80">
                                      <span className="inline-flex items-center gap-1">
                                        <User className="h-3 w-3 text-slate-700" />
                                        Captain: <span className="font-semibold text-slate-900">{kot.name || '-'}</span>
                                      </span>
                                      {kot.transferd && (
                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                          Transferred {kot.fromTable ? `from ${kot.fromTable} → ${kot.toTable}` : ''}
                                        </span>
                                      )}
                                    </CardTitle>
                                  </CardHeader>

                                  {/* Cart items */}
                                  <CardContent className="grid grid-cols-1 gap-4 px-1 pb-2 md:grid-cols-2 lg:grid-cols-3">
                                    {kot.cart?.map((line) => {
                                      const isDeleted = line.isDeleted;
                                      const portionName = line.portion?.name;
                                      const basePrice = line.portion?.price ?? line.dish?.price ?? 0;
                                      const extrasArr = line.extras || [];
                                      const extrasTotal = extrasArr.reduce((sum, ex) => sum + (ex.price || 0) * (ex.quantity || 0), 0) ?? 0;
                                      const perUnit = basePrice + extrasTotal;
                                      const qty = line.quantity ?? 1;
                                      const lineTotal = perUnit * qty;

                                      return (
                                        <div
                                          key={line._id}
                                          className={cn(
                                            'flex items-start justify-between rounded-md border px-2 py-2 text-xs md:text-sm',
                                            isDeleted ? 'border-rose-200 bg-rose-50/70 opacity-80' : 'border-slate-200 bg-slate-50/80',
                                          )}
                                        >
                                          <div className="mr-2 flex-1">
                                            {/* Item heading */}
                                            <div className={cn('text-sm font-semibold text-slate-900', isDeleted && 'text-slate-500 line-through')}>
                                              {qty} × {line.dish?.name}
                                            </div>

                                            {/* Portion + extras */}
                                            <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-semibold text-slate-700">
                                              {portionName && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                                                  <UtensilsCrossed className="h-3 w-3 text-slate-700" />
                                                  Portion: {portionName}
                                                </span>
                                              )}

                                              {extrasArr.length > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">
                                                  <ListChecks className="h-3 w-3" />
                                                  Extras:
                                                  <span className="font-normal">
                                                    {extrasArr.map((ex) => `${ex.name} (₹${ex.price} × ${ex.quantity})`).join(', ')}
                                                  </span>
                                                </span>
                                              )}
                                            </div>

                                            {/* Price line */}
                                            <div className="mt-1 text-[11px] text-slate-600">
                                              Rate per unit: <span className="font-semibold text-slate-900">₹{perUnit.toFixed(2)}</span> • Line total:{' '}
                                              <span className="font-semibold text-slate-900">₹{lineTotal.toFixed(2)}</span>
                                            </div>

                                            {/* Deleted info */}
                                            {isDeleted && (
                                              <div className="mt-1 text-[11px] italic text-rose-600">
                                                Deleted by {line.deletedBy || 'N/A'}
                                                {line.reasonOfDeletion ? ` – ${line.reasonOfDeletion}` : ''}
                                              </div>
                                            )}
                                          </div>

                                          {/* Status pill */}
                                          <div className="flex flex-col items-end gap-1">
                                            <span
                                              className={cn(
                                                'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                                                getItemStatusClasses(line.itemStatus),
                                                isDeleted && 'line-through opacity-70',
                                              )}
                                            >
                                              {line.itemStatus}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </CardContent>
                                </Card>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PopUp>
  );
};
