import CouponImages from "@/assets/coupon/coupon card.png";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useCouponsStore from "@/components/store/useCouponsStore";
import type { ICoupon } from "@/components/types/businessData";
import { useGetAllCoupons } from "@/hooks/useCoupon";
import { cn } from "@hi/common";
import { memo, useCallback, useMemo } from "react";

const MemoCouponListAnalytics = () => {
  const { coupons, isLoading } = useGetAllCoupons();
  const {
    filter,
    setFilter,
    setCouponImage,
    setBgColor,
    setSelectedPage,
    setCouponDiscount,
    setCouponEndDate,
    setCouponName,
    setCouponPrice,
    setCouponType,
    setCouponId,
  } = useCouponsStore((s) => ({
    filter: s.filter,
    setFilter: s.setFilter,
    setCouponType: s.setCouponType,
    setCouponName: s.setCouponName,
    setBgColor: s.setBgColor,
    setCouponDiscount: s.setCouponDiscount,
    setCouponPrice: s.setCouponPrice,
    setCouponEndDate: s.setCouponEndDate,
    setSelectedPage: s.setSelectedPage,
    setCouponImage: s.setCouponImage,
    setCouponId: s.setCouponId,
  }));

  const filteredCoupons = useMemo(() => {
    return coupons?.filter((coupon: ICoupon) => {
      if (filter === "active") return coupon.isActive;
      if (filter === "inactive") return !coupon.isActive;
      return true;
    });
  }, [coupons, filter]);

  const FilterButtons = memo(() => (
    <div className="flex mt-6 mb-4 ml-6 space-x-4">
      <button
        type="button"
        className={cn(
          `rounded-3xl px-4 py-2 ${
            filter === "active"
              ? "bg-[#E3CDFE] text-[#8C63FF]"
              : "bg-white text-gray-600"
          }`,
        )}
        onClick={() => setFilter("active")}
      >
        Live Couponz
      </button>
      <button
        type="button"
        className={cn(
          `rounded-3xl px-4 py-2 ${
            filter === "inactive"
              ? "bg-[#E3CDFE] text-[#8C63FF]"
              : "bg-white text-gray-600"
          }`,
        )}
        onClick={() => setFilter("inactive")}
      >
        Not Active
      </button>
    </div>
  ));

  const goToCouponAnalytics = useCallback((coupon: ICoupon) => {
    console.log(coupon);
    setCouponName(coupon.name);
    setCouponType(coupon.config.discountType);
    setCouponPrice(
      coupon.config.discountType === "PERCENTAGE"
        ? coupon?.config?.upto
        : coupon?.config?.value,
    );
    setCouponEndDate(coupon.conditions?.couponEndDate);
    setCouponDiscount(coupon.config.value);
    setCouponImage(coupon.image);
    setBgColor(coupon.bgColour);
    setCouponId(coupon._id);
    setSelectedPage("ANALYTICS_INFO");
  }, []);

  return (
    <>
      <h6 className="mt-8 ml-6 font-semibold">CouponZ</h6>
      <FilterButtons />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <center className="mx-4 mt-6 flex flex-col flex-wrap justify-center gap-6 pb-[5rem] md:flex-row md:flex-wrap lg:mx-6">
          {filteredCoupons?.length ? (
            filteredCoupons.map((coupon: ICoupon) => (
              <button
                type="button"
                key={coupon._id}
                onClick={() => goToCouponAnalytics(coupon)}
                className="relative w-full text-left md:w-[22rem] lg:max-w-[19.25rem] 2xl:max-w-[21rem]"
              >
                <article
                  className="flex h-16 overflow-hidden shadow-light rounded-t-2xl"
                  style={{ backgroundColor: coupon.bgColour || "#6A32DF30" }}
                >
                  <figure>
                    <img
                      src={coupon.image || CouponImages}
                      alt={coupon.name}
                      className="ml-2 mt-2 w-[5rem] rounded-xl"
                    />
                  </figure>
                  <section className="flex flex-col justify-center flex-1 ml-4">
                    <h3 className="text-lg font-semibold text-black">
                      {coupon.name}
                    </h3>
                    <p className="text-sm text-black">
                      {coupon.conditions?.couponEndDate
                        ? `Expires in ${Math.ceil(
                            (coupon.conditions.couponEndDate - Date.now()) /
                              (1000 * 60 * 60 * 24),
                          )} days`
                        : "No expiry"}
                    </p>
                  </section>
                </article>
                <article className="flex items-center justify-between p-4 bg-white shadow-dark rounded-b-2xl">
                  <small>
                    {coupon.config.discountType === "PERCENTAGE"
                      ? `${coupon.config.value}% Discount`
                      : `₹ ${coupon.config.value} Fixed Discount`}
                  </small>
                  <small>
                    {coupon.conditions?.expiryClaimLimit?.overAllLimit
                      ? "Limited expiry"
                      : "No expiry"}
                  </small>
                </article>
              </button>
            ))
          ) : (
            <p>No coupons available</p>
          )}
        </center>
      )}
    </>
  );
};

const CouponListAnalytics = memo(MemoCouponListAnalytics);
export default CouponListAnalytics;
