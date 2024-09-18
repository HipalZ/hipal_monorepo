import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { Switch } from "@headlessui/react";
import { memo, useState } from "react";

const MemoFixedPrice = () => {
  const {
    couponPrice,
    setCouponPrice,
    addMinimumBillAmount,
    setAddMinimumBillAmount,
    couponType,
    minimumBillAmount,
    setMinimumBillAmount,
  } = useCouponsStore((s) => ({
    couponPrice: s.couponPrice,
    setCouponPrice: s.setCouponPrice,
    addMinimumBillAmount: s.addMinimumBillAmount,
    setAddMinimumBillAmount: s.setAddMinimumBillAmount,
    couponType: s.couponType,
    minimumBillAmount: s.minimumBillAmount,
    setMinimumBillAmount: s.setMinimumBillAmount,
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // Check if the minimum bill amount is valid
        if (minimumBillAmount && minimumBillAmount <= numericValue) {
          setErrorMessage(
            "Minimum bill amount should be greater than coupon price.",
          );
        } else {
          setErrorMessage("");
        }
      }
    }
  };

  const handleMinimumBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 300000) {
      setErrorMessage("Max you can claim is ₹3,00,000");
    } else {
      setMinimumBillAmount(value);
      // Check if the minimum bill amount is greater than the coupon price
      if (value <= couponPrice) {
        setErrorMessage(
          "Minimum bill amount should be greater than coupon price.",
        );
      } else {
        setErrorMessage("");
      }
    }
  };

  return (
    <section className="flex flex-col gap-2 mx-6 mt-6 lg:gap-8 lg:flex-row pb-[5rem]">
      <article className="flex-1">
        <label className="font-semibold opacity-50" htmlFor="price">
          {couponType === "PERCENTAGE" ? "Upto price" : "Select Fixed Price"}
        </label>
        <Background>
          <input
            type="tel"
            id="price"
            placeholder="Please enter price"
            value={couponPrice === 0 ? "" : couponPrice}
            maxLength={21}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
          />
        </Background>
      </article>

      <Background className="flex-1 lg:mt-8">
        <section className="flex items-center justify-between">
          <h3>Add minimum Bill amount</h3>
          <Switch
            checked={addMinimumBillAmount}
            onChange={setAddMinimumBillAmount}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </section>
        {addMinimumBillAmount && (
          <>
            <input
              type="number"
              value={minimumBillAmount === 0 ? "" : minimumBillAmount}
              onChange={handleMinimumBillChange}
              placeholder="Please enter amount"
              className="w-full p-2 mt-4 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
            {errorMessage && (
              <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
            )}
          </>
        )}
      </Background>
    </section>
  );
};

const FixedPrice = memo(MemoFixedPrice);

export default FixedPrice;
