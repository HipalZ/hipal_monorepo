import { memo, useCallback, useState } from "react";
import Coupon from "./coupon";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import { IoMdArrowDropdown } from "react-icons/io";
import PopUp from "@/components/atom/popUp";
import BottomButton from "@/components/atom/bottomButton";
import { cn } from "@hi/common";
import DatePicker from "react-datepicker";
import { addDays, endOfMonth } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const expiryArray = [
  { id: 1, text: "No Expiration" },
  { id: 3, text: "After X Days (e.g., Expires 30 days after activation)" },
  {
    id: 5,
    text: "End of Month (e.g., Expires at the end of the current week or month)",
  },
  {
    id: 6,
    text: "After Specific Use (e.g., Expires after it’s used 10 times)",
  },
  { id: 7, text: "Custom Expiration (e.g., Start and end date)" },
];

const MemoExpiry = () => {
  const {
    expiryModal,
    setExpiryModal,
    expiryCoupon = "No Expiration",
    setExpiryCoupon,
    couponStartDate,
    setCouponStartDate,
    couponEndDate,
    setCouponEndDate,
    setShowDatePicker,
    showDatePicker,
    overAllLimit,
    setOverAllLimit,
    setSelectedPage,
  } = useCouponsStore((s) => ({
    expiryModal: s.expiryModal,
    setExpiryModal: s.setExpiryModal,
    expiryCoupon: s.expiryCoupon,
    setExpiryCoupon: s.setExpiryCoupon,
    couponStartDate: s.couponStartDate,
    setCouponStartDate: s.setCouponStartDate,
    couponEndDate: s.couponEndDate,
    setCouponEndDate: s.setCouponEndDate,
    setShowDatePicker: s.setShowDatePicker,
    showDatePicker: s.showDatePicker,
    overAllLimit: s.overAllLimit,
    setOverAllLimit: s.setOverAllLimit,
    setSelectedPage: s.setSelectedPage,
  }));

  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setExpiryModal(true);
  }, [setExpiryModal]);

  const closeModal = useCallback(() => {
    setExpiryModal(false);
  }, [setExpiryModal]);

  const handleExpirySelection = useCallback(
    (text: string) => {
      setExpiryCoupon(text);

      if (text === "No Expiration") {
        setCouponStartDate(0);
        setCouponEndDate(0);
        setOverAllLimit(0);
        setShowDatePicker(false);
      } else if (text === "Custom Expiration (e.g., Start and end date)") {
        setShowDatePicker(true);
      } else {
        setShowDatePicker(false);
        const currentDate = new Date();

        if (text === "After X Days (e.g., Expires 30 days after activation)") {
          setCouponStartDate(currentDate.getTime());
          setCouponEndDate(addDays(currentDate, 30).getTime());
        }

        if (
          text ===
          "End of Month (e.g., Expires at the end of the current week or month)"
        ) {
          setCouponStartDate(currentDate.getTime());
          setCouponEndDate(endOfMonth(currentDate).getTime());
        }
      }
    },
    [setExpiryCoupon, setShowDatePicker, setCouponStartDate, setCouponEndDate],
  );

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    if (start && end && end < start) {
      setError("End date must be after start date.");
    } else {
      setError(null);
    }

    setCouponStartDate(start ? start.getTime() : null);
    setCouponEndDate(end ? end.getTime() : null);
  };

  const handleClaimsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (value > 10000) {
      setError("Overall limit exceeded. Maximum allowed is 10,000.");
    } else {
      setError(null);
      setOverAllLimit(value);
    }
  };

  const isSaveDisabled =
    !!error ||
    (!couponStartDate &&
      expiryCoupon !==
        "After Specific Use (e.g., Expires after it’s used 10 times)") ||
    (!couponEndDate &&
      expiryCoupon !==
        "After Specific Use (e.g., Expires after it’s used 10 times)") ||
    (expiryCoupon ===
      "After Specific Use (e.g., Expires after it’s used 10 times)" &&
      (overAllLimit <= 0 || !overAllLimit));

  const goNext = useCallback(() => {
    if (
      expiryCoupon ===
        "After Specific Use (e.g., Expires after it’s used 10 times)" &&
      !overAllLimit
    ) {
      return setError("Please enter the number of claims");
    }
    setSelectedPage("ELIGIBILITY");
  }, [expiryCoupon, overAllLimit]);

  return (
    <section className="pb-[6rem] overflow-hidden flex flex-col lg:flex-row gap-6">
      <Coupon />
      <section className="mx-6 mt-[2rem] lg:mt-4 flex-1">
        <h3>Set Coupon Expiry</h3>
        <Background>
          <button
            type="button"
            onClick={openModal}
            className="w-full px-4 py-3 border border-black rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-left truncate opacity-30">
                {expiryCoupon || "Select Expiration"}
              </h4>
              <IoMdArrowDropdown />
            </div>
          </button>
        </Background>

        {expiryCoupon !== "No Expiration" && (
          <>
            <h3>After No. of claims</h3>
            <Background>
              <input
                type="number"
                value={overAllLimit}
                placeholder="Enter Number of Claims"
                className="w-full px-4 py-3 border border-black rounded-2xl"
                onChange={handleClaimsChange}
              />
            </Background>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </>
        )}
      </section>

      {expiryModal && (
        <PopUp show={expiryModal} onClose={closeModal} width="w-[28rem]">
          <article className=" h-[80dvh] overflow-auto">
            {!showDatePicker ? (
              <ul className="mt-4">
                {expiryArray.map((expiry) => (
                  <li
                    key={expiry.id}
                    className={cn(
                      "px-4 mx-4 py-2 cursor-pointer rounded-xl hover:bg-[#6A31DF50]",
                      expiryCoupon === expiry.text
                        ? "bg-[#6A31DF50]  text-white"
                        : "opacity-60",
                    )}
                    onClick={() => handleExpirySelection(expiry.text)}
                  >
                    {expiry.text}
                  </li>
                ))}
                <BottomButton
                  buttons={[{ text: "Save", onClick: closeModal }]}
                />
              </ul>
            ) : (
              <>
                <center>
                  <DatePicker
                    selectsRange
                    startDate={
                      couponStartDate ? new Date(couponStartDate) : null
                    }
                    endDate={couponEndDate ? new Date(couponEndDate) : null}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    isClearable
                    className="w-full px-4 mt-4 text-center rounded-full"
                    autoFocus
                  />
                </center>
                {error && (
                  <p className="mt-2 text-center text-red-500">{error}</p>
                )}
                <div className="mt-4">
                  <BottomButton
                    buttons={[
                      {
                        text: "Go Back",
                        onClick: () => setShowDatePicker(false),
                      },
                      {
                        text: "Save",
                        onClick: closeModal,
                        disable: isSaveDisabled,
                      },
                    ]}
                  />
                </div>
              </>
            )}
          </article>
        </PopUp>
      )}
      <BottomButton
        buttons={[
          {
            text: "Back",
            onClick: () => setSelectedPage("AVAILABLE"),
          },
          {
            text: "Next",
            onClick: goNext,
          },
        ]}
        fixed
      />
    </section>
  );
};

const Expiry = memo(MemoExpiry);
export default Expiry;
