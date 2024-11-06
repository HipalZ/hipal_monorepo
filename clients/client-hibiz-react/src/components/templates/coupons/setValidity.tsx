import { memo, useCallback } from "react";
import Background from "@/components/atom/feildBackground";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import useCouponsStore from "@/components/store/useCouponsStore";
import { formatDate } from "@/components/utils/helper";
import { cn } from "@hi/common";

const MemoSetValidity = () => {
  const {
    couponStartDate,
    setCouponStartDate,
    couponEndDate,
    setCouponEndDate,
    isNoValidity,
    setIsNoValidity,
    couponType,
  } = useCouponsStore((s) => ({
    couponStartDate: s.couponStartDate,
    setCouponStartDate: s.setCouponStartDate,
    couponEndDate: s.couponEndDate,
    setCouponEndDate: s.setCouponEndDate,
    isNoValidity: s.isNoValidity,
    setIsNoValidity: s.setIsNoValidity,
    couponType: s.couponType,
  }));

  const handleNoValidity = useCallback(() => {
    setIsNoValidity(true);
    setCouponStartDate(null);
    setCouponEndDate(null);
  }, [setCouponStartDate, setCouponEndDate]);

  const handleFixedDate = useCallback(() => {
    setIsNoValidity(false);
  }, []);

  const handleStartDateChange = useCallback(
    (date: Date | null) => {
      if (date && couponEndDate && date.getTime() > couponEndDate) {
        toast.error("Start date cannot be after end date");
        return;
      }
      console.log(date);
      setCouponStartDate(date ? date.getTime() : null);
    },
    [couponEndDate, setCouponStartDate],
  );

  const handleEndDateChange = useCallback(
    (date: Date | null) => {
      if (couponStartDate && date && date.getTime() < couponStartDate) {
        toast.error("End date cannot be before start date");
        return;
      }
      setCouponEndDate(date ? date.getTime() : null);
    },
    [couponStartDate, setCouponEndDate],
  );

  const getExpiryMessage = useCallback(() => {
    const now = Date.now();

    if (couponStartDate === null && couponEndDate === null) {
      return "No Validity";
    }

    if (couponStartDate === null && couponEndDate !== null) {
      const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysLeft} days`;
    }
    if (couponStartDate !== null && couponEndDate !== null) {
      const daysLeft = Math.ceil(
        (couponEndDate - couponStartDate) / (1000 * 60 * 60 * 24),
      );
      return `Expires ${daysLeft > 0 ? `in ${daysLeft} days` : "today"}`;
    }
    return "Expires: None";
  }, [couponEndDate, couponStartDate]);

  return (
    <section
      className={cn(
        "mx-6 mt-6  max-w-[30rem] 2xl:max-w-[32rem] pb-[5rem]",
        couponType === "PERCENTAGE" ? "lg:-mt-[18rem]" : "lg:-mt-[13rem]",
      )}
    >
      <h3 className="font-semibold opacity-60">Set validity of coupon</h3>
      <Background>
        <article className="flex pb-4 space-x-4">
          <button
            type="button"
            onClick={handleNoValidity}
            className={cn(
              "px-4 py-2 border rounded-xl",
              isNoValidity ? "bg-[#8C63FF] text-white" : "bg-gray-200",
            )}
          >
            No Validity
          </button>
          <button
            type="button"
            onClick={handleFixedDate}
            className={cn(
              "px-4 py-2 border rounded-xl",
              !isNoValidity ? "bg-[#8C63FF] text-white" : "bg-gray-200",
            )}
          >
            Fixed Date
          </button>
        </article>
        <hr />

        {!isNoValidity && (
          <div className="flex gap-4 mt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <DatePicker
                selected={couponStartDate ? new Date(couponStartDate) : null}
                onChange={handleStartDateChange}
                selectsStart
                startDate={couponStartDate ? new Date(couponStartDate) : null}
                endDate={couponEndDate ? new Date(couponEndDate) : null}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                placeholderText="Select start date"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <DatePicker
                selected={couponEndDate ? new Date(couponEndDate) : null}
                onChange={handleEndDateChange}
                selectsEnd
                dateFormat="dd/MM/yyyy"
                startDate={couponStartDate ? new Date(couponStartDate) : null}
                endDate={couponEndDate ? new Date(couponEndDate) : null}
                minDate={
                  couponStartDate ? new Date(couponStartDate) : new Date()
                }
                placeholderText="Select end date"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        )}
        <center className="mt-4 w-full rounded-b-xl truncate md:text-lg font-bold text-[#8C63FF] bg-[#8C63FF30] py-2">
          <h3>{getExpiryMessage() || "No expiration details available"}</h3>
          {couponEndDate && couponStartDate && (
            <h3>
              {" "}
              Validity: {formatDate(new Date(couponStartDate))} -{" "}
              {formatDate(new Date(couponEndDate))}
            </h3>
          )}
        </center>
      </Background>
    </section>
  );
};

const SetValidity = memo(MemoSetValidity);
export default SetValidity;
