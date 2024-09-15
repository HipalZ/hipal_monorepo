import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { cn } from "@hi/common";
import FixedPrice from "./fixedPrice";
import FixedDiscount from "./fixedDiscount";
import BottomButton from "@/components/atom/bottomButton";
import toast from "react-hot-toast";

const CouponDetails = () => {
  const {
    couponName,
    setCouponName,
    couponType,
    setCouponType,
    couponDiscount,
    couponPrice,
    addMinimumBillAmount,
    minimumBillAmount,
    setSelectedPage,
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    setCouponName: s.setCouponName,
    couponType: s.couponType,
    setCouponType: s.setCouponType,
    couponDiscount: s.couponDiscount,
    couponPrice: s.couponPrice,
    addMinimumBillAmount: s.addMinimumBillAmount,
    minimumBillAmount: s.minimumBillAmount,
    setSelectedPage: s.setSelectedPage,
  }));

  const handleNextClick = () => {
    if (!couponName || couponName.trim() === "") {
      toast.error("Coupon name is required!");
      return;
    }
    if (couponType === "PERCENTAGE" && !couponDiscount) {
      toast.error("Coupon discount is required for discount type!");
      return;
    }
    if (couponType === "PRICE" && !couponPrice) {
      toast.error("Coupon price is required for price type!");
      return;
    }
    if (addMinimumBillAmount && !minimumBillAmount) {
      toast.error("Minimum bill amount is required!");
      return;
    }
    setSelectedPage("AVAILABLE");
  };

  return (
    <>
      <section className="flex flex-col gap-6 mx-6 lg:flex-row lg:mt-6">
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
            Coupon type*
          </label>
          <article className="p-4 mt-2 bg-white rounded-xl">
            <label className="text-xs font-semibold opacity-50" htmlFor="name">
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
          </article>
        </section>
      </section>

      {couponType === "AMOUNT" && <FixedPrice />}
      {couponType === "PERCENTAGE" && <FixedDiscount />}

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

export default CouponDetails;
