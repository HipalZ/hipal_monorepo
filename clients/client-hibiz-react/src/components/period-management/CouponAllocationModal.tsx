import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import CouponForm from '@/components/coupon-management/CouponForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type CouponCreatePayload, useGetBusinessCoupons } from '@/hooks/useBusinessCoupons';
import { cn } from '@/lib/utils.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Clock, Plus, Tag, Users } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

type CouponAllocation = {
  couponId: string;
  remaining: number;
  _id?: string;
};

type CouponAllocationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  currentAllocations: CouponAllocation[];
  onSave: (allocations: CouponAllocation[]) => void;
  isLoading: boolean;
  onCreateCoupon: (payload: CouponCreatePayload) => Promise<void>;
  isCreatingCoupon: boolean;
};

const CouponAllocationModal = ({
  open,
  onOpenChange,
  businessId,
  currentAllocations,
  onSave,
  isLoading,
  onCreateCoupon,
  isCreatingCoupon,
}: CouponAllocationModalProps) => {
  const { data: couponsResponse, isLoading: isLoadingCoupons } = useGetBusinessCoupons(businessId);
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize allocations from props
  useEffect(() => {
    if (open) {
      const newAllocations = new Map<string, number>();
      currentAllocations.forEach((allocation) => {
        newAllocations.set(allocation.couponId, allocation.remaining);
      });
      setAllocations(newAllocations);
      setError(null);
      setShowCreateForm(false);
    }
  }, [open, currentAllocations]);

  // Toggle coupon selection
  const toggleCoupon = (couponId: string, checked: boolean) => {
    const newAllocations = new Map(allocations);
    if (checked) {
      // Add with default remaining of 10
      newAllocations.set(couponId, 10);
    } else {
      // Remove
      newAllocations.delete(couponId);
    }
    setAllocations(newAllocations);
  };

  // Update remaining count
  const updateRemaining = (couponId: string, remaining: number) => {
    if (remaining < 1) {
      setError('Remaining count must be at least 1');
      return;
    }

    const newAllocations = new Map(allocations);
    newAllocations.set(couponId, remaining);
    setAllocations(newAllocations);
    setError(null);
  };

  // Handle save
  const handleSave = () => {
    const allocationArray: CouponAllocation[] = [];
    allocations.forEach((remaining, couponId) => {
      allocationArray.push({ couponId, remaining });
    });
    onSave(allocationArray);
  };

  // Handle create coupon
  const handleCreateCoupon = async (formData: CouponCreatePayload) => {
    try {
      await onCreateCoupon(formData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create coupon:', error);
      // Keep the form open if there's an error
    }
  };

  // Get coupons from response
  const coupons = couponsResponse?.data || [];
  const hasCoupons = coupons.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[100dvh] flex-col p-4 md:max-h-[85dvh] md:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <span>Coupon Allocations</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {showCreateForm ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hide-scrollbar h-[90dvh] flex-1 overflow-y-auto overflow-x-hidden pb-[20rem]"
            >
              <CouponForm onSubmit={handleCreateCoupon} isSubmitting={isCreatingCoupon} onCancel={() => setShowCreateForm(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="coupon-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-hidden"
            >
              {isLoadingCoupons ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                  <p className="ml-3 text-sm text-gray-500">Loading coupons...</p>
                </div>
              ) : !hasCoupons ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Tag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium">No Coupons Available</h3>
                  <p className="mb-4 text-sm text-gray-500">You haven't created any coupons yet. Create a coupon to allocate it to this period.</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus size={16} className="mr-2" />
                    Create New Coupon
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Select coupons to allocate to this period and set the available quantity.</p>
                    <Button size="sm" onClick={() => setShowCreateForm(true)}>
                      <Plus size={14} className="mr-1" />
                      New
                    </Button>
                  </div>

                  <ScrollArea className="-mr-4 h-[100dvh] pr-4 lg:max-h-[80dvh]">
                    <div className="space-y-4 pb-[10rem]">
                      {coupons.map((coupon) => {
                        const isSelected = allocations.has(coupon._id);
                        const remaining = allocations.get(coupon._id) || 0;

                        return (
                          <div
                            key={coupon._id}
                            className={cn(
                              'relative overflow-hidden rounded-lg border transition-all duration-200',
                              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                            )}
                          >
                            {isSelected && (
                              <div className="absolute right-0 top-0">
                                <div className="h-16 w-16 overflow-hidden">
                                  <div className="bg-primary text-base-100 absolute right-[-35px] top-[12px] rotate-45 px-8 py-1 text-[10px] font-medium">
                                    Selected
                                  </div>
                                </div>
                              </div>
                            )}

                            <div
                              onClick={() => {
                                toggleCoupon(coupon._id, !isSelected);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  toggleCoupon(coupon._id, !isSelected);
                                }
                              }}
                              className="p-4"
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  id={`coupon-${coupon._id}`}
                                  checked={isSelected}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                  className="mt-1"
                                />

                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <Label htmlFor={`coupon-${coupon._id}`} className="cursor-pointer text-base font-medium">
                                        {coupon.name}
                                      </Label>

                                      <div className="mt-1 text-xs text-gray-500">
                                        {coupon.config.discountType === 'PERCENTAGE' ? (
                                          <span>
                                            {coupon.config.value}% discount
                                            {coupon.config.upto && ` (up to ₹${coupon.config.upto})`}
                                          </span>
                                        ) : (
                                          <span>₹{coupon.config.value} off</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1.5">
                                      <Tag className="text-primary h-3.5 w-3.5" />
                                      <span className="text-xs text-gray-700">Base: ₹{coupon.bookingMeta.baseCharge}</span>
                                    </div>

                                    {coupon.bookingMeta.redeemableCoverCharge && (
                                      <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1.5">
                                        <Clock className="text-primary h-3.5 w-3.5" />
                                        <span className="text-xs text-gray-700">Cover: ₹{coupon.bookingMeta.redeemableCoverCharge}</span>
                                      </div>
                                    )}

                                    {coupon.bookingMeta.minGuests && (
                                      <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1.5">
                                        <Users className="text-primary h-3.5 w-3.5" />
                                        <span className="text-xs text-gray-700">Min Guests: {coupon.bookingMeta.minGuests}</span>
                                      </div>
                                    )}
                                  </div>

                                  {isSelected && (
                                    <div className="bg-primary/10 mt-4 flex items-center gap-3 rounded-md p-2">
                                      <Label htmlFor={`remaining-${coupon._id}`} className="text-primary whitespace-nowrap text-sm font-medium">
                                        Available Quantity:
                                      </Label>
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateRemaining(coupon._id, Math.max(1, remaining - 1));
                                          }}
                                          className="flex h-8 w-8 items-center justify-center rounded-l-md border border-r-0 bg-white hover:bg-gray-50"
                                          disabled={remaining <= 1}
                                        >
                                          -
                                        </button>
                                        <Input
                                          id={`remaining-${coupon._id}`}
                                          type="number"
                                          min="1"
                                          value={remaining}
                                          onClick={(e) => e.stopPropagation()}
                                          onFocus={(e) => e.stopPropagation()}
                                          onChange={(e) => updateRemaining(coupon._id, Number.parseInt(e.target.value) || 1)}
                                          className="h-8 w-16 rounded-none border-x-0 text-center"
                                        />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateRemaining(coupon._id, remaining + 1);
                                          }}
                                          className="h-8 w-8 rounded-r-md border bg-white"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showCreateForm && hasCoupons && (
          <AdvancedBottomButton
            fixed={false}
            maxWidth="30rem"
            buttons={[
              {
                text: '',
                onClick: () => onOpenChange(false),
                disable: isLoading,
                isBackButton: true,
                className: 'pl-3 rounded-md w-full',
              },
              {
                text: isLoading ? 'Saving...' : 'Save Allocations',
                onClick: handleSave,
                isLoading: isLoading,
                className: 'rounded-md w-full !ml-0',
              },
            ]}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default memo(CouponAllocationModal);
