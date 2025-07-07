import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Award, Coins, CheckCircle } from "lucide-react"; // Added CheckCircle icon
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components
import { Badge } from "@/components/ui/badge"; // Import Badge
import type { IBillData } from "@/components/types/hiClientzData.ts"; // Assuming this path is correct

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
  billData: IBillData; // This prop is now used
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
    billData, // Destructure billData
  } = props;

  const formatDiscount = (value: number, discountType: string) => {
    return discountType === "PERCENTAGE" ? `${value}%` : `₹${value}`;
  };

  const appliedCoupon = useMemo(() => {
    if (!billData.couponId) return null;
    return couponz.find((coupon) => coupon._id === billData.couponId);
  }, [billData]);

  const isCouponApplied = useMemo(() => {
    if (!appliedCoupon) return false;
    return appliedCoupon.conditions.billValue > 0;
  }, [appliedCoupon]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-20 hide-scrollbar">
        {/* Customer Information Card */}
        {(userData?.name || userData?.phone || userData?.dob > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-2 gap-x-4">
              {userData?.name && (
                <>
                  <p className="text-sm text-gray-500 font-medium">
                    Customer Name
                  </p>
                  <p className="text-sm text-right text-black font-semibold">
                    {userData.name}
                  </p>
                </>
              )}
              {userData?.phone && (
                <>
                  <p className="text-sm text-gray-500 font-medium">
                    Phone Number
                  </p>
                  <p className="text-sm text-right text-black font-semibold">
                    {userData.phone}
                  </p>
                </>
              )}
              {userData?.dob > 0 && (
                <>
                  <p className="text-sm text-gray-500 font-medium">Birthday</p>
                  <p className="text-sm text-right text-black font-semibold">
                    {new Date(userData.dob).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Loyalty Tier Card */}
        {userData?.tier && (
          <Card className="bg-gray-50 border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-amber-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Loyalty Tier
                </p>
                <p className="text-base font-bold">{userData.tier}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Coinz Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
          <CardContent className="flex justify-between items-center p-4">
            <div>
              <p className="text-sm font-medium text-purple-100">
                Available Coinz
              </p>
              <p className="text-3xl font-bold">{availableCoinz}</p>
            </div>
            <Coins className="h-12 w-12 text-purple-200 opacity-80" />
          </CardContent>
        </Card>

        {/* Apply Coinz Section - Only show if no coupon is applied */}
        {!appliedCoupon?._id && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apply Coinz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  disabled={applyCoinz > 0} // Only disable if coinz are already applied
                  value={coinzAdded}
                  onChange={handleApplyCoinz}
                  placeholder="Enter Coinz to apply"
                  type="number"
                  className="flex-1"
                />
                {applyCoinz > 0 ? (
                  <Button
                    className="whitespace-nowrap"
                    onClick={removeApplyCoinz}
                    variant="destructive"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    className="whitespace-nowrap"
                    onClick={confirmApplyCoinz}
                    disabled={!coinzAdded}
                  >
                    Apply
                  </Button>
                )}
              </div>
              {applyCoinz > 0 && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Applied{" "}
                    <strong className="font-semibold">{applyCoinz}</strong>{" "}
                    Coinz on this bill.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Applied Coupon Section - Only show if no coinz are applied */}
        {appliedCoupon?._id && (
          <Card className="border-green-500 border-2 bg-green-50 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base text-green-700">
                Coupon Applied!
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-200 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Applied
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-green-800">
                "<strong>{appliedCoupon?.name}</strong>" — Discount: ₹
                {getCouponDiscountAmount(appliedCoupon).toFixed(2)}
              </p>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 bg-transparent"
                onClick={removeCoupon}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Coupons Section - Only show if no coinz are applied */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Coupons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {couponz?.length === 0 && (
              <p className="text-center text-gray-500">
                No coupons available at the moment.
              </p>
            )}
            {couponz?.map((coupon) => {
              if (!coupon) return null;
              const isCouponAvailed = availedCoupon?._id === coupon?._id;
              return (
                <Card
                  key={coupon?._id}
                  className={cn(
                    "relative overflow-hidden shadow-sm",
                    isCouponAvailed
                      ? "border-green-500 border-2"
                      : "border-gray-200",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-2",
                      isCouponAvailed ? "bg-[#00C37E]" : "bg-[#9268EC]",
                    )}
                  />
                  <CardContent className="pt-6 pb-4 px-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold leading-none">
                        {coupon?.name}
                        {coupon?.availableDays?.length > 0 && (
                          <span className="ml-2 text-xs text-gray-500 font-normal">
                            ({coupon?.availableDays?.join(", ")})
                          </span>
                        )}
                      </h3>
                      {isCouponAvailed ? (
                        <Badge className="bg-green-100 text-green-800">
                          Applied
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => applyCoupon(coupon)}
                          className="text-[#9268EC] text-sm font-bold px-3 py-1 h-auto"
                          variant="outline"
                          disabled={isCouponApplied || false} // Disable if another coupon is already availed
                        >
                          APPLY
                        </Button>
                      )}
                    </div>

                    <div className="text-sm font-semibold text-[#00C37E]">
                      Get{" "}
                      {formatDiscount(
                        coupon?.config?.value,
                        coupon?.config?.discountType,
                      )}{" "}
                      off on this bill
                    </div>

                    {/* Dashed line separator */}
                    <div className="relative my-3">
                      <div className="absolute inset-x-0 top-1/2 h-px bg-gray-300 border-t border-dashed border-gray-300" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-gray-300 -ml-1.5" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border border-gray-300 -mr-1.5" />
                    </div>

                    <p className="text-xs text-gray-600">
                      Use this coupon & get{" "}
                      {formatDiscount(
                        coupon?.config?.value,
                        coupon?.config?.discountType,
                      )}{" "}
                      off on bill above ₹ {coupon?.conditions?.billValue}.
                      Maximum discount: ₹{coupon?.config?.upto}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Done Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Button onClick={handleCloseModal} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
};

const LoyaltySuccess = memo(MemoLoyaltySuccess);

export default LoyaltySuccess;
