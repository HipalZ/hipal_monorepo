import useCouponsStore from "@/components/store/useCouponsStore";
import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";

import { memo } from "react";

const MemoAfterGrabbingCoupon = () => {
  const {
    couponEndDate,
    startTime,
    endTime,
    customDays,
    couponPrice,
    couponDiscount,
    bgColor,
    couponImage,
    couponType,
    minimumBillAmount,
    extendedEndTime,
  } = useCouponsStore();
  console.log("couponEndDate", couponEndDate);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "No expiry";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <center className="relative">
      <img
        src={couponImage || birthdayPlaceholder}
        alt="Coupon"
        width={256}
        style={{
          height: "200px",
          objectFit: "cover",
        }}
        className="rounded-t-xl"
      />
      <div className="relative grid w-64 grid-cols-2 gap-6 p-4 -mt-px overflow-hidden text-black bg-white rounded-b-xl">
        <div className="flex flex-col items-start space-y-1">
          <h3 className="text-xs text-gray-500">Min. Bill Amount</h3>
          <p className="text-xl font-semibold">
            ₹ {minimumBillAmount || couponPrice}
          </p>
        </div>
        <div className="flex flex-col items-start space-y-1">
          <h3 className="text-xs text-gray-500">Valid Till</h3>
          <p className="text-lg font-semibold">{formatDate(couponEndDate)}</p>
        </div>
        <div className="flex flex-col items-start space-y-1">
          <h3 className="text-xs text-gray-500">Applicable On</h3>
          {customDays && customDays.length > 0 && (
            <p className="text-lg font-semibold">
              {customDays.map((day) => day.slice(0, 2)).join(", ")}
            </p>
          )}
          {customDays.length === 0 && (
            <p className="text-lg font-semibold">All the time</p>
          )}
        </div>
        {startTime && endTime ? (
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs text-gray-500">Available On</h3>
            <p className="text-lg font-semibold">
              {startTime?.toString()?.split(".").join(":")}{" "}
              {startTime?.toString().length === 1 ? ":00" : ""} -
              {extendedEndTime > 0 ? (
                <span className="text-lg font-semibold ">
                  {extendedEndTime?.toString()?.split(".").join(":")}
                  {extendedEndTime?.toString().length === 1 ? ":00" : ""}
                </span>
              ) : (
                <span>
                  {" "}
                  {endTime?.toString()?.split(".").join(":")}
                  {endTime?.toString().length === 1 ? ":00" : ""}
                </span>
              )}
            </p>
          </div>
        ) : null}

        <hr
          className="w-full col-span-2"
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
            backgroundColor: bgColor || "#9267EC",
          }}
          className="absolute rounded-full -left-[0.65rem] bottom-[4.25rem] w-5 h-5"
        />
        <div
          style={{
            backgroundColor: bgColor || "#9267EC",
          }}
          className="absolute -right-[0.65rem] bottom-[4.25rem] w-5 h-5 rounded-full"
        />

        <p className="col-span-2 text-3xl font-black text-center text-black space-grotesk-700">
          {couponType === "PERCENTAGE" && couponDiscount
            ? `${couponDiscount}% off`
            : `₹${couponPrice || "0"} off`}
        </p>
      </div>
    </center>
  );
};

const AfterGrabbingCoupon = memo(MemoAfterGrabbingCoupon);

export default AfterGrabbingCoupon;
