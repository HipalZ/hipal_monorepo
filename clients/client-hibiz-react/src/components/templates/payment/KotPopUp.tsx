// src/components/modals/TableKotModal.tsx
import PopUp from '@/components/atom/popUp';
import { type KotOrderDoc, useKotStore } from '@/components/store/useKotStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// tiny util: robust date formatter for en-IN
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

// src/components/modals/TableKotModal.tsx

export const TableKotPopUp = () => {
  const open = useKotStore((s) => s.open);
  const setOpen = useKotStore((s) => s.setOpen);
  const kotData = useKotStore((s) => s.kotData);

  const list = Array.isArray(kotData) ? kotData : ([] as KotOrderDoc[]);
  console.log('Rendering TableKotPopUp with kotData:', list);

  return (
    <PopUp rightTopBack hide height="h-[100dvh] md:h-[75dvh]" width="w-[42rem]" onClose={() => setOpen(false)} show={open}>
      <div className="h-[80dvh] overflow-auto p-4">
        <Accordion type="single" collapsible>
          {list.map((kot) => {
            const when = fmtKotDate(kot?.date ?? kot?.createdAt);
            const items = kot?.cart?.length ?? 0;

            return (
              <AccordionItem key={kot._id} value={kot._id}>
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">
                        #{kot.kotInvoiceNumber} • {kot.tableName} • {kot.kotStatus}
                      </span>
                      <span className="text-xs text-slate-500">
                        {when} IST • {items} item{items === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">
                        By: {kot.name || kot.phone} • {kot.accepted ? 'Accepted' : 'Pending'}
                        {kot.transferd && (
                          <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                            Transferred {kot.fromTable ? `from ${kot.fromTable} → ${kot.toTable}` : ''}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {kot.cart?.map((line) => (
                        <div key={line._id} className="flex items-center justify-between text-sm">
                          <div className="truncate">
                            {line.dish?.name}
                            {line.portion?.name ? ` (${line.portion.name})` : ''}
                            {line.extras?.length ? ` • +${line.extras.length} extras` : ''}
                          </div>
                          <div className="${ line.itemStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : line.itemStatus === 'COOKED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700' } rounded px-2 py-0.5 text-xs">
                            {line.itemStatus}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </PopUp>
  );
};
