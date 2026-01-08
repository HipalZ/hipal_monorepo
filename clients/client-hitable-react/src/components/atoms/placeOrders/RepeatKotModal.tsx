import BottomPopUp from '@/components/atoms/universalPopup';
import { useCartStore } from '@/components/store/useCartStore';
import type { OrderData } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { mapKotLineToCartItem } from '@/components/utils/mapKotLineToCartItem';
import { cn } from '@/lib/utils';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MdRestaurantMenu } from 'react-icons/md';
import CommonBottomButton from '../bottomButton';

interface RepeatKotModalProps {
  show: boolean;
  onClose: () => void;
  order: OrderData;
}

const MemoRepeatKotModal = ({ show, onClose, order }: RepeatKotModalProps) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const [selectedLineIds, setSelectedLineIds] = useState<Set<string>>(new Set());

  // Filter out deleted items
  const availableItems = useMemo(() => {
    return (order?.cart || []).filter((item) => !item.isDeleted);
  }, [order?.cart]);

  // Check if all items are selected
  const allSelected = useMemo(() => {
    return availableItems.length > 0 && selectedLineIds.size === availableItems.length;
  }, [availableItems.length, selectedLineIds.size]);

  // Toggle selection for a single item
  const toggleItem = useCallback((itemId: string) => {
    setSelectedLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedLineIds(new Set());
    } else {
      setSelectedLineIds(new Set(availableItems.map((item) => item._id || item.id)));
    }
  }, [allSelected, availableItems]);

  // Handle repeat selected items
  const handleRepeatSelected = useCallback(() => {
    if (selectedLineIds.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of availableItems) {
      const itemId = item._id || item.id;
      if (!selectedLineIds.has(itemId)) continue;

      const cartItem = mapKotLineToCartItem(item);
      if (!cartItem) {
        failCount++;
        continue;
      }

      try {
        addToCart(cartItem);
        successCount++;
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Added ${successCount} item${successCount > 1 ? 's' : ''} to cart`);
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} item${failCount > 1 ? 's' : ''}`);
    }

    // Close modal and reset selection
    setSelectedLineIds(new Set());
    onClose();
  }, [selectedLineIds, availableItems, addToCart, onClose]);

  // Reset selection when modal closes
  const handleClose = useCallback(() => {
    setSelectedLineIds(new Set());
    onClose();
  }, [onClose]);

  // Check if item is available (not deleted, dish exists)
  const isItemAvailable = useCallback((item: OrderData['cart'][0]) => {
    if (item.isDeleted) return false;
    if (!item.dish?._id && !(item.dish as any)?._id) return false;
    return true;
  }, []);

  return (
    <BottomPopUp show={show} onClose={handleClose} height="h-[80dvh]">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Repeat KOT</h2>
          <p className="mt-1 text-sm text-gray-600">Select items to add to cart</p>
        </div>

        {/* Items List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {availableItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-gray-500">No items found</p>
                <p className="mt-2 text-sm text-gray-400">This KOT has no available items to repeat</p>
              </div>
            </div>
          ) : (
            <>
              {/* Select All Toggle */}
              <div className="mb-4 flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 cursor-pointer rounded" />
                  <span className="font-medium">Select All ({availableItems.length})</span>
                </label>
                <Badge variant="secondary">{selectedLineIds.size} selected</Badge>
              </div>

              {/* Items */}
              {availableItems.map((item) => {
                const itemId = item._id || item.id;
                const isSelected = selectedLineIds.has(itemId);
                const isAvailable = isItemAvailable(item);
                const addOns = item.extras?.length ? item.extras.map((e) => `${e.name} x${e.quantity * item.quantity}`).join(', ') : '';

                return (
                  <div
                    key={itemId}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white',
                      !isAvailable && 'opacity-50',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(itemId)}
                          disabled={!isAvailable}
                          className="h-4 w-4 cursor-pointer rounded disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <MdRestaurantMenu className="mt-1 h-4 w-4 flex-shrink-0 text-gray-500" />
                          <div className="min-w-0 flex-1">
                            <h6 className={cn('font-semibold', !isAvailable && 'text-gray-400')}>{item.dish?.name || 'Unknown Dish'}</h6>
                            {!isAvailable && (
                              <Badge variant="destructive" className="mt-1">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-600">x{item.quantity}</div>
                        </div>

                        {/* Portion, Extras, Instructions */}
                        <div className="mt-2 space-y-1 text-xs text-gray-600">
                          {item.portion && (
                            <div>
                              <span className="font-medium">Portion:</span> {item.portion.name} (₹{item.portion.price})
                            </div>
                          )}
                          {addOns && (
                            <div>
                              <span className="font-medium">Extras:</span> {addOns}
                            </div>
                          )}
                          {item.dish?.instruction && (
                            <div>
                              <span className="font-medium">Note:</span> <span className="italic">{item.dish.instruction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4">
          <CommonBottomButton
            maxWidth="100%"
            fixed={false}
            buttons={[
              {
                text: 'Cancel',
                onClick: handleClose,
                className: 'rounded-md bg-gray-100 text-gray-700',
              },
              {
                text: `Repeat Selected Items (${selectedLineIds.size})`,
                onClick: handleRepeatSelected,
                className: 'rounded-md shadow-md',
                disable: selectedLineIds.size === 0,
              },
            ]}
          />
        </div>
      </div>
    </BottomPopUp>
  );
};

const RepeatKotModal = memo(MemoRepeatKotModal);
export default RepeatKotModal;
