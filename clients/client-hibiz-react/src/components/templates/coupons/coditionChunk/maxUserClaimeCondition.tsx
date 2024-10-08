import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { Switch } from "@headlessui/react";
import { memo, useCallback, useState } from "react";

const MemoMaxUserClaimCondition = () => {
  const {
    couponUserClaim,
    setCouponUserClaim,
    setExpiryClaimLimitValue,
    expiryClaimLimitValue,
  } = useCouponsStore((s) => ({
    couponUserClaim: s.couponUserClaim,
    setCouponUserClaim: s.setCouponUserClaim,
    setExpiryClaimLimitValue: s.setExpiryClaimLimitValue,
    expiryClaimLimitValue: s.expiryClaimLimitValue,
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const handleLimitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      if (value > 10000) {
        setErrorMessage(
          "Max limit is 10 Thousand (10,000). You cannot add more than that.",
        );
      } else {
        setErrorMessage("");
        setExpiryClaimLimitValue(value === 0 ? 0 : Math.max(0, value));
      }
    },
    [setExpiryClaimLimitValue],
  );

  const handleLimitToggle = useCallback(() => {
    setCouponUserClaim(!couponUserClaim);
    setExpiryClaimLimitValue(0);
  }, [couponUserClaim]);
  return (
    <Background>
      <section className="flex items-center justify-between text-nowrap">
        <h3 className="font-semibold opacity-60">
          Max times a user can use this
        </h3>
        <Switch
          checked={couponUserClaim}
          onChange={handleLimitToggle}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </section>
      {couponUserClaim && (
        <>
          <input
            type="number"
            value={expiryClaimLimitValue === 0 ? "" : expiryClaimLimitValue}
            onChange={handleLimitChange}
            placeholder="Please enter count"
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

const MaxUserClaimCondition = memo(MemoMaxUserClaimCondition);
export default MaxUserClaimCondition;
