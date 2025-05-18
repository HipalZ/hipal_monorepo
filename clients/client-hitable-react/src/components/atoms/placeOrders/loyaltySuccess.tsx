import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Award, Coins } from "lucide-react";

const LoyaltySuccess = (props) => {
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
  } = props;
  const formatDiscount = (value: number, discountType: string) => {
    return discountType === "PERCENTAGE" ? `${value}%` : `₹${value}`;
  };

  return (
    <div className="space-y-2">
      <div>
        <div className="grid grid-cols-2 gap-1">
          {userData?.name && (
            <>
              <p className="text-sm text-gray-500 font-medium">Customer Name</p>
              <p className="text-sm text-black font-semibold">
                {userData.name}
              </p>
            </>
          )}
          {userData?.phone && (
            <>
              <p className="text-sm text-gray-500 font-medium">Phone Number</p>
              <p className="text-sm text-black font-semibold">
                {userData.phone}
              </p>
            </>
          )}
          {userData?.dob > 0 && (
            <>
              <p className="text-sm text-gray-500 font-medium">Birthday</p>
              <p className="text-sm text-black font-semibold">
                {new Date(userData.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </>
          )}
          {userData?.tier && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-amber-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Loyalty Tier
                </p>
                <p className="text-base font-bold">{userData.tier}</p>
              </div>
            </div>
          )}
        </div>
        <article className="rounded-lg flex items-center justify-between">
          <h4 className="font-medium text-gray-700">Available Coinz</h4>
          <p className="text-2xl font-bold text-green-500">{availableCoinz}</p>
        </article>
        {userData?.coins !== undefined && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-purple-100">
                  Available Coinz
                </p>
                <p className="text-2xl font-bold">{userData.coins}</p>
              </div>
              <Coins className="h-10 w-10 text-purple-200 opacity-80" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          disabled={availedCoupon !== null || applyCoinz > 0}
          value={coinzAdded}
          onChange={handleApplyCoinz}
          placeholder="Enter Coinz"
        />
        {applyCoinz > 0 ? (
          <Button className="whitespace-nowrap" onClick={removeApplyCoinz}>
            Remove
          </Button>
        ) : (
          <Button className="whitespace-nowrap" onClick={confirmApplyCoinz}>
            Apply
          </Button>
        )}
      </div>
      {applyCoinz ? (
        <p className="text-sm text-green-600">
          Applied <strong>{applyCoinz}</strong> Coinz on this bill.
        </p>
      ) : null}
      {availedCoupon && (
        <article className="flex items-center justify-between p-2 mt-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-green-600">
            Coupon "<strong>{availedCoupon?.name}</strong>" applied — Discount:
            ₹{getCouponDiscountAmount(availedCoupon)}
          </p>
          <Button
            variant="outline"
            className="text-red-500 bg-white"
            onClick={removeCoupon}
          >
            Remove
          </Button>
        </article>
      )}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-lg">
          Available Coupons
        </h4>
        <div className="max-h-[400px] overflow-y-auto pr-1 pb-40">
          {couponz?.map((coupon) => {
            if (!coupon) return null;
            return (
              <section
                key={coupon?._id}
                className="flex my-4 rounded-2xl inter"
              >
                <article className="w-full px-2 py-4 text-black bg-white border shadow-md rounded-2xl">
                  <div
                    className={cn(
                      availedCoupon?._id === coupon?._id
                        ? "bg-[#00C37E]"
                        : "bg-[#9268EC]",
                      "h-4 -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2",
                    )}
                  />
                  <article className="flex items-center justify-between">
                    <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                      {coupon?.name}
                      <span className="ml-1 text-xs text-gray-500">
                        {coupon?.availableDays?.join(", ") || "All days"}
                      </span>
                    </h1>
                    {availedCoupon?._id === coupon?._id ? (
                      <button
                        type="button"
                        className="text-[#f13f8a] text-sm mt-1 font-bold"
                        onClick={removeCoupon}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => applyCoupon(coupon)}
                        className={cn(
                          "on_active_bounce text-[#9268EC] text-sm mt-1 font-bold",
                        )}
                      >
                        APPLY
                      </button>
                    )}
                  </article>
                  <div className="relative z-10 gap-2 px-1 mt-2">
                    <div className="flex flex-col items-start space-y-1">
                      <p className="text-xs font-semibold text-[#00C37E]">
                        Get{" "}
                        {formatDiscount(
                          coupon?.config?.value,
                          coupon?.config?.discountType,
                        )}{" "}
                        off on this bill
                      </p>
                    </div>
                    <hr
                      className="w-full col-span-2 my-3 -mx-2"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                          "#000000",
                        )}' strokeWidth='4' strokeDasharray='6%2c 14' strokeDashoffset='10' strokeLinecap='square'/%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        height: "3px",
                        border: "none",
                      }}
                    />
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-xs text-[#858585]">
                        Use this coupon & get{" "}
                        {formatDiscount(
                          coupon?.config?.value,
                          coupon?.config?.discountType,
                        )}{" "}
                        off on bill above ₹ {coupon?.conditions?.billValue}.
                        Maximum discount: {coupon?.config?.upto}
                      </h3>
                    </div>
                  </div>
                </article>
              </section>
            );
          })}
        </div>
        <div className="max-w-[30rem] pt-2 fixed bottom-2 p-2 left-1/2 -translate-x-1/2 w-full z-10 bg-white border-t">
          <Button onClick={handleCloseModal} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySuccess;
