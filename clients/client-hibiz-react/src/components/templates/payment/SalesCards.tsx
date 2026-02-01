import type { IExistingPayments } from '@/components/types/businessData';
import { cn, hideMiddleNumbers } from '@/components/utils/helper';
import { CreditCard, IndianRupee, Percent, Phone, SplitSquareHorizontal, User, Users, Wallet } from 'lucide-react';
import { memo, useMemo } from 'react';
import { MdTableBar } from 'react-icons/md';

interface SalesCardsProps {
  data: IExistingPayments;
  openModel: (data: IExistingPayments) => void;
}

const MemoSalesCards = ({ data, openModel }: SalesCardsProps) => {
  // --- CALCULATIONS --- //
  const totalDiscount = useMemo(() => {
    return (data?.claimedCoins ?? 0) + (data?.discount ?? 0) + (data?.couponDiscount ?? 0);
  }, [data]);

  const baseBillValue = data?.order_id?.billValue ?? data?.billValue ?? 0;
  const billAfterDiscount = Math.max(baseBillValue - totalDiscount, 0);
  const finalTotal = data?.order_id?.total ?? data?.total ?? 0;

  const billDateTime = useMemo(() => {
    const raw = (data as any)?.date ?? data?.order_id?.date;
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
  }, [data]);

  const splitPaymentModes = useMemo(() => (Array.isArray(data?.splitModes) ? data.splitModes : []), [data?.splitModes]);

  const isSplitPayment = data?.paymentMode === 'split' || data?.mode === 'split';
  const modeLabel = data?.paymentMode || data?.mode || 'N/A';

  const handleOpen = () => openModel(data);

  return (
    <section
      className={cn(
        'relative w-full cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-100 via-white to-green-100 p-4 shadow-sm transition',
        'hover:-translate-y-[1px] hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-900',
      )}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleOpen();
      }}
      role="button"
      tabIndex={0}
    >
      <span className="rounded- absolute left-0 top-0 rounded-tl-2xl bg-sky-50 px-3 py-1 text-xl font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
        #{data?.billInvoice}
      </span>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {data?.tableName && (
              <span className="-ml-4 mt-6 inline-flex items-center gap-1.5 rounded-r-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                <MdTableBar className="h-6 w-6" />
                {data.tableName}
              </span>
            )}

            {data?.paxCount ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Users className="h-3 w-3" />
                Pax {data.paxCount}
              </span>
            ) : null}
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex-1 text-right">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹ {finalTotal.toFixed(2)}</p>
          {billDateTime && <p className="text-primary flex items-center justify-end text-sm font-semibold">{billDateTime}</p>}
        </div>
      </div>

      {/* Separator */}
      <div className="mt-3 h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* CUSTOMER + CAPTAIN */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-50">
            <User className="h-4 w-4 text-slate-500" />
            {data?.userId?.name?.trim() || 'Customer'}
          </span>
          {data?.waiterName && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <User className="h-3 w-3 text-slate-400" />
              Captain: {data.waiterName}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold">
          <Phone className="h-3 w-3" />
          {hideMiddleNumbers(data?.userId?.phone || '')}
        </span>
      </div>

      {/* Separator */}
      <div className="mt-3 h-px w-full bg-slate-100 dark:bg-slate-800" />

      {/* AMOUNTS + DISCOUNT (VERY CLEAR) */}
      <div className="-ml-4 mt-3 w-[110%] px-4 text-xs">
        <div className="grid grid-cols-3 gap-3">
          {/* Actual Bill */}
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <IndianRupee className="h-3 w-3" />
              Bill Value
            </span>
            {totalDiscount > 0 ? (
              <>
                <span className="text-[11px] text-slate-400 line-through dark:text-slate-500">₹ {baseBillValue.toFixed(2)}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-50">₹ {billAfterDiscount.toFixed(2)}</span>
              </>
            ) : (
              <span className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-50">₹ {baseBillValue.toFixed(2)}</span>
            )}
          </div>

          {/* Discount (VERY IMPORTANT) */}
          <div className="flex flex-col border-l border-slate-200 pl-3 dark:border-slate-600">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Percent className="h-3 w-3" />
              Discount
            </span>
            {totalDiscount > 0 ? (
              <span className="mt-1 text-sm font-bold text-rose-500 dark:text-rose-400">- ₹ {totalDiscount.toFixed(2)}</span>
            ) : (
              <span className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">No discount</span>
            )}
          </div>

          {/* Final Collected */}
          <div className="flex flex-col items-end border-l border-slate-200 pl-3 dark:border-slate-600">
            <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Wallet className="h-3 w-3" />
              Collected
            </span>
            <span className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">₹ {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* PAYMENT SECTION (MODE VERY CLEAR) */}
      <div className="mt-3 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {/* Mode of Payment (VERY IMPORTANT) */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            <CreditCard className="h-3 w-3" />
            Mode: <span className="capitalize">{modeLabel}</span>
          </div>

          {/* Discount chip (optional but visually clean) */}
          {totalDiscount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-500 dark:bg-rose-900/30 dark:text-rose-300">
              <Percent className="h-3 w-3" />
              Discount Applied
            </div>
          )}
        </div>

        {/* If split, show splits as TABLE FORMAT */}
        {isSplitPayment && splitPaymentModes.length > 0 && (
          <div className="mt-1 rounded-xl bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center gap-1">
                <SplitSquareHorizontal className="h-3 w-3" />
                Split Payment
              </span>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] border-b border-slate-200 bg-white px-3 py-1 text-xs font-semibold">
              <span>Mode</span>
              <span className="text-right">Amount (₹)</span>
            </div>
            {splitPaymentModes.map((m: any) => (
              <div key={m._id} className="grid grid-cols-[1.4fr_1fr] border-t border-slate-100 px-3 py-1.5 text-xs">
                <span className="font-semibold capitalize opacity-80">{m.name}</span>
                <span className="text-right font-semibold">{Number(m.amount || 0).toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SalesCards = memo(MemoSalesCards);
export default SalesCards;
