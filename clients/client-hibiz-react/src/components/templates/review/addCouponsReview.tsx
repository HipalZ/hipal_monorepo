import { memo, useCallback, useEffect } from "react";
import BottomButton from "@/components/atom/bottomButton";
import DatePicker from "react-datepicker";
import { useReview } from "@/components/store/useReview";
import useCouponsStore from "@/components/store/useCouponsStore";
import { formatDate } from "@/components/utils/helper";
import toast from "react-hot-toast";

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.getTime();
};

const MemoAddCouponsReview = () => {
  const { amount, setAmount } = useReview();
  const {
    couponStartDate,
    couponEndDate,
    setCouponEndDate,
    setCouponStartDate,
  } = useCouponsStore();

  useEffect(() => {
    if (!couponStartDate) {
      setCouponStartDate(Date.now());
    }
  }, [couponStartDate, setCouponStartDate]);

  const goNext = useCallback(() => {
    if (!amount) {
      toast.error("Please enter the amount");
      return;
    }

    if (!couponEndDate) {
      toast.error("Please select the end date");
      return;
    }

    setAmount(amount);
    setCouponEndDate(couponEndDate);
    useReview.getState().setOpen(false);
  }, [amount, couponEndDate, setAmount, setCouponEndDate]);

  return (
    <>
      <section className="px-4 pt-4 pb-[5rem]">
        <h1 className="mb-4 text-2xl font-semibold text-center">Add Couponz</h1>

        <h3 className="font-semibold opacity-60">You are special coupon</h3>
        <h3 className="mt-6 font-semibold opacity-60">Fixed price</h3>
        <div className="mb-4">
          <input
            type="tel"
            value={amount}
            onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setAmount(value);
              }}
            placeholder="Please enter the amount"
            maxLength={6}
            className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:border-[#7A69FE50] border-gray-300"
          />
        </div>

        <h3 className="font-semibold opacity-60">When does it expire</h3>
        <div className="mb-4">
          <DatePicker
            selected={couponEndDate ? new Date(couponEndDate) : null}
            onChange={(date: Date) => setCouponEndDate(date.getTime())}
            minDate={new Date(couponStartDate || Date.now())}
            dateFormat={"dd/MM/yyyy"}
            className="w-full px-4 py-2 border rounded-2xl focus:outline-none focus:border-[#7A69FE50] border-gray-300"
            placeholderText="Select End Date"
          />
        </div>
        {couponEndDate && (
          <div className="mb-4">
            <center className="font-semibold text-[#8C63FF] bg-[#8C63FF30] text-sm py-1">
              Selected Date Range: {formatDate(new Date(couponStartDate))} -{" "}
              {formatDate(new Date(couponEndDate))}
            </center>
          </div>
        )}

        <div className="flex mb-4 space-x-2">
          {[7, 15, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              className="px-4 py-2 mt-2 text-white bg-[#7A69FE] rounded-2xl text-sm"
              onClick={() => setCouponEndDate(addDays(days))}
            >
              {days} Days
            </button>
          ))}
        </div>
      </section>

      <BottomButton
        buttons={[
          {
            text: "Apply",
            onClick: goNext,
          },
        ]}
      />
    </>
  );
};

const AddCouponsReview = memo(MemoAddCouponsReview);
export default AddCouponsReview;
