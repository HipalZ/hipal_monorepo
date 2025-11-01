import { useReprintKot } from '@/components/hooks/usePrint.ts';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import type { OrderData } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { BiSync } from 'react-icons/bi';
import { MdPerson, MdRestaurantMenu } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { useKotItemStatus, useKotPriority } from '../../hooks/usePriority';
import type { ICartItem } from '../../store/useCartStore';
import { useKotSelectionStore } from '../../store/usePriorityStore';

interface CompactOrderCardProps {
  order: OrderData;
}

const MemoEnhancedOrderCard = ({ order }: CompactOrderCardProps) => {
  const { tableId } = useParams();
  const { isPending, mutateAsync } = useReprintKot();

  const captain = useHiClientZ((s) => s.captainData);

  const { setPriority, isPrioritizing } = useKotPriority({
    invalidateKeys: tableId ? [['getTableOrders', tableId]] : undefined,
  });

  const { setItemStatus, isUpdating } = useKotItemStatus({
    invalidateKeys: tableId ? [['getTableOrders', tableId]] : undefined,
  });

  // Selection store
  const selectedItemIds = useKotSelectionStore((s) => s.selectedItemIds);
  const toggle = useKotSelectionStore((s) => s.toggle);
  const enableSelectionMode = useKotSelectionStore((s) => s.enableSelectionMode);
  const disableSelectionMode = useKotSelectionStore((s) => s.disableSelectionMode);
  const isSelected = useKotSelectionStore((s) => s.isSelected);

  const filteredCartItems = useMemo(() => order?.cart || [], [order?.cart]);

  const orderItemIds = useMemo(() => filteredCartItems.map((it: any) => (it._id ?? it.id) as string), [filteredCartItems]);

  const selectedForThisOrder = useMemo(() => selectedItemIds.filter((id) => orderItemIds.includes(id)), [selectedItemIds, orderItemIds]);

  useEffect(() => {
    if (selectedItemIds.length > 0) enableSelectionMode();
    else disableSelectionMode();
  }, [selectedItemIds.length, enableSelectionMode, disableSelectionMode]);

  const calculateTotalPrice = useCallback((cartItem: ICartItem) => {
    const hasPortion = !!cartItem.portion?.price;
    const basePrice = hasPortion ? 0 : cartItem.dish.price * cartItem.quantity;
    const portionPrice = hasPortion ? cartItem.portion!.price * cartItem.quantity : 0;
    const extrasPrice = (cartItem.extras?.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) || 0) * cartItem.quantity;
    return basePrice + portionPrice + extrasPrice;
  }, []);

  const ItemStatusBadge = ({ status }: { status?: 'IN_PROGRESS' | 'COOKED' | 'DELIVERED' | 'CANCELLED' }) => {
    if (!status) return null;
    const map: Record<string, { label: string; cls: string }> = {
      IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
      COOKED: { label: 'Cooked', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      DELIVERED: { label: 'Delivered', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
      CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800 border-red-200' },
    };
    const { label, cls } = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <Badge variant="outline" className={`py-0.5 text-[10px] tracking-wide ${cls}`}>
        {label}
      </Badge>
    );
  };

  // Unselect only items from THIS order
  const clearThisOrder = useCallback(() => {
    if (selectedForThisOrder.length === 0) return;
    selectedForThisOrder.forEach((id) => {
      if (isSelected(id)) toggle(id);
    });
  }, [selectedForThisOrder, isSelected, toggle]);

  // Deliver only items from THIS order
  const deliverThisOrder = useCallback(async () => {
    if (!captain?._id || selectedForThisOrder.length === 0) return;
    await setItemStatus({ itemIds: selectedForThisOrder, itemStatus: 'DELIVERED', staffId: captain._id });
    clearThisOrder();
  }, [captain?._id, selectedForThisOrder, setItemStatus, clearThisOrder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('lg:-pl-6 relative mx-auto w-full max-w-lg')}
    >
      <Card className={cn('mb-4 overflow-hidden', order?.priority && 'border-y-[1rem] border-red-900')}>
        <CardContent className="p-3">
          {/* Header: name | datetime | menu */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <MdPerson className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="truncate font-semibold">{order?.name}</span>
            </div>
            <section className="pr-4">
              <div className="hidden shrink-0 text-sm font-semibold opacity-60 sm:block">
                {new Date(order?.date).toLocaleString('en-In').slice(0, 9)}
              </div>
              <div className="hidden shrink-0 text-sm font-semibold opacity-60 sm:block">
                {new Date(order?.date).toLocaleString('en-In').slice(11)}
              </div>
            </section>
          </div>
          <section className="absolute right-1 top-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <GripVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => mutateAsync(order._id.toString())}
                  disabled={isPending}
                  className="flex cursor-pointer items-center gap-2"
                >
                  {isPending ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <BiSync className="h-4 w-4" />
                  )}
                  {isPending ? 'Re-Printing...' : 'Re-Print KOT'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPriority({ kotId: order._id.toString() })}
                  disabled={isPrioritizing}
                  className="flex cursor-pointer items-center gap-2"
                >
                  {isPrioritizing ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <MdRestaurantMenu className="h-4 w-4" />
                  )}
                  {isPrioritizing ? 'Updating…' : 'Mark Priority'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          {/* Date (mobile) */}
          <div className="mb-1 block text-xs font-semibold opacity-60 sm:hidden">{new Date(order?.date).toLocaleString('en-In')}</div>

          {/* Transfer badges */}
          {order?.transferd && (
            <section className="mb-2 flex items-center justify-between gap-2">
              <Badge variant="destructive">Transferred by {order?.transferedBy?.name}</Badge>
              <Badge variant="secondary" className="text-base">{`${order?.fromTable} => ${order?.toTable}`}</Badge>
            </section>
          )}

          <Separator className="my-2" />

          {/* Items */}
          <div className="space-y-3">
            {filteredCartItems.length === 0 ? (
              <div className="py-6 text-center text-gray-500">No items in this order.</div>
            ) : (
              filteredCartItems.map((item: any) => {
                const id = (item._id ?? item.id) as string;
                const isItemDeleted = item.isDeleted;
                const status: 'IN_PROGRESS' | 'COOKED' | 'DELIVERED' | 'CANCELLED' | undefined = item?.itemStatus;

                const eligible = !isItemDeleted && status !== 'DELIVERED' && status !== 'CANCELLED';
                const itemTextClasses = isItemDeleted ? 'line-through text-red-700' : 'font-semibold';
                const lineTotal = calculateTotalPrice(item);

                const addOns = item?.extras?.length ? item.extras.map((e: any) => `${e.name} x${e.quantity * item.quantity}`).join(', ') : '';

                const onCheck = () => {
                  if (!isSelected(id)) enableSelectionMode(); // selecting first item turns mode on
                  toggle(id);
                };

                return (
                  <div
                    key={id}
                    className={cn(
                      'rounded-md border border-transparent bg-white py-2 pr-2 dark:bg-slate-900/60',
                      isItemDeleted && 'border-red-200 bg-red-50',
                      !eligible && '-ml-4',
                    )}
                  >
                    {/* Row 1 */}
                    <div className="grid grid-cols-12 items-start gap-2">
                      <div className="col-span-1 -ml-4 mt-1 flex justify-center">
                        {eligible ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer"
                            checked={isSelected(id)}
                            onChange={onCheck}
                            aria-label={`Select ${item?.dish?.name}`}
                          />
                        ) : (
                          <span className="block h-4 w-4" />
                        )}
                      </div>

                      <div className="col-span-7 -ml-4 min-w-0">
                        <div className="flex items-start gap-1">
                          <MdRestaurantMenu className="mt-1 h-4 w-4 text-gray-500" />
                          <h6 className={cn('line-clamp-2 h-[3rem]', itemTextClasses)} title={item?.dish?.name}>
                            {item?.dish?.name}
                          </h6>
                          {isItemDeleted && <Badge variant="destructive">Deleted</Badge>}
                        </div>
                      </div>

                      <div className="col-span-2 text-center text-sm">x{item?.quantity}</div>
                      <div className="col-span-2 -ml-2 text-right font-medium">₹{lineTotal.toFixed(1)}</div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-1 grid grid-cols-12 items-center gap-2">
                      <div className="col-span-10 ml-9 text-xs text-gray-600">
                        {item?.portion && <span className={itemTextClasses}>({item?.portion?.name})</span>}
                        {item?.portion && addOns ? <span className="mx-1">•</span> : null}
                        {addOns && <span className={itemTextClasses}>{addOns}</span>}
                        {item?.dish?.instruction && (
                          <>
                            {(item?.portion || addOns) && <span className="mx-1">•</span>}
                            <span className="italic text-gray-500">{item?.dish?.instruction}</span>
                          </>
                        )}
                      </div>
                      <div className="col-span-3 ml-9 flex w-[5rem] justify-start">
                        {!isItemDeleted && <ItemStatusBadge status={status as any} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Separator className="my-3" />

          {/* Footer actions ONLY for this card when it has selected items */}
          {selectedForThisOrder.length > 0 && (
            <div className="mb-2 mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-gray-50 p-2">
              <div className="text-sm opacity-80">
                Selected in this KOT: <b>{selectedForThisOrder.length}</b>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearThisOrder}>
                  Clear
                </Button>
                <Button size="sm" onClick={deliverThisOrder} disabled={selectedForThisOrder.length === 0 || isUpdating || !captain?._id}>
                  {isUpdating ? 'Delivering…' : 'Mark as Delivered'}
                </Button>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">
              ₹
              {order?.cart
                ?.reduce((total: number, item: any) => {
                  const hasPortion = !!item.portion?.price;
                  const baseTotal = hasPortion ? 0 : item.dish.price * item.quantity;
                  const portionTotal = hasPortion ? item?.portion?.price * item.quantity : 0;
                  const extrasTotal = (item.extras?.reduce((sum: number, extra: any) => sum + extra.price * extra.quantity, 0) || 0) * item.quantity;
                  return total + baseTotal + portionTotal + extrasTotal;
                }, 0)
                .toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EnhancedOrderCard = memo(MemoEnhancedOrderCard);
EnhancedOrderCard.displayName = 'EnhancedOrderCard';
export default EnhancedOrderCard;
