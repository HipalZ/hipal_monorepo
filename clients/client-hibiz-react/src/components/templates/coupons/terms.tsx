import { useCallback, useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";

const CouponConditionsBox = ({
  couponType,
  couponDiscount,
  couponPrice,
  minimumBillAmount,
  overAllLimit,
  expiryCoupon,
  customDays,
  couponStartDate,
  couponEndDate,
}) => {
  const getExpiryMessage = useCallback(() => {
    const now = new Date().getTime();
    if (couponStartDate === 0 && couponEndDate === 0 && overAllLimit === 0) {
      return "Expires : None";
    }

    if (couponStartDate === 0 && couponEndDate > 0) {
      const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysLeft} days ${
        overAllLimit > 0 ? `or after ${overAllLimit} claims` : ""
      }`;
    }

    if (couponStartDate > 0 && couponEndDate > 0) {
      const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysLeft} days ${
        overAllLimit > 0 ? `or after ${overAllLimit} claims` : ""
      }`;
    }

    if (overAllLimit > 0) {
      return ` ${overAllLimit > 0 ? `After ${overAllLimit} claims` : ""}`;
    }

    return null;
  }, [couponStartDate, couponEndDate, overAllLimit]);

  return (
    <div className="relative p-4 bg-white border border-gray-300 rounded-lg shadow-md w-[100%] max-w-[28rem]">
      {/* Discount / Offer */}
      <h3 className="text-lg font-semibold text-black">
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% off on ${
              couponPrice > 0 ? "₹" + couponPrice : "every bill"
            }`
          : `₹${couponPrice || "0"} off on ${
              minimumBillAmount > 0 ? `₹${minimumBillAmount}` : "up to bill"
            }`}
      </h3>

      {/* Expiry Message */}
      <h3 className="mt-4 text-sm">
        {getExpiryMessage()}
        {overAllLimit > 0 &&
          expiryCoupon !==
            "After Specific Use (e.g., Expires after it’s used 10 times)"}
      </h3>

      {/* Custom Days */}
      {customDays && customDays.length > 0 ? (
        <h3 className="mt-2 text-sm">
          Valid on: {customDays.map((day) => day.slice(0, 2)).join(", ")}
        </h3>
      ) : (
        <h3 className="mt-2 text-sm">Valid all the time</h3>
      )}
    </div>
  );
};

const Terms = () => {
  const {
    requiredFields,
    setRequiredFields,
    termsAndConditions,
    setTermsAndConditions,
    setSelectedPage,
    selectedGroupIds,
    selectedUserIds,
    couponType,
    couponPrice,
    couponDiscount,
    minimumBillAmount,
    customDays,
    expiryCoupon,
    overAllLimit,
    couponStartDate,
    couponEndDate,
  } = useCouponsStore((s) => ({
    requiredFields: s.requiredFields,
    setRequiredFields: s.setRequiredFields,
    termsAndConditions: s.termsAndConditions,
    setTermsAndConditions: s.setTermsAndConditions,
    setSelectedPage: s.setSelectedPage,
    selectedGroupIds: s.selectedGroupIds,
    selectedUserIds: s.selectedUserIds,
    couponType: s.couponType,
    couponPrice: s.couponPrice,
    couponDiscount: s.couponDiscount,
    minimumBillAmount: s.minimumBillAmount,
    customDays: s.customDays,
    overAllLimit: s.overAllLimit,
    expiryCoupon: s.expiryCoupon,
    couponStartDate: s.couponStartDate,
    couponEndDate: s.couponEndDate,
  }));
  const [verifyDOB, setVerifyDOB] = useState(requiredFields.includes("dob"));

  console.log(
    "Selected Group Ids:",
    selectedGroupIds,
    "Selected User Ids:",
    selectedUserIds,
  );

  const handleCheckboxToggle = () => {
    setVerifyDOB(!verifyDOB);
    if (!verifyDOB) {
      setRequiredFields([...requiredFields, "dob"]);
    } else {
      setRequiredFields(requiredFields.filter((field) => field !== "dob"));
    }
  };

  const handleNext = () => {
    setSelectedPage("PREVIEW");
  };

  return (
    <>
      <section className="mx-6 mt-[2rem] lg:mt-4 lg:gap-10 gap-4 flex flex-col pb-[7rem]">
        {selectedGroupIds.length === 0 && selectedUserIds.length === 0 ? (
          <article className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dob"
              checked={verifyDOB}
              onChange={handleCheckboxToggle}
              className="text-black rounded"
            />
            <label htmlFor="dob" className="font-semibold text-gray-700">
              Verify Date of Birth
            </label>
          </article>
        ) : null}

        <CouponConditionsBox
          couponDiscount={couponDiscount}
          couponPrice={couponPrice}
          couponType={couponType}
          customDays={customDays}
          expiryCoupon={expiryCoupon}
          minimumBillAmount={minimumBillAmount}
          overAllLimit={overAllLimit}
          couponEndDate={couponEndDate}
          couponStartDate={couponStartDate}
        />
        <section className="flex flex-col mt-4">
          <label htmlFor="terms" className="font-semibold opacity-50">
            Terms and Conditions*
          </label>
          <Background>
            <textarea
              id="terms"
              placeholder="Enter terms and conditions"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full h-40 p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
          </Background>
        </section>
      </section>
      <BottomButton
        buttons={[
          { text: "Back", onClick: () => setSelectedPage("GRABBING") },
          { text: "Save and customize", onClick: handleNext },
        ]}
        fixed
      />
    </>
  );
};

export default Terms;
