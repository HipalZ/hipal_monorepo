import CouponImages from "@/assets/coupon/coupon card.png";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useCouponsStore from "@/components/store/useCouponsStore";
import { useGetAllCoupons } from "@/hooks/useCoupon";
import { memo } from "react";

const MemoListCoupons = () => {
  const { coupons, isLoading } = useGetAllCoupons();

  const storeCouponInfo = (coupon: any) => {
    useCouponsStore.setState({
      couponId: coupon?._id,
      links: coupon?.links,
      couponName: coupon?.name,
      couponImage: coupon?.image,
      couponType: coupon?.config?.discountType,
      couponDiscount: coupon?.config?.value,
      isUptoPriceActive:
        coupon?.config?.discountType === "PERCENTAGE"
          ? !!coupon?.config?.upto
          : !!coupon?.config?.value,
      bgColor: coupon?.bgColour,
      cashbackAvailable: coupon?.cashbackAvailable,
      minimumBillAmount: coupon?.conditions?.billValue,
      expiryAfterGrabbed: coupon?.conditions?.expiryAfterGrabbed,
      termsAndConditions: coupon?.conditions?.tc,
      overAllLimit: coupon?.conditions?.individualUserLimit?.overAllLimit || 0,
      addMinimumBillAmount: !!coupon?.conditions?.billValue,
      isActive: coupon?.isActive,
      couponPrice:
        coupon.config.discountType === "PERCENTAGE"
          ? coupon?.config?.upto
          : coupon?.config?.value,
      couponStartDate: coupon?.conditions?.couponStartDate || null,
      couponEndDate: coupon?.conditions?.couponEndDate || null,
      expiryClaimLimitValue:
        coupon?.conditions?.expiryClaimLimit?.overAllLimit || 0,
      afterClaim: !!coupon?.conditions?.individualUserLimit?.overAllLimit,
      couponForEveryOne: coupon?.conditions?.eligibleUser?.allUsers,
      customDays: coupon?.conditions?.availability?.customDays,
      startTime: coupon?.conditions?.availability?.startTime || 0,
      endTime: coupon?.conditions?.availability?.endTime || 0,
      allowLateNight: coupon?.conditions?.availability?.allowLateNight || false,
      isPublish: coupon?.isPublish,
      promote: coupon?.promote,
      promoteOnBill: coupon?.promoteOnBill,
      selectedGroupIds: coupon?.conditions?.eligibleUser?.groupIds || [],
      selectedUserIds: coupon?.conditions?.eligibleUser?.userIds || [],
      selectedPage: "INFO",
    });
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
