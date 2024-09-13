import useCouponsStore from "@/components/store/useCouponsStore";
import { memo } from "react";
import Confetti from "@/assets/Confetti.png";

const MemoCoupon = () => {
  const {
    couponName,
    couponType,
    couponPrice,
    couponDiscount,
    minimumBillAmount,
    customDays,
    expiryCoupon,
    couponStartDate,
    couponEndDate,
    overAllLimit,
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    couponType: s.couponType,
    couponPrice: s.couponPrice,
    couponDiscount: s.couponDiscount,
    minimumBillAmount: s.minimumBillAmount,
    customDays: s.customDays,
    expiryCoupon: s.expiryCoupon,
    couponStartDate: s.couponStartDate,
    couponEndDate: s.couponEndDate,
    overAllLimit: s.overAllLimit,
  }));

  const currentDate = couponStartDate || new Date().getTime();
  const remainingDays =
    couponEndDate && couponEndDate > currentDate
      ? Math.ceil((couponEndDate - currentDate) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <article className="w-[90%] flex-1 max-w-[25rem] lg:bg-white lg:h-[12rem] p-4 rounded-xl ml-6 flex justify-center items-center -rotate-6 mt-12">
      <div className="bg-[#6A31DF] w-[35%] h-[10rem] relative border-dashed overflow-hidden border-r-2 border-white space-y-[0.325rem]">
        <figure>
          <img
            src={Confetti}
            alt="Confetti"
            className="w-[95%] h-[55%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </figure>
        {Array(15)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 -ml-[5px] bg-white rounded-full"
            />
          ))}
        <div className="absolute w-3 h-3 rotate-45 bg-white -right-2 -top-3" />
        <div className="absolute w-3 h-3 rotate-45 bg-white -right-2 -bottom-2" />
      </div>
      <div className="bg-[#FBD42C] w-[70%] h-[10rem] relative overflow-hidden">
        <div className="absolute w-3 h-3 rotate-45 bg-white -left-2 -top-2" />
        <div className="absolute w-3 h-3 rotate-45 bg-white -left-2 -bottom-2" />

        <h3 className="absolute text-xl font-semibold text-black truncate top-4 left-4">
          {couponName || "Coupon Name"}
        </h3>

        <h3 className="absolute text-black top-11 left-4">
          {couponType === "DISCOUNT" && couponDiscount
            ? `${couponDiscount}% off on ${
                couponPrice > 0 ? "₹" + couponPrice : "every bill"
              }`
            : `₹${couponPrice || "0"} off on ${
                minimumBillAmount > 0 ? `₹${minimumBillAmount}` : "up to bill"
              }`}
        </h3>

        {customDays && customDays.length > 0 && (
          <h3 className="absolute top-[4.25rem] left-4 text-sm">
            Valid on: {customDays.map((day) => day.slice(0, 2)).join(", ")}
          </h3>
        )}

        {customDays.length === 0 && (
          <h3 className="absolute top-[4.25rem] left-4 text-sm">
            All the time
          </h3>
        )}

        <h3 className="absolute top-[5.5rem] left-4 text-sm">
          {expiryCoupon === "No Expiration"
            ? "No Expiration"
            : expiryCoupon ===
                "After X Days (e.g., Expires 30 days after activation)"
              ? `Expires in ${remainingDays} days`
              : expiryCoupon ===
                  "After Specific Use (e.g., Expires after it’s used 10 times)"
                ? `Expires after ${overAllLimit || 0} uses`
                : expiryCoupon ===
                    "End of Month (e.g., Expires at the end of the current week or month)"
                  ? `Expires in ${remainingDays} days`
                  : expiryCoupon ===
                      "Custom Expiration (e.g., Start and end date)"
                    ? couponEndDate
                      ? `Expires in ${remainingDays} days`
                      : "Select expiry date"
                    : "Select Expiration"}
          {overAllLimit > 0 &&
            expiryCoupon !==
              "After Specific Use (e.g., Expires after it’s used 10 times)" &&
            ` & after ${overAllLimit} uses`}
        </h3>

        {Array(15)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="absolute w-2 h-2 bg-white rounded-full -right-1.5"
              style={{ top: `${index * 0.75}rem` }}
            />
          ))}
      </div>
    </article>
  );
};

const Coupon = memo(MemoCoupon);
export default Coupon;
