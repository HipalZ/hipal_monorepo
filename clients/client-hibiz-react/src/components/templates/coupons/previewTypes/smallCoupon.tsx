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
  } = useCouponsStore();

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "No expiry";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <section className="p-6">
      <article className="on_active_bounce bg-white overflow-hidden relative flex flex-col justify-center items-center m-4 text-primary h-[10.5rem] w-[16rem] px-6 py-3 shrink-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={`left-${i.toString()}`}
            className=" absolute w-[1.5rem] h-[1.5rem] rounded-full "
            style={{
              left: "-12px",
              top: `${(i + 0.2) * 20}%`,
              backgroundColor: bgColor,
            }}
          />
        ))}

        {[...Array(5)].map((_, i) => (
          <div
            key={`right-${i.toString()}`}
            className=" absolute w-[1.5rem] h-[1.5rem] rounded-full "
            style={{
              right: "-12px",
              top: `${(i + 0.2) * 20}%`,
              backgroundColor: bgColor,
            }}
          />
        ))}

        <article className="flex w-full">
          <img
            src={birthdayPlaceholder}
            alt="birthdayPlaceholder"
            width={31}
            height={31}
            className="object-cover w-10 h-10 mr-4 bg-center rounded-full"
          />
          <h4 className="text-sm font-bold leading-4 text-primary">
            {couponName || "Coupon Name"}
          </h4>
        </article>

        <hr
          className="w-full col-span-2 my-3"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
              "#000",
            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "2px",
          }}
        />

        <section className="grid w-full grid-cols-2 text-xs">
          <article className="justify-self-start">
            <h1>Expires on</h1>
            <p>{formatDate(couponEndDate)}</p>
            <p className="text-[0.6rem] mt-4">Terms & conditions</p>
          </article>
          <article className="text-right justify-self-end">
            <h1 className="text-base font-semibold">
              {" "}
              {couponType === "PERCENTAGE" && couponDiscount
                ? `${couponDiscount}% off`
                : `₹${couponPrice || "0"} off`}
            </h1>
            <button
              type="button"
              className="px-2 py-1 mt-5 text-xs rounded-full on_active_bounce text-base-200 bg-primary"
            >
              Redeem Now
            </button>
          </article>
        </section>
      </article>
    </section>
  );
};

const SmallCoupon = memo(MemoSmallCoupon);

export default SmallCoupon;
