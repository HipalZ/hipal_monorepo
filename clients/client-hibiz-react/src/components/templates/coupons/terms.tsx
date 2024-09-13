import { useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import toast from "react-hot-toast";

const Terms = () => {
  const {
    requiredFields,
    setRequiredFields,
    termsAndConditions,
    setTermsAndConditions,
    setSelectedPage,
  } = useCouponsStore((s) => ({
    requiredFields: s.requiredFields,
    setRequiredFields: s.setRequiredFields,
    termsAndConditions: s.termsAndConditions,
    setTermsAndConditions: s.setTermsAndConditions,
    setSelectedPage: s.setSelectedPage,
  }));
  const [verifyDOB, setVerifyDOB] = useState(requiredFields.includes("DOB"));

  const handleCheckboxToggle = () => {
    setVerifyDOB(!verifyDOB);
    if (!verifyDOB) {
      setRequiredFields([...requiredFields, "DOB"]);
    } else {
      setRequiredFields(requiredFields.filter((field) => field !== "DOB"));
    }
  };

  const handleNext = () => {
    setSelectedPage("PREVIEW");
  };

  return (
    <>
      <section className="mx-6 mt-[2rem] lg:mt-4 lg:gap-10 gap-4 flex flex-col pb-[7rem]">
        <article className="flex items-center gap-2">
          <input
            type="checkbox"
            id="DOB"
            checked={verifyDOB}
            onChange={handleCheckboxToggle}
            className="text-black rounded"
          />
          <label htmlFor="DOB" className="font-semibold text-gray-700">
            Verify Date of Birth
          </label>
        </article>
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
