import { IphoneCategory } from "@/components/atom/svgtheme";
import useBusinessCtrl, { type MenuLayout } from "@/components/store/useBusinessCtrl";
import { memo, useCallback, useEffect, useState } from "react";

const MenuPage = () => {
  const { step, setStep, menuLayout, setMenuLayout, primaryColor, secondaryColor } = useBusinessCtrl((s) => ({
    step: s.step,
    setStep: s.setStep,
    menuLayout: s.menuLayout,
    setMenuLayout: s.setMenuLayout,
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
  }));
  const [dimensions, setDimensions] = useState({ width: 350, height: 400 });

  const updateDimensions = () => {
    if (window.innerWidth >= 1028) {
      setDimensions({ width: 450, height: 600 });
    } else {
      setDimensions({ width: 350, height: 400 });
    }
  };
  const handleLayoutSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMenuLayout(event.target.value as MenuLayout);
  };

  const handleNextStep = useCallback(() => {
    if (menuLayout) {
      setStep(step + 1);
    }
  }, [menuLayout, step]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <section className="explore_page_container">
      <center className="mt-4">
        <IphoneCategory primary={primaryColor} secondary={secondaryColor} category={2} width={dimensions.width} height={dimensions.height} />
      </center>

      <section className="space-y-4 explore_page_selection h-[50vh]">
        <label className="p-4 mx-4 bg-[#F4F4F4] rounded-xl">
          <article className="flex items-center space-x-2">
            <input
              type="radio"
              value="MAIN_CATEGORY"
              checked={menuLayout === "MAIN_CATEGORY"}
              onChange={handleLayoutSelection}
              className="form-radio radio radio-black"
            />
            <span>Main Category</span>
          </article>
          <small className="opacity-50">
            Perfect for menus under 50 dishes, easily navigable with a top-tier category followed by individual items.
          </small>
        </label>
        <label className="p-4 mx-4 rounded-xl bg-[#F4F4F4]">
          <article className="flex items-center space-x-2">
            <input
              type="radio"
              value="MAIN_AND_SUB_CATEGORY"
              checked={menuLayout === "MAIN_AND_SUB_CATEGORY"}
              onChange={handleLayoutSelection}
              className="form-radio radio radio-black"
            />
            <span>With Main & Sub-Category</span>
          </article>
          <small className="opacity-50">
            Tailored for menus exceeding 50 dishes, seamlessly categorized into a top-tier for efficient exploration.
          </small>
        </label>
      </section>
      <button
        type="button"
        className={`bottom_btn mt-4 px-4 py-2 rounded ${
          !menuLayout ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-500 text-white cursor-pointer"
        }`}
        onClick={handleNextStep}
        disabled={!menuLayout}
      >
        Save & Next
      </button>
    </section>
  );
};
const MemoiseMenuPage = memo(MenuPage);
export default MemoiseMenuPage;
