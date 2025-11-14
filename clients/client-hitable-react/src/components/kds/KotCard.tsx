// src/components/kds/KotCard.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useGridAutoSpan } from '../../hooks/useGridAutoSpan';
import CommonBottomButton from '../atoms/bottomButton';
import { useKotItemStatus } from '../hooks/usePriority';
import { useKdsStore } from '../store/useKdsStore';
import { useKotSelectionStore } from '../store/usePriorityStore';
import type { KotItem, KotOrderDoc } from '../types/kds';

interface KotCardProps {
  order: KotOrderDoc;
  staffId?: string;
}

export const KotCard = ({ order, staffId }: KotCardProps) => {
  const anyPriority = order.priority || order.cart.some((c) => c.priority);
  const { selectedDishNames } = useKdsStore();

  const { selectedItemIds, isSelected, toggle } = useKotSelectionStore();
  const { setItemStatus, isUpdating } = useKotItemStatus({
    invalidateKeys: [['kot']],
  });

  const { ref, style } = useGridAutoSpan<HTMLDivElement>([order.cart.length, selectedDishNames.size, anyPriority], 12, 8);

  const clearThisOrderSelection = useCallback(() => {
    if (!selectedItemIds.length) return;
    for (const id of selectedItemIds) if (isSelected(id)) toggle(id);
  }, [selectedItemIds, isSelected, toggle]);

  const bulkUpdate = async (status: 'COOKED' | 'DELIVERED' | 'CANCELLED') => {
    if (!selectedItemIds.length) return;
    await setItemStatus({ itemIds: selectedItemIds, itemStatus: status, staffId: staffId as string });
    clearThisOrderSelection();
  };

  const displayItems: KotItem[] = useMemo(() => {
    if (selectedDishNames.size === 0) return order.cart;
    return order.cart.filter((ci) => selectedDishNames.has(ci?.dish?.name ?? ''));
  }, [order.cart, selectedDishNames]);

  if (!displayItems.length) return null;

  // Guard: show toast and block interactions for DELIVERED items
  const handleGuardDelivered = (ci: KotItem) => {
    if (ci.itemStatus === 'DELIVERED') {
      toast.error('Item already delivered');
      return true;
    }
    return false;
  };

  return (
    <Card
      style={style}
      className={cn(
        'rounded-xl bg-white text-black shadow-sm transition-all duration-300 dark:bg-zinc-900 dark:text-zinc-100',
        anyPriority && 'ring-2 ring-purple-600',
      )}
    >
      <div ref={ref} className="m-0 p-0 pb-3">
        <CardHeader className="overflow-hidden pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              <span className="text-3xl">{order.tableName ?? '—'}</span> · KOT #{order.kotInvoiceNumber}
            </CardTitle>
            <Badge
              className={cn(
                order.kotStatus === 'COMPLETED' && 'bg-black text-white dark:bg-zinc-700 dark:text-zinc-100',
                order.kotStatus === 'IN_PROGRESS' && 'bg-purple-600 text-white',
              )}
            >
              {order.kotStatus}
            </Badge>
          </div>
          <div className="relative bottom-2 flex justify-between py-1 text-base font-semibold text-black dark:text-zinc-400">
            <div className="absolute -bottom-2 -ml-4 h-4 w-[108%] border-b-4 border-purple-600" />
            <div>{order.name}</div>
            <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ul className="space-y-2">
            {displayItems.map((ci) => {
              const id = (ci._id || ci.id) as string;

              // Only allow selecting non-delivered & non-cancelled items
              const selectable = !ci.isDeleted && ci.itemStatus !== 'DELIVERED' && ci.itemStatus !== 'CANCELLED';

              // Fade cooked or delivered
              const isDimmed = ci.itemStatus === 'COOKED' || ci.itemStatus === 'DELIVERED';

              const onRowClick = () => {
                if (handleGuardDelivered(ci)) return;
                if (!selectable) return;
                toggle(id);
              };

              const onKeyToggle = (e: React.KeyboardEvent<HTMLLIElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick();
                }
              };

              return (
                <li
                  key={id}
                  onClick={onRowClick}
                  onKeyDown={onKeyToggle}
                  role="button"
                  tabIndex={0}
                  className={cn('relative cursor-pointer select-none rounded-lg p-2 transition-all duration-300', isDimmed && 'opacity-50')}
                >
                  {/* Status Badge */}
                  <div
                    className={cn(
                      'absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      ci.itemStatus === 'IN_PROGRESS' && 'bg-amber-100 text-amber-900',
                      ci.itemStatus === 'COOKED' && 'bg-green-100 text-green-900',
                      ci.itemStatus === 'DELIVERED' && 'bg-blue-100 text-blue-900',
                      ci.itemStatus === 'CANCELLED' && 'bg-red-100 text-red-900',
                    )}
                  >
                    {ci.itemStatus}
                  </div>

                  <div className="grid grid-cols-12 items-start gap-2">
                    {/* Checkbox (blocked for delivered/cancelled with toast) */}
                    <div className="flex justify-center pt-1">
                      {selectable ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer accent-purple-600"
                          checked={isSelected(id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (handleGuardDelivered(ci)) return;
                            toggle(id);
                          }}
                          aria-label="Select item"
                        />
                      ) : (
                        <span className="block h-4 w-4" aria-hidden="true" />
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="col-span-10 min-w-0">
                      <div className="line-clamp-2 max-h-[4rem] w-[90%] text-xl font-semibold leading-[1.55rem]">{ci.dish.name}</div>
                      <div className="font-semibold text-purple-900 text-zinc-500 opacity-90">
                        Portion: {ci.portion?.name ?? 'Regular'} · ×{ci.quantity ?? 1}
                      </div>
                      {!!ci.extras?.length && (
                        <div className="text-base font-semibold text-purple-700 dark:text-purple-300">
                          {ci.extras.map((e) => `${e.name ?? ''} (×${e.quantity})`).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 -ml-2 text-left text-base font-semibold">×{ci.quantity}</div>
                  </div>
                </li>
              );
            })}
          </ul>

          {selectedItemIds.length > 0 && (
            <CommonBottomButton
              fixed
              maxWidth="30rem"
              buttons={[
                {
                  text: '',
                  isBackButton: true,
                  onClick: clearThisOrderSelection,
                  className: 'rounded-md !w-[6rem] pl-3',
                },
                {
                  text: 'Mark Cooked',
                  onClick: () => bulkUpdate('COOKED'),
                  className: 'rounded-md w-full !bg-purple-500',
                  disable: isUpdating || !staffId,
                },
                {
                  text: 'Mark Delivered',
                  onClick: () => bulkUpdate('DELIVERED'),
                  className: 'rounded-md w-full',
                  disable: isUpdating || !staffId,
                },
              ]}
            />
          )}
        </CardContent>
      </div>
    </Card>
  );
};
