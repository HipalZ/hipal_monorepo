import useCouponsStore from "@/components/store/useCouponsStore";
import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";
import { memo } from "react";

const MemoBeforeGrabbingCoupon = () => {
  const {
    couponName,
    couponDiscount,
    bgColor,
    couponImage,
    couponType,
    couponPrice,
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    couponDiscount: s.couponDiscount,
    couponImage: s.couponImage,
    couponType: s.couponType,
    couponPrice: s.couponPrice,
    bgColor: s.bgColor,
  }));

  return (
    <section className="p-6">
      <div className="w-[270px] mx-auto h-[270px] relative rounded-xl overflow-hidden shadow-lg">
        <div className="w-full h-[65%]">
          <img
            src={couponImage || birthdayPlaceholder}
            alt="Coupon"
            className="object-cover w-full h-full"
          />
        </div>

        <hr
          className="w-full absolute bottom-[5.6rem]"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='15' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
              `${bgColor}`,
            )}' stroke-width='4' stroke-dasharray='2%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "4px",
            border: "none",
          }}
        />

        <div
          style={{
            backgroundColor: bgColor,
          }}
          className="absolute rounded-full -left-[0.65rem] bottom-[5.25rem] w-5 h-5"
        />
        <div
          style={{
            backgroundColor: bgColor,
          }}
          className="absolute -right-[0.65rem] bottom-[5.25rem] w-5 h-5 rounded-full"
        />

        <div className="flex flex-col items-center justify-center w-full p-4 bg-white h-[35%]">
          <h3 className="text-xl font-semibold text-center text-black">
            {couponName || "Coupon"}
          </h3>
          <p className="text-3xl font-bold text-black">
            {couponType === "PERCENTAGE" && couponDiscount
              ? `${couponDiscount}% off`
              : `₹${couponPrice || "0"} off`}
          </p>
        </div>
      </div>
    </section>
  );
};

const BeforeGrabbingCoupon = memo(MemoBeforeGrabbingCoupon);

export default BeforeGrabbingCoupon;
