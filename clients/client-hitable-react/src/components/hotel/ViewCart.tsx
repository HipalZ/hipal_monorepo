import { motion } from 'framer-motion';
import { ReceiptText, ShoppingCart, X } from 'lucide-react';
import { lazy, memo, useMemo } from 'react';
import { useHotelStore } from '../store/useHotelStore';
import { getCartItemExtrasTotal, getCartItemLineTotal, getCartItemUnitPrice } from '../utils/cartPricing';

const FoodType = lazy(() => import('../atoms/dishType'));

interface ViewCartProps {
  onClose?: () => void;
}

const MemoViewCart = ({ onClose }: ViewCartProps) => {
  const { cartData } = useHotelStore();
  const itemCount = useMemo(() => cartData?.reduce((sum, item) => sum + Number(item?.quantity || 0), 0) ?? 0, [cartData]);
  const orderTotal = useMemo(() => cartData?.reduce((sum, item) => sum + getCartItemLineTotal(item), 0) ?? 0, [cartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F5F7F6] text-slate-950"
    >
      <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF8F3] text-[#0F7A4D] ring-1 ring-[#CDEBDD]">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold leading-tight">Order details</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {itemCount} item{itemCount === 1 ? '' : 's'} in this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Close order details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {cartData?.length ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {cartData.map((item, index) => {
              const unitPrice = getCartItemUnitPrice(item);
              const extrasPrice = getCartItemExtrasTotal(item);
              const totalPrice = getCartItemLineTotal(item);
              const itemBaseTotal = unitPrice + extrasPrice;

              return (
                <article key={item?.id || index} className="border-b border-slate-100 px-4 py-3 last:border-b-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-[15px] font-semibold leading-snug text-slate-950">{item?.dish?.name || 'Item'}</h3>
                        <span className="shrink-0">
                          <FoodType types={item?.dish?.dishTypes} />
                        </span>
                      </div>
                      {item?.portion?.name && (
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          Portion: <span className="text-slate-700">{item.portion.name}</span>
                        </p>
                      )}

                      {item?.extras && item.extras.length > 0 && (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                          <span className="font-semibold text-slate-800">Extras: </span>
                          {item.extras.map((extra, extraIndex) => (
                            <span key={extra.id || extraIndex}>
                              {extra.name}
                              {extra.quantity > 1 ? ` x${extra.quantity}` : ''}
                              {extraIndex !== item.extras.length - 1 && ', '}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-base font-semibold tabular-nums text-slate-950">₹{totalPrice}</div>
                      <div className="mt-1 text-xs font-medium text-slate-600">
                        Qty {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span className="tabular-nums">₹{itemBaseTotal} x {item.quantity}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <ReceiptText className="h-3.5 w-3.5" />
                      Line total
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center shadow-sm">
            <ShoppingCart className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">No items in this order</p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_18px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Order total</span>
          <span className="text-lg font-semibold tabular-nums text-slate-950">₹{orderTotal}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ViewCart = memo(MemoViewCart);
export default ViewCart;
