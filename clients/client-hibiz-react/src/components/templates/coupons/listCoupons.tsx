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
    setIsUptoPriceActive,
    setAfterClaim,
  } = useCouponsStore((s) => ({
    setAddMinimumBillAmount: s.setAddMinimumBillAmount,
    setAllowLateNight: s.setAllowLateNight,
    setSelectedPage: s.setSelectedPage,
    setBgColor: s.setBgColor,
    setCouponId: s.setCouponId,
    setCouponName: s.setCouponName,
    setCouponType: s.setCouponType,
    setCouponDiscount: s.setCouponDiscount,
    setMinimumBillAmount: s.setMinimumBillAmount,
    setExpiryAfterGrabbed: s.setExpiryAfterGrabbed,
    setCashbackAvailable: s.setCashbackAvailable,
    setTermsAndConditions: s.setTermsAndConditions,
    setCouponPrice: s.setCouponPrice,
    setCustomDays: s.setCustomDays,
    setStartTime: s.setStartTime,
    setEndTime: s.setEndTime,
    setCouponEndDate: s.setCouponEndDate,
    setCouponStartDate: s.setCouponStartDate,
    setExpiryClaimLimitValue: s.setExpiryClaimLimitValue,
    setCouponForEveryOne: s.setCouponForEveryOne,
    setPromoteOnBill: s.setPromoteOnBill,
    setPromote: s.setPromote,
    setIsPublish: s.setIsPublish,
    setOverAllLimit: s.setOverAllLimit,
    setSelectedGroupIds: s.setSelectedGroupIds,
    setSelectedUserIds: s.setSelectedUserIds,
    setIsActive: s.setIsActive,
    setCouponImage: s.setCouponImage,
    setLinks: s.setLinks,
    setIsUptoPriceActive: s.setIsUptoPriceActive,
    setAfterClaim: s.setAfterClaim,
  }));

  const storeCouponInfo = (coupon: any) => {
    setCouponId(coupon?._id);
    setLinks(coupon?.links);
    setCouponName(coupon?.name);
    setCouponImage(coupon?.image);
    setCouponType(coupon?.config?.discountType);
    setCouponDiscount(coupon?.config?.value);
    setIsUptoPriceActive(
      coupon?.config?.discountType === "PERCENTAGE"
        ? !!coupon?.config?.upto
        : !!coupon?.config?.value,
    );
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
    setCouponStartDate(
      coupon?.conditions?.couponStartDate
        ? coupon?.conditions?.couponStartDate
        : null,
    );
    setCouponEndDate(
      coupon?.conditions?.couponEndDate
        ? coupon?.conditions?.couponEndDate
        : null,
    );
    setExpiryClaimLimitValue(
      coupon?.conditions?.expiryClaimLimit?.overAllLimit || 0,
    );
    setAfterClaim(!!coupon?.conditions?.individualUserLimit?.overAllLimit);
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
    <center className="mx-4 mt-6 flex flex-col flex-wrap justify-center gap-6 pb-[5rem] md:flex-row md:flex-wrap lg:mx-6">
      {coupons?.length ? (
        coupons.map((coupon: any) => (
          <div
            key={coupon?._id}
            className="relative w-full cursor-pointer text-left md:w-[22rem] lg:max-w-[19.25rem] 2xl:max-w-[21rem]"
            onClick={() => storeCouponInfo(coupon)}
          >
            <article
              className="shadow-light flex h-16 overflow-hidden rounded-t-2xl bg-[#6A32DF30]"
              style={{ backgroundColor: coupon?.bgColour || "#6A32DF30" }}
            >
              <figure>
                <img
                  src={coupon?.image || CouponImages}
                  alt={coupon?.name}
                  className="ml-2 mt-2 w-[5rem] rounded-xl"
                />
              </figure>
              <section className="flex flex-col justify-center flex-1 ml-4">
                <h3 className="text-lg font-semibold text-black">
                  {coupon?.name}
                </h3>
                <p className="text-sm text-black">
                  {coupon?.conditions?.couponEndDate
                    ? `Expires in ${Math.ceil(
                        (coupon?.conditions.couponEndDate - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      )} days`
                    : "No expiry"}
                </p>
              </section>
            </article>
            <article className="flex items-center justify-between p-4 bg-white shadow-dark rounded-b-2xl">
              <small>
                {coupon?.config?.discountType === "PERCENTAGE"
                  ? `${coupon?.config?.value}% Discount`
                  : `₹ ${coupon?.config?.value} Fixed Discount`}
              </small>
              <small>
                {coupon?.conditions?.expiryClaimLimit?.overAllLimit
                  ? "Limited expiry"
                  : "No expiry"}
              </small>
            </article>
            <button
              type="button"
              className={`absolute -top-3 right-4 rounded-2xl px-4 py-1 text-xs ${
                coupon?.isPublish
                  ? "bg-[#24C163] text-white"
                  : "bg-gray-400 text-black"
              }`}
            >
              {coupon?.isPublish ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>
        ))
      ) : (
        <p>No coupons available</p>
      )}
    </center>
  );
};

const ListCoupons = memo(MemoListCoupons);
export default ListCoupons;
