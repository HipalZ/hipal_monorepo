import useCouponsStore from "@/components/store/useCouponsStore";
import { memo, useCallback } from "react";
import FixedPrice from "./fixedPrice";
import Background from "@/components/atom/feildBackground";
import { cn } from "@hi/common";

const discountArray = [
  {
    id: 1,
    name: "10% OFF",
    text: "10%",
  },
  {
    id: 2,
    name: "15% OFF",
    text: "15%",
  },
  {
    id: 3,
    name: "25% OFF",
    text: "25%",
  },
  {
    id: 4,
    name: "50% OFF",
    text: "50%",
  },
];

const MemoFixedDiscount = () => {
  const { couponDiscount, setCouponDiscount } = useCouponsStore((s) => ({
    couponDiscount: s.couponDiscount,
    setCouponDiscount: s.setCouponDiscount,
  }));

  const handleDiscountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = Number(e.target.value);
      if (Number.isNaN(value)) {
        return;
      }
      if (value > 100) {
        value = 100;
      }
      setCouponDiscount(value);
    },
    [],
  );

  const handlePredefinedDiscount = useCallback((discount: number) => {
    setCouponDiscount(discount);
  }, []);

  return (
    <article className="mt-2">
      <label className="font-semibold opacity-50 " htmlFor="discount">
        Select Discount
      </label>
      <input
        type="tel"
        id="discount"
        placeholder="Please enter discount"
        value={couponDiscount === 0 ? "" : couponDiscount}
        maxLength={3}
        onChange={handleDiscountChange}
        className="w-full p-2 mt-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
      />

      <div className="flex justify-between w-full gap-2 mt-4">
        {discountArray.map((discount) => (
          <button
            key={discount.id}
            type="button"
            className={cn(
              "p-2 rounded-xl text-sm w-full",
              couponDiscount === Number(discount.text.replace("%", ""))
                ? "bg-[#8C63FF] text-white"
                : "bg-[#F1E9FB] text-[#8C63FF]",
            )}
            onClick={() =>
              handlePredefinedDiscount(Number(discount.text.replace("%", "")))
            }
          >
            {discount.name}
          </button>
        ))}
      </div>
      <FixedPrice />
    </article>
  );
};

const FixedDiscount = memo(MemoFixedDiscount);

export default FixedDiscount;
