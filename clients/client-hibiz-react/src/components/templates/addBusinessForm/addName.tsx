import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { memo, useCallback, useState } from "react";

const AddName = () => {
  const { setStep, step, businessName, setBusinessName, setCustomLink, customLink } = useBusinessCtrl((s) => ({
    setStep: s.setStep,
    step: s.step,
    businessName: s.businessName,
    setBusinessName: s.setBusinessName,
    setCustomLink: s.setCustomLink,
    customLink: s.customLink,
  }));

  const [validCustomLink, setValidCustomLink] = useState(false);
  const [validBusinessName, setValidBusinessName] = useState(false);

  const addBusinessName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessName(e.target.value);
  };

  const addCustomLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLink(e.target.value);
  };

  const goNext = useCallback(() => {
    if (businessName === "") {
      setValidBusinessName(true);
      return;
    }
    if (customLink === "") {
      setValidCustomLink(true);
      return;
    }
    setStep(step + 1);
  }, [setStep, step, businessName, customLink]);
  return (
    <main>
      <section className="mx-6 mt-4 space-y-2">
        <h5 className="text-lg">Your Outlet name*</h5>
        <input
          type="text"
          value={businessName}
          className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          placeholder="Enter your name"
          maxLength={20}
          onChange={addBusinessName}
          required
        />
        {validBusinessName && <span className="text-red-500">Please enter a valid name</span>}
      </section>
      <section className="mx-6 mt-8 space-y-2">
        <h5 className="text-lg">Your customized Link*</h5>
        <span className="opacity-50">Your customers will access your website thought this link</span>
        <div className="relative w-full overflow-hidden">
          <input
            type="text"
            value={customLink}
            className="w-full px-4 py-3 pr-20 border border-black rounded-2xl"
            placeholder="Custom Link"
            maxLength={15}
            onChange={addCustomLink}
            required
          />
          <span className="absolute text-[#2900FF] bg-[#E4E0F9] py-3 px-4 transform -translate-y-1/2 right-0 top-1/2 rounded-r-2xl">.hipal.life</span>
        </div>
        {validCustomLink && <span className="text-red-500">Please enter a valid link</span>}
      </section>
      <button type="button" onClick={goNext} className="bottom_btn">
        Next
      </button>
    </main>
  );
};

const MemoiseAddName = memo(AddName);
export default MemoiseAddName;
