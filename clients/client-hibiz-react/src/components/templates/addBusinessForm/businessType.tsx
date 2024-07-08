import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { memo, useCallback } from "react";
import toast from "react-hot-toast";

export const businessTypeArray = [
  {
    title: "🍕Food Biz",
    description: "Give your restaurant🍽️, cafe, bakery🧁, pub🍾 . . . the tools to fly high and capture digital real estate too",
    tags: ["Web page", "E.Menu", "Rewardz & Loyalty", "Payments", "CRM", "Messaging"],
    tagColor: "#9775F8",
    gradient: "linear-gradient(1.7deg, #D9CCFF -11.95%, #F2F2F2 112.46%)",
  },
  {
    title: "✨Others",
    description: "Clothing stores👕, Pet stores🐶, Salons💇 and more. Every store can now be equipped with the advanced technology",
    tags: ["Web page", "E.Catalog", "Rewardz & Loyalty", "Payments", "CRM", "Messaging"],
    tagColor: "#000000",
    gradient: "linear-gradient(7.04deg, #FFF3A6 -60.02%, #F0DDE7 93.33%)",
  },
];

const BusinessType = () => {
  const { step, setStep, businessType, setBusinessType } = useBusinessCtrl(s=>({
	step: s.step,
	setStep: s.setStep,
	businessType: s.businessType,
	setBusinessType: s.setBusinessType,
  }));

  const saveBusinessType = useCallback(
    (type: string) => {
      setBusinessType(type);
    },
    [step],
  );
  const goNext = useCallback(() => {
    if (businessType === "") {
      return toast.error("Please select a business type");
    }
    setStep(step + 1);
  }, [setStep, step, businessType]);
  return (
    <main>
      {businessTypeArray.map((ele) => (
        <section key={ele.title} className="flex flex-col m-6 overflow-hidden border w-[90%] max-w-[30rem] rounded-2xl">
          <article className="flex items-center p-4">
            <input
              type="radio"
              name="businessType"
              value={ele.title}
              id={`businessType-${ele.title}`}
              onChange={() => saveBusinessType(ele.title)}
              checked={businessType === ele.title}
              className="mr-2"
            />
            <h3 className="text-lg font-semibold">{ele.title}</h3>
          </article>

          <article className="p-4" style={{ background: ele.gradient }}>
            <p className="text-sm">{ele.description}</p>
            <div className="flex flex-wrap mt-4">
              {ele.tags.map((tag) => (
                <div key={tag} className="px-4 py-2 m-1 text-xs text-white rounded-full" style={{ backgroundColor: ele.tagColor }}>
                  {tag}
                </div>
              ))}
            </div>
          </article>

          <button type="button" onClick={goNext} className="bottom_btn">
            Next
          </button>
        </section>
      ))}
    </main>
  );
};

const MemoiseBusinessType = memo(BusinessType);
export default MemoiseBusinessType;
