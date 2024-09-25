import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";
import useCouponsStore from "@/components/store/useCouponsStore";
import { memo } from "react";

const MemoSmallCoupon = () => {
  const {
    couponEndDate,
    couponPrice,
    couponDiscount,
    bgColor,
    couponType,
    couponName,
    couponImage,
  } = useCouponsStore();

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "No expiry";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <section className="flex items-center justify-center p-4">
      <article className="on_active_bounce bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-row justify-between items-center m-4 text-primary h-[11.5rem] w-[20rem] px-2 shrink-0">
        <article className="flex flex-col items-start w-[60%] pl-2 -mt-6 pb-[1rem]">
          <h4 className="mb-2 text-lg font-bold text-primary">
            {couponName || "Coupon Name"}
          </h4>
          <p className="text-sm text-primary">
            Expires : {formatDate(couponEndDate)}
          </p>
          <p className="text-[0.6rem] mt-1">Terms & conditions</p>
          <h1 className="mt-2 text-xl font-extrabold text-primary">
            {couponType === "PERCENTAGE" && couponDiscount
              ? `${couponDiscount}% OFF`
              : `₹${couponPrice || "0"} OFF`}
          </h1>
        </article>

        <article className="w-[50%] flex justify-end items-center -mt-7">
          <img
            src={couponImage || birthdayPlaceholder}
            alt="coupon"
            className="object-cover w-[8rem] h-[8rem] rounded-xl aspect-square mr-1"
          />
        </article>
        <button
          type="button"
          className="absolute bottom-0 w-full py-1 -ml-2 text-white bg-[#8c63ff]"
        >
          Redeem Now
        </button>
      </article>
    </section>
  );
};

const SmallCoupon = memo(MemoSmallCoupon);

export default SmallCoupon;
