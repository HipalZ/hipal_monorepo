import { IphoneCategory, IphoneExplore } from "@/components/atom/svgtheme";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { memo } from "react";
import { BsMenuButtonWideFill } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { IoIosColorPalette } from "react-icons/io";
import { LuLayoutDashboard } from "react-icons/lu";

const preDefinedOptions = [
  {
    id: 1,
    text: "Change Layout",
    description: "Customize the landing (Explore page) page design",
    action: <LuLayoutDashboard size={35} />,
  },
  {
    id: 2,
    text: "Change Menu Layout",
    description: "Customize the Menu (Explore page) page design",
    action: <BsMenuButtonWideFill size={35} />,
  },
  {
    id: 3,
    text: "Change Themes / color",
    description: "Customize the landing (Explore page) page design",
    action: <IoIosColorPalette size={35} />,
  },
];

const MemoThemesandlayout = () => {
  const {
    primaryColor,
    secondaryColor,
    setStep,
    setLayoutFlowEnabled,
    layoutFlowEnabled,
  } = useBusinessCtrl((s) => ({
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    layoutFlowEnabled: s.layoutFlowEnabled,
    setLayoutFlowEnabled: s.setLayoutFlowEnabled,
    setStep: s.setStep,
  }));

  const handleOptionClick = (id: number) => {
    if (id === 1) {
      setLayoutFlowEnabled(!layoutFlowEnabled);
    }
    setStep(id);
  };

  return (
    <section className="lg:flex lg:justify-between lg:items-center lg:mt-20">
      <section className="explore_page_container">
        <article className="flex justify-center gap-4 m-4">
          <IphoneExplore
            key={`${primaryColor}${secondaryColor}1`}
            width={200}
            height={400}
            primary={primaryColor}
            secondary={secondaryColor}
          />
          <IphoneCategory
            key={`${primaryColor}${secondaryColor}2`}
            width={200}
            height={400}
            primary={primaryColor}
            secondary={secondaryColor}
          />
        </article>
      </section>
      <section className="space-y-4 pb-[10rem] lg:pb-0">
        {preDefinedOptions.map((option) => (
          <article
            key={option.id}
            className="mx-6 border border-1 border-[#000] rounded-2xl p-4 flex items-center justify-between lg:w-[30rem]"
            onClick={() => handleOptionClick(option.id)}
            onKeyDown={() => handleOptionClick(option.id)}
          >
            <div className="w-[15rem]">
              <h1 className="text-black">{option.text}</h1>
              <h6 className="mb-2 text-sm text-black opacity-50">
                {option.description}
              </h6>
              <button
                type="button"
                className="flex items-center justify-around px-2 py-1 space-x-2 text-white bg-black rounded-2xl"
              >
                <h6 className="text-sm">Change </h6>
                <span>
                  <FaArrowRight size={10} />
                </span>
              </button>
            </div>
            <span className="bg-[#E0CEF7] p-3 rounded-full">
              {option.action}
            </span>
          </article>
        ))}
      </section>
    </section>
  );
};

const Themesandlayout = memo(MemoThemesandlayout);
export default Themesandlayout;
