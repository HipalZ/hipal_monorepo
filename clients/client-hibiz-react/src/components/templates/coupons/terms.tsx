import { memo, useCallback, useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";

const MAX_TERMS = 10; // Max limit for terms and conditions

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
  termsAndConditions,
  handleRemoveCondition,
}: {
  couponType: string;
  couponDiscount: number;
  couponPrice: number;
  minimumBillAmount: number;
  overAllLimit: number;
  expiryCoupon: string;
  customDays: string[];
  couponStartDate: number | null;
  couponEndDate: number | null;
  termsAndConditions: string[];
  handleRemoveCondition: (index: number) => void;
}) => {
  console.log(termsAndConditions);

  const getExpiryMessage = useCallback(() => {
    const now = new Date().getTime();

    if (
      couponStartDate === null &&
      couponEndDate === null &&
      overAllLimit > 0
    ) {
      return `Expires after ${overAllLimit} claims`;
    }

    if (couponStartDate === null && couponEndDate !== null) {
      const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysLeft} days${
        overAllLimit > 0 ? ` or after ${overAllLimit} claims` : ""
      }`;
    }

    if (couponStartDate !== null && couponEndDate !== null) {
      const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
      return `Expires in ${daysLeft} days${
        overAllLimit > 0 ? ` or after ${overAllLimit} claims` : ""
      }`;
    }

    if (overAllLimit > 0) {
      return `Expires after ${overAllLimit} claims`;
    }
    return "Expires: None";
  }, [couponEndDate, couponStartDate, overAllLimit]);

  return (
    <div className="relative p-4 bg-white border border-gray-300 rounded-lg shadow-md w-[100%] max-w-[28rem]">
      <h3 className="text-lg font-semibold text-black">
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% off on ${
              couponPrice > 0 ? `₹${couponPrice}` : "every bill"
            }`
          : `₹${couponPrice || "0"} off on ${
              minimumBillAmount > 0 ? `₹${minimumBillAmount}` : "up to bill"
            }`}
      </h3>
      <h3 className="mt-2 text-sm">
        {getExpiryMessage()}
        {overAllLimit > 0 &&
          expiryCoupon !==
            "After Specific Use (e.g., Expires after it’s used 10 times)"}
      </h3>
      {customDays && customDays.length > 0 ? (
        <h3 className="mt-2 text-sm">
          Valid on: {customDays.map((day) => day.slice(0, 2)).join(", ")}
        </h3>
      ) : (
        <h3 className="mt-2 text-sm">Valid all the time</h3>
      )}
      {termsAndConditions && termsAndConditions.length > 0 && (
        <ul className="mt-4 ml-4 list-disc">
          {termsAndConditions.map((term, index) => (
            <li key={index} className="relative flex justify-between">
              <div className="absolute w-2 h-2 bg-black rounded-full -left-4 top-2" />
              <span className="w-[96%]">{term}</span>
              <button
                type="button"
                className=" bg-[#9267EC] text-white w-5 h-5 rounded-full text-xs absolute -right-2 top-1"
                onClick={() => handleRemoveCondition(index)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MemoTerms = () => {
  const {
    requiredFields,
    setRequiredFields,
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
    termsAndConditions,
    setTermsAndConditions,
  } = useCouponsStore((s) => ({
    requiredFields: s.requiredFields,
    setRequiredFields: s.setRequiredFields,
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
    termsAndConditions: s.termsAndConditions,
    setTermsAndConditions: s.setTermsAndConditions,
  }));

  const [newCondition, setNewCondition] = useState("");

  const handleAddCondition = useCallback(() => {
    if (newCondition.trim() !== "" && termsAndConditions.length < MAX_TERMS) {
      setTermsAndConditions([...termsAndConditions, newCondition]);
      setNewCondition("");
    }
  }, [newCondition, termsAndConditions, setTermsAndConditions]);

  const handleRemoveCondition = useCallback(
    (index: number) => {
      const updatedTerms = termsAndConditions.filter((_, i) => i !== index);
      setTermsAndConditions(updatedTerms);
    },
    [termsAndConditions, setTermsAndConditions],
  );

  const handleNext = useCallback(() => {
    setSelectedPage("PREVIEW");
  }, []);

  return (
    <>
      <section className="mx-6 mt-[2rem] lg:mt-4 lg:gap-10 gap-4 flex flex-col pb-[7rem]">
        {selectedGroupIds.length === 0 && selectedUserIds.length === 0 ? (
          <article className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dob"
              checked={requiredFields.includes("dob")}
              onChange={() => setRequiredFields(["dob"])}
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
          termsAndConditions={termsAndConditions}
          handleRemoveCondition={handleRemoveCondition}
        />

        <section className="flex flex-col mt-4">
          <label htmlFor="terms" className="font-semibold opacity-50">
            Add Terms and Conditions (up to 10)
          </label>
          <Background>
            <input
              id="terms"
              placeholder="Enter a term and condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              minLength={1}
              maxLength={100}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
            {termsAndConditions.length >= MAX_TERMS && (
              <p className="mt-2 text-sm text-red-500">
                You have reached the maximum limit of terms and conditions
              </p>
            )}
            <button
              type="button"
              className="px-4 float-right py-2 mt-2 text-white bg-[#9267EC] rounded-lg"
              onClick={handleAddCondition}
              disabled={termsAndConditions.length >= MAX_TERMS}
            >
              Add Condition
            </button>
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

const Terms = memo(MemoTerms);

export default Terms;
