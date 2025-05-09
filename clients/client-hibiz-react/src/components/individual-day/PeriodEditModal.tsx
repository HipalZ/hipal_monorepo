import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatTimeRange, getPeriodInfo } from '@/components/utils/timeUtils';
import type { Coupon, CouponCreatePayload } from '@/hooks/useBusinessCoupons.ts';
import { Clock, Tag, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import CouponAllocationModal from '../period-management/CouponAllocationModal.tsx';
import type { DayPeriodConfig } from '../types/business-day-config.ts';
import { Switch } from '../ui/switch.tsx';
import type { CouponAllocation } from '@/hooks/useBusinessPeriodConfig.ts';

type PeriodEditModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  periodId: number;
  periodConfig: DayPeriodConfig;
  coupons: Coupon[];
  isUpdating: boolean;
  isCreatingCoupon: boolean;
  onSave: (baseCharge: number, redeemableCoverCharge: number, couponAllocations: any[], isOpen?: boolean) => Promise<boolean>;
  onCreateCoupon: (couponData: CouponCreatePayload) => Promise<boolean>;
};

const PeriodEditModal = ({
  isOpen,
  onOpenChange,
  businessId,
  periodId,
  periodConfig,
  coupons,
  isUpdating,
  isCreatingCoupon,
  onSave,
  onCreateCoupon,
}: PeriodEditModalProps) => {
  // Get period info (name, time range, etc.)
  const periodInfo = getPeriodInfo(periodId);
  // Initialize state with period config or defaults
  const [baseCharge, setBaseCharge] = useState(periodConfig?.baseCharge || 0);
  const [redeemableCoverCharge, setRedeemableCoverCharge] = useState(periodConfig?.redeemableCoverCharge || 0);
  const [couponAllocations, setCouponAllocations] = useState<CouponAllocation[]>(periodConfig?.couponAllocations || []);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState<boolean>(periodConfig?.isOpen || false);

  // Handle save
  const handleSave = useCallback(async () => {
    const success = await onSave(Number(baseCharge), Number(redeemableCoverCharge), couponAllocations, isPeriodOpen);
    if (success) {
      onOpenChange(false);
    }
  }, [baseCharge, isPeriodOpen, redeemableCoverCharge, couponAllocations, onSave, onOpenChange]);

  // Handle coupon allocations save
  const handleSaveCouponAllocations = useCallback((allocations: CouponAllocation[]) => {
    setCouponAllocations(allocations);
    setIsCouponModalOpen(false);
  }, []);

  const removeCoupon = useCallback((couponId: string) => {
    setCouponAllocations((prev) => prev.filter((allocation) => allocation.couponId !== couponId));
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="hide-scrollbar h-[100vh] overflow-y-auto pb-[10rem] lg:h-[80dvh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Edit {periodInfo.name} Time Period</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Period Info */}
            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Time Range:</span>
                <span className="font-semibold">{formatTimeRange(periodInfo.start, periodInfo.end)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <b>{periodConfig.isOpen ? 'Close Time Period' : 'Open Time Period'}</b>
              <Switch
                checked={isPeriodOpen}
                onCheckedChange={setIsPeriodOpen}
                className={`ml-auto ${isPeriodOpen ? 'bg-green-500' : 'bg-gray-300'}`}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Pricing</Label>
                <p className="text-sm text-gray-500">Set the base price and redeemable cover charge</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="baseCharge">
                    Base Price (₹)
                  </Label>
                  <Input id="baseCharge" type="number" min="0" value={baseCharge} onChange={(e) => setBaseCharge(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="redeemableCoverCharge">
                    Redeemable Cover (₹)
                  </Label>
                  <Input
                    id="redeemableCoverCharge"
                    type="number"
                    min="0"
                    value={redeemableCoverCharge}
                    onChange={(e) => setRedeemableCoverCharge(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Coupon Allocations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between">
                <div>
                  <Label className="text-base font-semibold">Coupon Allocations</Label>
                  <p className="text-sm text-gray-500">Manage coupons available for this period</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsCouponModalOpen(true)}>
                  <Tag className="mr-1 h-3.5 w-3.5" />
                  Manage Coupons
                </Button>
              </div>

              <div className="rounded-md border border-gray-200 p-3">
                {couponAllocations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Tag className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">No coupons allocated to this period</p>
                    <Button variant="link" size="sm" className="text-primary mt-1" onClick={() => setIsCouponModalOpen(true)}>
                      Allocate coupons
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">Allocated Coupons</span>
                      <span className="text-gray-500">{couponAllocations.length} coupons</span>
                    </div>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {couponAllocations.map((allocation, index) => {
                        const coupon = coupons.find((c) => c._id === allocation.couponId);
                        return (
                          <div key={index} className="relative flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm">
                            <div>
                              <span className="font-medium">{coupon?.name || 'Unknown Coupon'}</span>
                              {coupon && (
                                <span className="ml-1 text-gray-500">
                                  ({coupon.config.discountType === 'PERCENTAGE' ? `${coupon.config.value}%` : `₹${coupon.config.value}`})
                                </span>
                              )}
                            </div>
                            <X
                              onClick={() => removeCoupon(coupon?._id)}
                              size={16}
                              className="absolute bottom-2.5 right-2 cursor-pointer text-red-700"
                            />
                            <span className="pr-8 text-gray-600">{allocation.remaining} available</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <section className="mt-4 flex gap-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </section>
        </DialogContent>
      </Dialog>

      <CouponAllocationModal
        open={isCouponModalOpen}
        onOpenChange={setIsCouponModalOpen}
        businessId={businessId}
        currentAllocations={couponAllocations}
        onSave={handleSaveCouponAllocations}
        isLoading={isUpdating}
        onCreateCoupon={onCreateCoupon}
        isCreatingCoupon={isCreatingCoupon}
      />
    </>
  );
};

export default memo(PeriodEditModal);
