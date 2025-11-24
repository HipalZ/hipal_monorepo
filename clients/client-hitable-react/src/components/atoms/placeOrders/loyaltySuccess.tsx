import { useStaffPermissionStore } from '@/components/store/usePermissions';
import type { IBillData } from '@/components/types/hiClientzData.ts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Award, CheckCircle, Coins } from 'lucide-react';
import { memo, useMemo } from 'react';

const MemoLoyaltySuccess = (props: {
  userData: {
    name?: string;
    phone?: string;
    dob?: number;
    tier?: string;
    coins?: number;
  };
  availableCoinz: number;
  applyCoinz: number;
  availedCoupon: {
    _id: string;
    name: string;
    config: { value: number; discountType: string; upto: number };
    conditions: { billValue: number };
    availableDays?: string[];
  } | null;
  coinzAdded: string;
  handleApplyCoinz: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeApplyCoinz: () => void;
  confirmApplyCoinz: () => void;
  getCouponDiscountAmount: (coupon: any) => number;
  couponz: Array<{
    _id: string;
    name: string;
    config: { value: number; discountType: string; upto: number };
    conditions: { billValue: number };
    availableDays?: string[];
  }>;
  handleCloseModal: () => void;
  removeCoupon: () => void;
  applyCoupon: (coupon: any) => void;
  billData: IBillData;
}) => {
  const {
    userData,
    availableCoinz,
    applyCoinz,
    availedCoupon,
    coinzAdded,
    handleApplyCoinz,
    removeApplyCoinz,
    confirmApplyCoinz,
    getCouponDiscountAmount,
    couponz,
    handleCloseModal,
    removeCoupon,
    applyCoupon,
    billData,
  } = props;

  // --- PERMISSIONS ---
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canUseLoyalty = hasPermission('add_coins');
  const canUseCoupon = hasPermission('add_coupon');

  const formatDiscount = (value: number, discountType: string) => {
    return discountType === 'PERCENTAGE' ? `${value}%` : `₹${value}`;
  };

  const appliedCoupon = useMemo(() => {
    if (!billData.couponId) return null;
    return couponz.find((coupon) => coupon._id === billData.couponId) || null;
  }, [billData.couponId, couponz]);

  const isCouponApplied = useMemo(() => {
    if (!appliedCoupon) return false;
    return appliedCoupon.conditions.billValue > 0;
  }, [appliedCoupon]);

  const showApplyCoinzSection = canUseLoyalty && !appliedCoupon?._id;
  const showAppliedCouponSection = canUseCoupon && appliedCoupon?._id;
  const showAvailableCouponsSection = canUseCoupon;

  return (
    <div className="flex h-full flex-col">
      <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto pb-20">
        {/* Customer Information Card */}
        {(userData?.name || userData?.phone || userData?.dob > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
              {userData?.name && (
                <>
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                  <p className="text-right text-sm font-semibold text-black">{userData.name}</p>
                </>
              )}
              {userData?.phone && (
                <>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-right text-sm font-semibold text-black">{userData.phone}</p>
                </>
              )}
              {userData?.dob > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-500">Birthday</p>
                  <p className="text-right text-sm font-semibold text-black">
                    {new Date(userData.dob).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loyalty Tier Card */}
        {userData?.tier && (
          <Card className="border-none bg-gray-50 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-amber-100 p-2">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Loyalty Tier</p>
                <p className="text-base font-bold">{userData.tier}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Coinz Card (only if allowed) */}
        {canUseLoyalty && (
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-purple-100">Available Coinz</p>
                <p className="text-3xl font-bold">{availableCoinz}</p>
              </div>
              <Coins className="h-12 w-12 text-purple-200 opacity-80" />
            </CardContent>
          </Card>
        )}

        {/* Apply Coinz Section - Only show if: permission + no coupon applied */}
        {showApplyCoinzSection && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply Coinz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  disabled={applyCoinz > 0}
                  value={coinzAdded}
                  onChange={handleApplyCoinz}
                  placeholder="Enter Coinz to apply"
                  type="number"
                  className="flex-1"
                />
                {applyCoinz > 0 ? (
                  <Button className="whitespace-nowrap" onClick={removeApplyCoinz} variant="destructive">
                    Remove
                  </Button>
                ) : (
                  <Button className="whitespace-nowrap" onClick={confirmApplyCoinz} disabled={!coinzAdded}>
                    Apply
                  </Button>
                )}
              </div>
              {applyCoinz > 0 && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Applied <strong className="font-semibold">{applyCoinz}</strong> Coinz on this bill.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applied Coupon Section - visible only if coupon permission */}
        {showAppliedCouponSection && appliedCoupon && (
          <Card className="border-2 border-green-500 bg-green-50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base text-green-700">Coupon Applied!</CardTitle>
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" /> Applied
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                "<strong>{appliedCoupon.name}</strong>" — Discount: ₹{getCouponDiscountAmount(appliedCoupon).toFixed(2)}
              </p>
              <Button variant="outline" className="border-red-300 bg-transparent text-red-600" onClick={removeCoupon}>
                Remove
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Coupons Section - only if coupon permission */}
        {showAvailableCouponsSection && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Coupons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {couponz?.length === 0 && <p className="text-center text-gray-500">No coupons available at the moment.</p>}
              {couponz?.map((coupon) => {
                if (!coupon) return null;
                const isCouponAvailed = availedCoupon?._id === coupon._id;

                return (
                  <Card
                    key={coupon._id}
                    className={cn('relative overflow-hidden shadow-sm', isCouponAvailed ? 'border-2 border-green-500' : 'border-gray-200')}
                  >
                    <div className={cn('absolute left-0 right-0 top-0 h-2', isCouponAvailed ? 'bg-[#00C37E]' : 'bg-[#9268EC]')} />
                    <CardContent className="space-y-2 px-4 pb-4 pt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold leading-none">
                          {coupon.name}
                          {coupon.availableDays?.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-gray-500">({coupon.availableDays.join(', ')})</span>
                          )}
                        </h3>
                        {isCouponAvailed ? (
                          <Badge className="bg-green-100 text-green-800">Applied</Badge>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => applyCoupon(coupon)}
                            className="h-auto px-3 py-1 text-sm font-bold text-[#9268EC]"
                            variant="outline"
                            disabled={isCouponApplied || false}
                          >
                            APPLY
                          </Button>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-[#00C37E]">
                        Get {formatDiscount(coupon.config.value, coupon.config.discountType)} off on this bill
                      </div>

                      {/* Dashed line separator */}
                      <div className="relative my-3">
                        <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-gray-300 bg-gray-300" />
                        <div className="absolute left-0 top-1/2 -ml-1.5 h-3 w-3 -translate-y-1/2 rounded-full border border-gray-300 bg-white" />
                        <div className="absolute right-0 top-1/2 -mr-1.5 h-3 w-3 -translate-y-1/2 rounded-full border border-gray-300 bg-white" />
                      </div>

                      <p className="text-xs text-gray-600">
                        Use this coupon & get {formatDiscount(coupon.config.value, coupon.config.discountType)} off on bill above ₹{' '}
                        {coupon.conditions.billValue}. Maximum discount: ₹{coupon.config.upto}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sticky Done Button */}
      <div className="sticky bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
        <Button onClick={handleCloseModal} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
};

const LoyaltySuccess = memo(MemoLoyaltySuccess);
export default LoyaltySuccess;
