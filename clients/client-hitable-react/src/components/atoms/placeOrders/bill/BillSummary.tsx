import { useStaffPermissionStore } from '@/components/store/usePermissions.ts';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils.ts';
import { memo } from 'react';
import { IoClose } from 'react-icons/io5';
import type { BillSummaryProps } from './bill.types.ts';

const BillSummary = memo(
  ({
    currentBill,
    existingLoyalty,
    onTriggerAddCoinz,
    onClickKey,
    onRemoveClaimedCoins,
    onRemoveCoupon,
    onOpenServiceChargeModal,
    onSetActiveModal,
  }: BillSummaryProps) => {
    const billItems = [
      ['subTotal', currentBill.subTotal],
      ['serviceCharge', currentBill.serviceCharge],
      ['tips', currentBill.tips],
      ['discount', currentBill.discount],
      ['CGst', currentBill.gst / 2],
      ['SGst', currentBill.gst / 2],
      ['otherTax', currentBill.otherTax],
      ['claimedCoins', currentBill.claimedCoins],
      ['couponDiscount', currentBill.couponDiscount],
    ].filter(([_, value]) => typeof value === 'number' && value > 0);

    const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
    const canUseLoyalty = hasPermission('add_coins');
    const canUseCoupon = hasPermission('add_coupon');

    return (
      <>
        {existingLoyalty?.loyaltyId && (canUseLoyalty || canUseCoupon) && (
          <>
            <CardTitle className="flex items-center justify-between">
              <span>Use customer Loyalty</span>
              <Button variant="default" className="ml-auto flex justify-end" onClick={onTriggerAddCoinz}>
                Use Coinz
              </Button>
            </CardTitle>
            <Separator className="my-4" />
          </>
        )}

        <div className="mb-4 space-y-3">
          {billItems.map(([key, value]) => {
            const isDeduction = key === 'claimedCoins' || key === 'discount' || key === 'couponDiscount';
            return (
              <div
                key={key}
                onClick={() => onClickKey(key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onClickKey(key);
                  }
                }}
                className="flex cursor-pointer items-center justify-between text-sm"
              >
                <p className="flex items-center gap-2 capitalize text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </p>
                <div className="flex items-center space-x-2">
                  <p className={`font-medium ${isDeduction ? 'text-red-600' : 'text-gray-900'}`}>
                    {isDeduction ? `-${formatCurrency(Number(value))}` : formatCurrency(Number(value))}
                  </p>
                  {key === 'claimedCoins' && (
                    <button type="button" onClick={onRemoveClaimedCoins} className="text-2xl text-red-600 hover:underline">
                      <IoClose />
                    </button>
                  )}
                  {key === 'couponDiscount' && (
                    <button type="button" onClick={onRemoveCoupon} className="text-2xl text-red-600 hover:underline">
                      <IoClose />
                    </button>
                  )}
                  {key === 'serviceCharge' && (
                    <button type="button" onClick={onOpenServiceChargeModal} className="text-2xl text-red-600 hover:underline">
                      <IoClose />
                    </button>
                  )}
                  {key === 'discount' && (
                    <button type="button" onClick={() => onSetActiveModal('discount')} className="text-2xl text-red-600 hover:underline">
                      <IoClose />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex justify-between border-t pb-[10rem] pt-2 text-base font-semibold">
            <p className="text-black">Total</p>
            <p className="text-black">{formatCurrency(currentBill.total)}</p>
          </div>
        </div>
      </>
    );
  },
);

BillSummary.displayName = 'BillSummary';
export default BillSummary;
