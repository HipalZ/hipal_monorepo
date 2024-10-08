import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { Switch } from "@headlessui/react";
import { memo, useCallback, useState } from "react";

const MemoMinimumBillCondition = () => {
  const {
    couponPrice,
    addMinimumBillAmount,
    setAddMinimumBillAmount,
    minimumBillAmount,
    setMinimumBillAmount,
  } = useCouponsStore((s) => ({
    couponPrice: s.couponPrice,
    addMinimumBillAmount: s.addMinimumBillAmount,
    setAddMinimumBillAmount: s.setAddMinimumBillAmount,
    minimumBillAmount: s.minimumBillAmount,
    setMinimumBillAmount: s.setMinimumBillAmount,
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const handleMinimumBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > 300000) {
      setErrorMessage("Max you can claim is ₹3,00,000");
    } else {
      setMinimumBillAmount(value);
      if (value <= couponPrice) {
        setErrorMessage(
          "Minimum bill amount should be greater than coupon price.",
        );
      } else {
        setErrorMessage("");
      }
    }
  };

  const handleMinimumBillToggle = useCallback(() => {
    setAddMinimumBillAmount(!addMinimumBillAmount);
    setMinimumBillAmount(0);
  }, [addMinimumBillAmount]);
  return (
    <Background className="">
      <section className="flex items-center justify-between text-nowrap">
        <h3 className="font-semibold opacity-60">Add minimum Bill amount</h3>
        <Switch
          checked={addMinimumBillAmount}
          onChange={handleMinimumBillToggle}
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
            className={`w-full px-4 mt-4 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF] ${
              errorMessage ? "border-red-500" : ""
            }`}
          />
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
          )}
        </>
      )}
    </Background>
  );
};

const MinimumBillCondition = memo(MemoMinimumBillCondition);
export default MinimumBillCondition;
