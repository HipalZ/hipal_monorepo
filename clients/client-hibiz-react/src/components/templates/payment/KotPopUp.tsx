import PopUp from '@/components/atom/popUp';
import { type KotOrderDoc, useKotStore } from '@/components/store/useKotStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

export const TableKotPopUp = () => {
  const open = useKotStore((s) => s.open);
  const setOpen = useKotStore((s) => s.setOpen);
  const kotData = useKotStore((s) => s.kotData);
  const list = Array.isArray(kotData) ? kotData : ([] as KotOrderDoc[]);

  return (
    <PopUp rightTopBack hide height="h-[100dvh] md:h-[85dvh]" width="w-full max-w-[60rem]" onClose={() => setOpen(false)} show={open}>
      <div className="flex h-[80dvh] flex-col overflow-hidden">
        <div className="border-b px-4 pb-2 pt-3">
          <h2 className="text-lg font-semibold tracking-tight">KOT History</h2>
          <p className="text-xs text-slate-500">View all KOTs raised for this table with item-wise status and details.</p>
        </div>

        <div className="h-full overflow-auto p-4">
          {list.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No KOTs found for this table.</div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {list.map((kot) => {
                const when = fmtKotDate(kot?.date ?? kot?.createdAt);
                const items = kot?.cart?.length ?? 0;

                return (
                  <AccordionItem key={kot._id} value={kot._id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex flex-col text-left">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              KOT #{kot.kotInvoiceNumber}
                            </span>
                            <span className="text-slate-800">{kot.tableName}</span>
                            <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', getKotStatusClasses(kot.kotStatus))}>
                              {kot.kotStatus}
                            </span>
                            {kot.priority && (
                              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Priority</span>
                            )}
                          </div>
                          <span className="mt-0.5 text-xs text-slate-500">
                            {when} • {items} item{items === 1 ? '' : 's'} • By {kot.name || kot.phone}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="border-t border-slate-100 bg-slate-50/60 px-3 pb-3 pt-2">
                      <Card className="border-none bg-transparent shadow-none">
                        <CardHeader className="flex flex-col gap-1 px-2 pb-2 pt-1">
                          <CardTitle className="flex items-center justify-between text-xs font-normal text-slate-600">
                            <span>
                              Captain: <span className="font-medium text-slate-800">{kot.name || '-'}</span>
                            </span>
                            {kot.transferd && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                Transferred {kot.fromTable ? `from ${kot.fromTable} → ${kot.toTable}` : ''}
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2 px-2 pb-2">
                          {kot.cart?.map((line) => {
                            const isDeleted = line.isDeleted;
                            const portionName = line.portion?.name;
                            const basePrice = line.portion?.price ?? line.dish?.price ?? 0;
                            const extrasTotal = line.extras?.reduce((sum, ex) => sum + (ex.price || 0) * (ex.quantity || 0), 0) ?? 0;
                            const perUnit = basePrice + extrasTotal;
                            const qty = line.quantity ?? 1;
                            const lineTotal = perUnit * qty;

                            const extrasLabel =
                              line.extras && line.extras.length
                                ? line.extras.map((ex) => `${ex.name} (₹${ex.price} × ${ex.quantity})`).join(', ')
                                : '';

                            return (
                              <div
                                key={line._id}
                                className={cn(
                                  'flex items-start justify-between rounded-md border px-3 py-2 text-xs md:text-sm',
                                  isDeleted ? 'border-rose-200 bg-rose-50/70 opacity-80' : 'border-slate-200 bg-white',
                                )}
                              >
                                <div className="mr-2 flex-1">
                                  <div className={cn('font-medium text-slate-800', isDeleted && 'text-slate-500 line-through')}>
                                    {qty} × {line.dish?.name}
                                    {portionName && <span className="ml-1 text-[11px] font-normal text-slate-500">({portionName})</span>}
                                  </div>

                                  <div className="mt-0.5 text-[11px] text-slate-500">
                                    Rate: ₹{perUnit.toFixed(2)} • Total: <span className="font-semibold text-slate-800">₹{lineTotal.toFixed(2)}</span>
                                  </div>

                                  {extrasLabel && <div className="mt-0.5 text-[11px] text-emerald-700">Extras: {extrasLabel}</div>}

                                  {isDeleted && (
                                    <div className="mt-0.5 text-[11px] italic text-rose-600">
                                      Deleted by {line.deletedBy || 'N/A'}
                                      {line.reasonOfDeletion ? ` – ${line.reasonOfDeletion}` : ''}
                                    </div>
                                  )}
                                </div>

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
          )}
        </div>
      </div>
    </PopUp>
  );
};
