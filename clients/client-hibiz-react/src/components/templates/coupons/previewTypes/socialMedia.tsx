import useCouponsStore from "@/components/store/useCouponsStore";
import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";
import { memo } from "react";

const MemoSocialMedia = () => {
  const {
    couponEndDate,
    couponPrice,
    customDays,
    startTime,
    endTime,
    couponName,
    bgColor,
    couponImage,
    couponDiscount,
    minimumBillAmount,
    couponType,
    extendedEndTime,
  } = useCouponsStore();

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "No expiry";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="relative w-[84%] mx-auto max-w-[24rem] h-[270px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to top, ${bgColor}60 , transparent), url(${
            couponImage || birthdayPlaceholder
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute bottom-0 flex items-center justify-between w-full gap-2 p-2 text-white bg-black">
        <div className="w-full text-[0.675rem] text-nowrap">
          <h6>Min. Bill </h6>
          <h6>₹{minimumBillAmount || couponPrice}</h6>
        </div>
        <div className="w-full text-[0.675rem] text-nowrap">
          <h6 className="">Valid Till: </h6>
          <h6>{formatDate(couponEndDate)}</h6>
        </div>
        <div className="text-[0.675rem] text-nowrap">
          <h6> Applicable On </h6>
          <h6 className="truncate w-[90%]">
            {" "}
            {customDays && customDays.length > 0
              ? customDays.map((day) => day.slice(0, 2)).join(", ")
              : "All the time"}
          </h6>
        </div>
        {startTime && endTime ? (
          <div className="text-[0.675rem] text-nowrap">
            <h6>Avail On: </h6>
            <h6>
              {startTime?.toString()?.split(".").join(":")}
              {startTime?.toString().length === 1 ? ":00" : ""} -
              {extendedEndTime > 0 ? (
                <span className="font-semibold ">
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
            </h6>
          </div>
        ) : null}
      </div>

      <p className="absolute text-lg font-bold text-white bottom-[3.75rem] left-2">
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% off`
          : `₹ ${couponPrice || "0"} off`}
      </p>

      <div className="absolute text-lg font-bold text-white bottom-[5.25rem] left-2">
        {couponName || "Coupon"}
      </div>
    </div>
  );
};

const SocialMedia = memo(MemoSocialMedia);
export default SocialMedia;
