import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { cn } from "@hi/common";
import FixedPrice from "./fixedPrice";
import FixedDiscount from "./fixedDiscount";
import BottomButton from "@/components/atom/bottomButton";
import toast from "react-hot-toast";
import { memo, useCallback } from "react";
import SetValidity from "./setValidity";

const MemoCouponDetails = () => {
  const {
    couponName,
    setCouponName,
    couponType,
    setCouponType,
    couponDiscount,
    couponPrice,
    setSelectedPage,
    isUptoPriceActive,
    isNoValidity,
    couponStartDate,
    couponEndDate,
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    setCouponName: s.setCouponName,
    couponType: s.couponType,
    setCouponType: s.setCouponType,
    couponDiscount: s.couponDiscount,
    couponPrice: s.couponPrice,
    setSelectedPage: s.setSelectedPage,
    isUptoPriceActive: s.isUptoPriceActive,
    isNoValidity: s.isNoValidity,
    couponStartDate: s.couponStartDate,
    couponEndDate: s.couponEndDate,
  }));

  const handleNextClick = useCallback(() => {
    const showToast = (message: string) => toast.error(message);

    if (!couponName?.trim()) {
      return showToast("Coupon name is required!");
    }

    if (couponType === "PERCENTAGE" && !couponDiscount) {
      return showToast("Coupon discount is required for percentage type!");
    }

    if ((couponType === "AMOUNT" || isUptoPriceActive) && !couponPrice) {
      return showToast(
        isUptoPriceActive
          ? "Please enter upto price!"
          : "Coupon price is required!",
      );
    }

    if (!isNoValidity) {
      if (!couponStartDate || !couponEndDate) {
        return showToast("Please select the validity of the coupon!");
      }
    }

    setSelectedPage("EXPIRED");
  }, [
    couponName,
    couponType,
    couponDiscount,
    couponPrice,
    isUptoPriceActive,
    isNoValidity,
    couponStartDate,
    couponEndDate,
    setSelectedPage,
  ]);

  return (
    <>
      <section className="flex flex-col mx-6 gap-x-6 gap-y-2 lg:flex-row lg:mt-6">
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="name">
            Coupon Name*
          </label>
          <Background>
            <input
              type="text"
              id="name"
              placeholder="Enter Coupon Name"
              value={couponName}
              maxLength={21}
              onChange={(e) => setCouponName(e.target.value)}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
          </Background>
        </article>
        <section className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="name">
            Set discount*
          </label>
          <article className="flex flex-col gap-4 p-4 mt-2 bg-white md:flex-row lg:flex-col rounded-xl">
            <section className="flex-1">
              <label className="font-semibold opacity-50" htmlFor="name">
                Select one type*
              </label>
              <article className="flex w-full mt-4">
                <button
                  type="button"
                  className={cn(
                    "p-6 rounded-2xl flex-1 mx-2 text-left",
                    couponType === "PERCENTAGE"
                      ? "bg-[#F1E9FB] text-[#8C63FF]"
                      : "bg-[#f4f4f490]",
                  )}
                  onClick={() => setCouponType("PERCENTAGE")}
                >
                  <h3 className="text-xl font-semibold">%</h3>
                  Fixed Discount
                </button>
                <button
                  type="button"
                  className={cn(
                    "p-6 rounded-2xl flex-1 mx-2 text-left",
                    couponType === "AMOUNT"
                      ? "bg-[#F1E9FB] text-[#8C63FF]"
                      : "bg-[#f4f4f490]",
                  )}
                  onClick={() => setCouponType("AMOUNT")}
                >
                  <h3 className="text-xl font-semibold">₹</h3>
                  Fixed Price
                </button>
              </article>
            </section>
            <section className="flex-1">
              {couponType === "PERCENTAGE" && <FixedDiscount />}
              {couponType === "AMOUNT" && <FixedPrice />}
            </section>
          </article>
        </section>
      </section>
      <SetValidity />
      <BottomButton
        buttons={[
          {
            text: "Discard",
            onClick: () => setSelectedPage("CREATE"),
          },
          {
            text: "Next",
            onClick: handleNextClick,
          },
        ]}
        fixed
      />
    </>
  );
};

const CouponDetails = memo(MemoCouponDetails);

export default CouponDetails;
