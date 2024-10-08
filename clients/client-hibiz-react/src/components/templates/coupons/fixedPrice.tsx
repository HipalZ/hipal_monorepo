import useCouponsStore from "@/components/store/useCouponsStore";
import { Switch } from "@headlessui/react";
import { memo, useCallback, useState } from "react";
import toast from "react-hot-toast";

const MemoFixedPrice = () => {
  const {
    couponPrice,
    setCouponPrice,
    addMinimumBillAmount,
    setAddMinimumBillAmount,
    couponType,
    minimumBillAmount,
    setMinimumBillAmount,
    isUptoPriceActive,
    setIsUptoPriceActive,
  } = useCouponsStore((s) => ({
    couponPrice: s.couponPrice,
    setCouponPrice: s.setCouponPrice,
    addMinimumBillAmount: s.addMinimumBillAmount,
    setAddMinimumBillAmount: s.setAddMinimumBillAmount,
    couponType: s.couponType,
    minimumBillAmount: s.minimumBillAmount,
    setMinimumBillAmount: s.setMinimumBillAmount,
    isUptoPriceActive: s.isUptoPriceActive,
    setIsUptoPriceActive: s.setIsUptoPriceActive,
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numericValue = Number(value);

      if (value === "") {
        setCouponPrice("");
        setErrorMessage("");
      } else if (!Number.isNaN(numericValue)) {
        if (numericValue > 300000) {
          setErrorMessage("Max you can claim is ₹300,000");
        } else {
          setCouponPrice(numericValue);
          if (minimumBillAmount && minimumBillAmount <= numericValue) {
            setErrorMessage(
              "Minimum bill amount should be greater than coupon price.",
            );
          } else {
            setErrorMessage("");
          }
        }
      }
    },
    [],
  );
  const handleUptoPriceChange = useCallback(() => {
    if (couponType === "AMOUNT") {
      return toast.error("Price is Mandatory");
    }
    setCouponPrice(0);
    setIsUptoPriceActive(!isUptoPriceActive);
  }, [isUptoPriceActive]);

  const uptoPrice = couponType === "AMOUNT" ? true : isUptoPriceActive;

  return (
    <section className="flex flex-col gap-2 mt-6 lg:gap-4">
      <section className="flex items-center justify-between">
        <h3 className="font-semibold opacity-50">
          {couponType === "PERCENTAGE" ? "Upto price" : "Select Fixed Price"}
        </h3>
        {couponType !== "AMOUNT" && (
          <Switch
            checked={uptoPrice}
            onChange={handleUptoPriceChange}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        )}
      </section>
      {uptoPrice && (
        <input
          type="tel"
          id="price"
          placeholder="Please enter price"
          value={couponPrice === 0 ? "" : couponPrice}
          maxLength={21}
          onChange={handleInputChange}
          className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
        />
      )}
    </section>
  );
};

const FixedPrice = memo(MemoFixedPrice);

export default FixedPrice;
