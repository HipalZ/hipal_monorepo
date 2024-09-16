import CouponImages from "@/assets/coupon/coupon card.png";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useCouponsStore from "@/components/store/useCouponsStore";
import { useGetAllCoupons } from "@/hooks/useCoupon";
import { memo } from "react";

const MemoListCoupons = () => {
  const { coupons, isLoading } = useGetAllCoupons();
  const {
    setAddMinimumBillAmount,
    setAllowLateNight,
    setSelectedPage,
    setBgColor,
    setCouponId,
    setCouponName,
    setCouponType,
    setCouponDiscount,
    setMinimumBillAmount,
    setExpiryAfterGrabbed,
    setCashbackAvailable,
    setTermsAndConditions,
    setCouponPrice,
    setCustomDays,
    setStartTime,
    setEndTime,
    setCouponEndDate,
    setCouponStartDate,
    setExpiryClaimLimitValue,
    setCouponForEveryOne,
    setPromoteOnBill,
    setPromote,
    setIsPublish,
    setOverAllLimit,
    setSelectedGroupIds,
    setSelectedUserIds,
    setIsActive,
    setCouponImage,
    setLinks,
  } = useCouponsStore();

  const storeCouponInfo = (coupon: any) => {
    setCouponId(coupon?._id);
    setLinks(coupon?.links);
    setCouponName(coupon?.name);
    setCouponImage(coupon?.image);
    setCouponType(coupon?.config?.discountType);
    setCouponDiscount(coupon?.config?.value);
    setBgColor(coupon?.bgColour);
    setCashbackAvailable(coupon?.cashbackAvailable);
    setMinimumBillAmount(coupon?.conditions?.billValue);
    setExpiryAfterGrabbed(coupon?.conditions?.expiryAfterGrabbed);
    setTermsAndConditions(coupon?.conditions?.tc);
    setOverAllLimit(coupon?.conditions?.individualUserLimit?.overAllLimit || 0);
    setAddMinimumBillAmount(!!coupon?.conditions?.billValue);
    setIsActive(coupon?.isActive);
    setCouponPrice(
      coupon.config.discountType === "PERCENTAGE"
        ? coupon?.config?.upto
        : coupon?.config?.value,
    );
    setCouponStartDate(coupon?.conditions?.couponStartDate);
    setCouponEndDate(coupon?.conditions?.couponEndDate);
    setExpiryClaimLimitValue(
      coupon?.conditions?.expiryClaimLimit?.overAllLimit || 0,
    );
    setCouponForEveryOne(coupon?.conditions?.eligibleUser?.allUsers);
    setCustomDays(coupon?.conditions?.availability?.customDays);
    setStartTime(coupon?.conditions?.availability?.startTime || 0);
    setEndTime(coupon?.conditions?.availability?.endTime || 0);
    setAllowLateNight(
      coupon?.conditions?.availability?.allowLateNight || false,
    );
    setIsPublish(coupon?.isPublish);
    setPromote(coupon?.promote);
    setPromoteOnBill(coupon?.promoteOnBill);
    setSelectedGroupIds(coupon?.conditions?.eligibleUser?.groupIds || []);
    setSelectedUserIds(coupon?.conditions?.eligibleUser?.userIds || []);
    setSelectedPage("INFO");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col flex-wrap gap-6 mx-4 lg:mx-6 mt-6 md:flex-wrap md:flex-row pb-[5rem]">
      {coupons?.length ? (
        coupons.map((coupon: any) => (
          <div
            key={coupon._id}
            className="relative w-full md:w-full lg:max-w-[19.25rem]"
            onClick={() => storeCouponInfo(coupon)}
          >
            <article
              className=" rounded-t-2xl bg-[#6A32DF30] flex h-16 overflow-hidden shadow-light"
              style={{ backgroundColor: coupon.bgColour || "#6A32DF30" }}
            >
              <figure>
                <img
                  src={coupon.image || CouponImages}
                  alt={coupon.name}
                  className="w-[5rem] mt-2 ml-2 rounded-xl"
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
            <article className="flex items-center justify-between p-4 bg-white rounded-b-2xl shadow-dark">
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
            <button
              type="button"
              className={`px-4 py-1 rounded-2xl absolute -top-3 right-4 text-xs ${
                coupon.isPublish
                  ? "bg-[#24C163] text-white"
                  : "bg-gray-400 text-black"
              }`}
            >
              {coupon.isPublish ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>
        ))
      ) : (
        <p>No coupons available</p>
      )}
    </div>
  );
};

const ListCoupons = memo(MemoListCoupons);
export default ListCoupons;
