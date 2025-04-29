import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { type Coupon, type CouponCreatePayload, useGetBusinessCoupons } from '@/hooks/useBusinessCoupons';
import type { PeriodConfig } from '@/hooks/useBusinessPeriodConfig.ts';
import { motion } from 'framer-motion';
import { DollarSign, Edit2, Percent, Tag, Ticket, ToggleLeft, ToggleRight } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import PeriodEditForm from './PeriodEditForm';

type PeriodCardProps = {
  periodConfig: PeriodConfig;
  periodIndex: number;
  dayIndex: number;
  periodInfo: { icon: React.ComponentType; label: string; color: string };
  dayName: string;
  onTogglePeriod: (day: number, period: number) => Promise<void>;
  onSavePeriod: (day: number, period: number, base: number, redeemable: number, isOpen: boolean, couponAllocs?: any[]) => Promise<void>;
  isActionInProgress: boolean;
  viewMode: 'day' | 'period';
  businessId: string;
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>;
  isCreatingCoupon: boolean;
};

const PeriodCard: React.FC<PeriodCardProps> = ({
  periodConfig,
  periodIndex,
  dayIndex,
  periodInfo,
  dayName,
  onTogglePeriod,
  onSavePeriod,
  isActionInProgress,
  viewMode,
  businessId,
  onCreateCoupon,
  isCreatingCoupon,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    baseCharge: periodConfig.baseCharge,
    redeemableCoverCharge: periodConfig.redeemableCoverCharge,
    isOpen: periodConfig.isOpen,
    couponAllocations: periodConfig.couponAllocations || [],
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon>(null);
  console.log('periodConfig', selectedCoupon);
  const { data: couponsResponse } = useGetBusinessCoupons(businessId);
  const coupons = couponsResponse?.data || [];

  // Memoize coupon lookup map
  const couponsById = useMemo(() => new Map(coupons.map((c) => [c._id, c])), [coupons]);

  // Stable handlers
  const getCouponName = useCallback((id: string) => couponsById.get(id)?.name || 'Unknown', [couponsById]);
  const handleStartEditing = useCallback(() => setIsEditing(true), []);
  const handleCancelEdit = useCallback(() => setIsEditing(false), []);
  const handleSave = useCallback(async () => {
    await onSavePeriod(
      dayIndex,
      periodIndex,
      editValues.baseCharge,
      editValues.redeemableCoverCharge,
      editValues.isOpen,
      editValues.couponAllocations,
    );
    setIsEditing(false);
  }, [dayIndex, periodIndex, editValues, onSavePeriod]);
  const handleToggle = useCallback(() => onTogglePeriod(dayIndex, periodIndex), [dayIndex, periodIndex, onTogglePeriod]);
  const handleFieldChange = useCallback(
    (field: string, value: any) =>
      setEditValues((prev) => ({
        ...prev,
        [field]: field === 'isOpen' || field === 'couponAllocations' ? value : Number(value),
      })),
    [],
  );
  const handleCouponClick = useCallback(
    (couponId: string) => {
      const coupon = couponsById.get(couponId);
      console.log('Selected coupon:', coupon);
      if (coupon) setSelectedCoupon(coupon);
    },
    [couponsById],
  );

  const { icon: PeriodIcon, color, label } = periodInfo;

  const containerClass = useMemo(
    () =>
      `p-4 rounded-lg border ${
        periodConfig.isOpen
          ? periodConfig.couponAllocations?.length
            ? 'bg-white border-purple-200 shadow-sm'
            : 'bg-white border-gray-200 shadow-sm'
          : 'bg-gray-50 border-gray-100'
      }`,
    [periodConfig],
  );

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className={containerClass}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {viewMode === 'day' ? (
            <>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${color.replace('text-', 'bg-').replace('500', '100')} ${color}`}
              >
                <PeriodIcon size={16} />
              </div>
              <h4 className="font-medium">{label}</h4>
            </>
          ) : (
            <>
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                <span className="text-xs font-medium">{dayName.substring(0, 2)}</span>
              </div>
              <h4 className="font-medium">{dayName}</h4>
            </>
          )}
          <Badge variant={periodConfig.isOpen ? 'default' : 'destructive'} className="ml-1">
            {periodConfig.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={handleStartEditing} className="h-8 w-8 p-0" disabled={isActionInProgress}>
            <Edit2 size={16} />
          </Button>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <PeriodEditForm
          editValues={editValues}
          onEditFieldChange={handleFieldChange}
          onCancel={handleCancelEdit}
          onSave={handleSave}
          isActionInProgress={isActionInProgress}
          businessId={businessId}
          onCreateCoupon={onCreateCoupon}
          isCreatingCoupon={isCreatingCoupon}
        />
      ) : (
        <div className="space-y-3">
          {/* Charges */}
          <div className="grid grid-cols-2 gap-4 rounded-md bg-gray-50 p-3">
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">Base Charge</span>
              <span className="font-medium">₹{periodConfig.baseCharge}</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-500">Redeemable Cover</span>
              <span className="font-medium">₹{periodConfig.redeemableCoverCharge}</span>
            </div>
          </div>

          {/* Coupon Allocations */}
          {periodConfig.couponAllocations && periodConfig.couponAllocations.length > 0 ? (
            <div className="rounded-md bg-purple-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-purple-700">
                  <Tag size={12} />
                  Coupon Allocations
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">{periodConfig.couponAllocations.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {periodConfig.couponAllocations.map((coupon) => (
                  <Badge
                    key={coupon._id || coupon.couponId}
                    variant="outline"
                    className="flex cursor-pointer items-center gap-1.5 border-purple-200 px-2 py-1 transition-colors hover:bg-purple-100"
                    onClick={() => handleCouponClick(coupon.couponId)}
                  >
                    <span className="max-w-[80px] truncate">{getCouponName(coupon.couponId)}</span>
                    <span className="rounded-full bg-purple-100 px-1.5 text-purple-700">{coupon.remaining}</span>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-gray-50 p-3 text-center">
              <span className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Tag size={12} />
                No coupons allocated
              </span>
            </div>
          )}

          {/* Toggle Button */}
          <Button
            variant={periodConfig.isOpen ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleToggle}
            className="mt-1 h-9 w-full"
            disabled={isActionInProgress}
          >
            {periodConfig.isOpen ? (
              <span className="flex items-center gap-1.5">
                <ToggleLeft size={16} />
                Close Period
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ToggleRight size={16} />
                Open Period
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Coupon Detail Modal */}
      <Dialog open={!!selectedCoupon} onOpenChange={(open) => !open && setSelectedCoupon(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span>Coupon Details</span>
            </DialogTitle>
            <DialogDescription>Information about this coupon allocation</DialogDescription>
          </DialogHeader>

          {selectedCoupon && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    selectedCoupon.config.discountType === 'PERCENTAGE' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {selectedCoupon.config.discountType === 'PERCENTAGE' ? <Percent size={24} /> : <DollarSign size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCoupon.name}</h3>
                  <Badge variant={selectedCoupon.isActive ? 'default' : 'secondary'}>{selectedCoupon.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Discount Type</h4>
                  <p className="text-base font-medium">{selectedCoupon.config.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}</p>
                </div>

                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-500">Discount Value</h4>
                  <p className="text-base font-medium">
                    {selectedCoupon.config.discountType === 'PERCENTAGE' ? `${selectedCoupon.config.value}%` : `₹${selectedCoupon.config.value}`}
                  </p>
                </div>

                {selectedCoupon.config.discountType === 'PERCENTAGE' && selectedCoupon.config.upto && (
                  <div className="col-span-2">
                    <h4 className="mb-1 text-sm font-medium text-gray-500">Maximum Discount</h4>
                    <p className="text-base font-medium">Up to ₹{selectedCoupon.config.upto}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500">Booking Meta</h4>
                <div className="grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-3">
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Base Charge</span>
                    <span className="font-medium">₹{selectedCoupon.bookingMeta.baseCharge}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Redeemable Cover</span>
                    <span className="font-medium">₹{selectedCoupon.bookingMeta.redeemableCoverCharge}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs text-gray-500">Min Guests</span>
                    <span className="font-medium">{selectedCoupon.bookingMeta.minGuests}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-500">Allocation Details</h4>
                <div className="rounded-md bg-purple-50 p-3">
                  {periodConfig.couponAllocations.find((c) => c.couponId === selectedCoupon._id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Available Quantity:</span>
                      <Badge variant="secondary" className="font-bold">
                        {periodConfig.couponAllocations.find((c) => c.couponId === selectedCoupon._id)?.remaining}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Memoize entire component with custom comparator to deep-check key props
export default memo(
  PeriodCard,
  (prev, next) =>
    prev.businessId === next.businessId && prev.dayIndex === next.dayIndex && prev.periodConfig.baseCharge === next.periodConfig.baseCharge,
);
