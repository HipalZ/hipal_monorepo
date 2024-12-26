import { memo, useCallback, useEffect, useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import { formatDate } from "@/components/utils/helper";
import useBusinessData from "@/components/store/useBusinessData";

const MAX_TERMS = 18;

const MemoTerms = () => {
  const {
    requiredFields,
    setRequiredFields,
    setSelectedPage,
    couponPrice,
    customDays,
    couponStartDate,
    couponEndDate,
    termsAndConditions,
    setTermsAndConditions,
    startTime,
    endTime,
    selectFlow,
  } = useCouponsStore((s) => ({
    requiredFields: s.requiredFields,
    setRequiredFields: s.setRequiredFields,
    setSelectedPage: s.setSelectedPage,
    couponPrice: s.couponPrice,
    customDays: s.customDays,
    couponStartDate: s.couponStartDate,
    couponEndDate: s.couponEndDate,
    termsAndConditions: s.termsAndConditions,
    setTermsAndConditions: s.setTermsAndConditions,
    startTime: s.startTime,
    endTime: s.endTime,
    selectFlow: s.selectFlow,
  }));

  const dineInOnly = true;

  const [newCondition, setNewCondition] = useState("");

  const businessName = useBusinessData((s) => s.businessData?.name);
  const getExpiryMessage = useCallback(() => {
    if (couponStartDate && couponEndDate) {
      const startDateFormatted = formatDate(couponStartDate);
      const endDateFormatted = formatDate(couponEndDate);
      return `This coupon is only valid from ${startDateFormatted} to ${endDateFormatted}`;
    }
    return "No expiration details available";
  }, [couponStartDate, couponEndDate]);

  const generatedTerms = [
    `This coupon is created by ${businessName?.toUpperCase()}  and has the final say in case of any disputes.`,
    `This is an ${selectFlow} coupon, hence transferring it to anyone else is ${
      selectFlow === "ASSIGN" ? "" : "not"
    } acceptable.`,
    couponPrice > 0
      ? `This coupon works on bill value above "₹${couponPrice}" only.`
      : null,
    customDays && customDays.length > 0
      ? `This coupon works only on ${customDays?.join(", ")}.`
      : "All the time",
    startTime !== null && endTime !== null
      ? `This coupon works only between ${startTime}:00 AM to ${endTime}:00 AM.`
      : null,
    getExpiryMessage(),
    dineInOnly ? "This coupon is applicable only on walk-in." : null,
    "Hipalz has no role to play on issues, charges, refunds and other things related to this.",
    "Other T&C may apply.",
  ].filter(Boolean);

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
    setSelectedPage("SHARE");
  }, []);

  const savingREquiredFields = useCallback(() => {
    if (requiredFields.includes("dob")) {
      setRequiredFields([]);
    } else {
      setRequiredFields(["dob"]);
    }
  }, [requiredFields]);

  useEffect(() => {
    setTermsAndConditions(generatedTerms);
  }, []);

  return (
    <>
      <section className="mx-6 mt-[2rem] lg:mt-4 lg:gap-10 gap-4 flex flex-col pb-[7rem]">
        {selectFlow === "GRAB" ? (
          <article className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dob"
              checked={requiredFields.includes("dob")}
              onChange={savingREquiredFields}
              className="text-black rounded"
            />
            <label htmlFor="dob" className="font-semibold text-gray-700">
              Verify Date of Birth
            </label>
          </article>
        ) : null}
        <div className="relative p-4 bg-white border border-gray-300 rounded-lg shadow-md w-full max-w-[28rem]">
          <ul className="ml-4 space-y-2 list-disc">
            {generatedTerms.map((term, index) => (
              <li key={index} className="text-sm">
                {term}
              </li>
            ))}
          </ul>

          {termsAndConditions && termsAndConditions.length > 0 && (
            <ul className="mt-4 ml-4 space-y-2 list-disc">
              {termsAndConditions
                .slice(generatedTerms.length || 8)
                .map((term, index) => (
                  <li key={index} className="relative flex items-start">
                    <span className="w-full pr-6">{term}</span>
                    <button
                      type="button"
                      className="absolute right-0 w-5 h-5 text-xs text-white bg-red-500 rounded-full"
                      onClick={() => handleRemoveCondition(index)}
                    >
                      ✕
                    </button>
                    <div className="absolute -left-3.5 rounded-full w-1 h-1 bg-black top-[0.75rem]" />
                  </li>
                ))}
            </ul>
          )}
        </div>
        <section className="flex flex-col mt-4 w-full max-w-[30rem]">
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
          { text: "Back", onClick: () => setSelectedPage("CUSTOM") },
          { text: "Save and customize", onClick: handleNext },
        ]}
        fixed
      />
    </>
  );
};

const Terms = memo(MemoTerms);

export default Terms;
