import { memo, useCallback, useState, useMemo } from "react";
import Background from "@/components/atom/feildBackground";
import useCouponsStore from "@/components/store/useCouponsStore";
import { cn } from "@hi/common";
import BottomButton from "@/components/atom/bottomButton";
import toast from "react-hot-toast";
import { Switch } from "@headlessui/react";

const MemoCondition = () => {
  const {
    expiryClaimLimit,
    setExpiryClaimLimit,
    expiryClaimLimitValue,
    setExpiryClaimLimitValue,
    expiryAfterGrabbed,
    setExpiryAfterGrabbed,
    setSelectedPage,
    couponEndDate,
    couponStartDate,
    afterExpiry,
    setAfterExpiry,
  } = useCouponsStore((s) => ({
    expiryClaimLimit: s.expiryClaimLimit,
    setExpiryClaimLimit: s.setExpiryClaimLimit,
    expiryClaimLimitValue: s.expiryClaimLimitValue,
    setExpiryClaimLimitValue: s.setExpiryClaimLimitValue,
    setExpiryAfterGrabbed: s.setExpiryAfterGrabbed,
    expiryAfterGrabbed: s.expiryAfterGrabbed,
    setSelectedPage: s.setSelectedPage,
    couponEndDate: s.couponEndDate,
    couponStartDate: s.couponStartDate,
    afterExpiry: s.afterExpiry,
    setAfterExpiry: s.setAfterExpiry,
  }));

  const [errorMessage, setErrorMessage] = useState("");
  const [dateErrorMessage, setDateErrorMessage] = useState("");

  // Initialize expiryHours based on expiryAfterGrabbed (duration in milliseconds)
  const [expiryHours, setExpiryHours] = useState<number | "">(() =>
    expiryAfterGrabbed ? expiryAfterGrabbed / (1000 * 60 * 60) : "",
  );

  const totalAvailableHours = useMemo(() => {
    if (!couponStartDate && !couponEndDate) {
      return 8760; // Default to one year in hours
    }
    if (couponStartDate && couponEndDate) {
      const totalMilliseconds = couponEndDate - couponStartDate;
      return totalMilliseconds / (1000 * 60 * 60);
    }
    return 0;
  }, [couponStartDate, couponEndDate]);

  const handleHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = Number(e.target.value);

      if (value < 0) {
        value = 0;
      } else if (value > totalAvailableHours) {
        value = totalAvailableHours;
      }

      setExpiryHours(value);
      const newExpiryDuration = value * 60 * 60 * 1000;
      setExpiryAfterGrabbed(newExpiryDuration);
      setDateErrorMessage("");
    },
    [totalAvailableHours, setExpiryAfterGrabbed],
  );

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

  const handleSave = useCallback(() => {
    if (expiryClaimLimit === "SET_LIMIT" && !expiryClaimLimitValue) {
      return toast.error(
        "Please enter a limit for how many times a user can claim this.",
      );
    }
    if (dateErrorMessage) {
      return toast.error("Please correct the date error before proceeding.");
    } else {
      setSelectedPage("Terms");
    }
  }, [
    expiryClaimLimit,
    expiryClaimLimitValue,
    dateErrorMessage,
    setSelectedPage,
  ]);

  const expiryGrabToggle = useCallback(() => {
    setAfterExpiry(!afterExpiry);
    setExpiryHours(0);
  }, [afterExpiry]);

  return (
    <>
      <section className="mx-6 mt-[2rem] lg:mt-4 lg:gap-10 gap-4 flex flex-col md:flex-row lg:flex-row pb-[7rem]">
        <Background className="flex-1">
          <section className="flex items-center justify-between text-nowrap">
            <h3>After grabbing coupon, it expires in</h3>
            <Switch
              checked={afterExpiry}
              onChange={expiryGrabToggle}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
            >
              <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
            </Switch>
          </section>
          {afterExpiry && (
            <>
              <center className="mb-2 text-[#8C63FF] -mx-3 font-semibold mt-4 bg-[#8C63FF30]">
                Value between 0 and {Math.round(totalAvailableHours)} hours.
              </center>

              <input
                type="number"
                value={expiryHours === "" ? "" : expiryHours}
                onChange={handleHoursChange}
                placeholder={`Enter hours (0 to ${Math.round(
                  totalAvailableHours,
                )} hours)`}
                className={`w-full px-4 py-3 bg-[#EEEFF4] rounded-2xl ${
                  dateErrorMessage ? "border-red-500" : ""
                }`}
              />
            </>
          )}

          {dateErrorMessage && (
            <p className="mt-4 text-sm text-red-500">{dateErrorMessage}</p>
          )}
          {expiryAfterGrabbed ? (
            <p className="mt-4 text-sm text-gray-700">
              Coupon expires after: {expiryHours} hour(s)
            </p>
          ) : null}
        </Background>
        <section className="flex-1">
          <h3>How many times can a user claim this</h3>
          <article className="p-4 mt-2 bg-white rounded-xl">
            <label className="text-xs font-semibold opacity-50" htmlFor="name">
              Select one type*
            </label>
            <article className="flex w-full mt-4">
              <button
                type="button"
                onClick={() => setExpiryClaimLimit("NO_LIMIT")}
                className={cn(
                  "p-6 rounded-2xl flex-1 mx-2 text-left",
                  expiryClaimLimit === "NO_LIMIT"
                    ? "bg-[#F1E9FB] text-[#8C63FF]"
                    : "bg-[#f4f4f490]",
                )}
              >
                No Limit
              </button>
              <button
                type="button"
                onClick={() => setExpiryClaimLimit("SET_LIMIT")}
                className={cn(
                  "p-6 rounded-2xl flex-1 mx-2 text-left",
                  expiryClaimLimit === "SET_LIMIT"
                    ? "bg-[#F1E9FB] text-[#8C63FF]"
                    : "bg-[#f4f4f490]",
                )}
              >
                Set Limit
              </button>
            </article>
          </article>
          {expiryClaimLimit === "SET_LIMIT" && (
            <article className="mt-4">
              <h3>No. of times a user can claim this</h3>
              <Background>
                <input
                  type="number"
                  value={
                    expiryClaimLimitValue === 0 ? "" : expiryClaimLimitValue
                  }
                  onChange={handleLimitChange}
                  placeholder="Please enter count"
                  className={`w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF] ${
                    errorMessage ? "border-red-500" : ""
                  }`}
                />
              </Background>
              {errorMessage && (
                <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
              )}
            </article>
          )}
        </section>
      </section>
      <BottomButton
        buttons={[
          {
            text: "Back",
            onClick: () => setSelectedPage("ELIGIBILITY"),
          },
          {
            text: "Save",
            onClick: handleSave,
          },
        ]}
        fixed
      />
    </>
  );
};

const Condition = memo(MemoCondition);
export default Condition;
