import useCouponsStore from "@/components/store/useCouponsStore";
import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";
import { memo } from "react";

const MemoStorySize = () => {
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
    couponType,
    minimumBillAmount,
    extendedEndTime,
  } = useCouponsStore();

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "No expiry";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="relative w-[236px] mx-auto h-[420px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to top, ${bgColor}30, transparent), url(${
            couponImage || birthdayPlaceholder
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute bottom-0 flex items-center justify-between w-full p-2 text-white bg-black">
        <div className="relative grid w-64 grid-cols-2 gap-2 text-center">
          <center className="flex flex-col items-center">
            <h3 className="text-xs text-gray-500">Min. Bill Amount</h3>
            <p className="text-base">
              ₹ {minimumBillAmount || couponPrice || 0}
            </p>
          </center>
          <center className="flex flex-col items-center">
            <h3 className="text-xs text-gray-500">Valid Till</h3>
            <p className="text-base">{formatDate(couponEndDate)}</p>
          </center>
          <center className="flex flex-col items-center">
            <h3 className="text-xs text-gray-500">Applicable On</h3>
            {customDays && customDays.length > 0 && (
              <p className="text-base">
                {customDays.map((day) => day.slice(0, 2)).join(", ")}
              </p>
            )}
            {customDays.length === 0 && (
              <p className="text-base">All the time</p>
            )}
          </center>
          {startTime && endTime ? (
            <center className="flex flex-col items-center">
              <h3 className="text-xs text-gray-500">Available On</h3>
              <p className="text-base">
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
              </p>
            </center>
          ) : null}
        </div>
      </div>

      <p className="absolute text-2xl font-bold text-white left-1/2 top-[59%] transform -translate-x-1/2">
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% off `
          : `₹ ${couponPrice || "0"} off `}
      </p>

      <div className="absolute text-lg font-bold text-white left-1/2 top-[49%] transform -translate-x-1/2 text-nowrap">
        {couponName || "Coupon"}
      </div>
    </div>
  );
};

const StorySize = memo(MemoStorySize);
export default StorySize;
