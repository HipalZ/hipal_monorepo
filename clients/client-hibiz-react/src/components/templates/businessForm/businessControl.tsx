import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import Img from "@/assets/background.png";
import { memo, useCallback } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { businessCtrlServices } from "./businessCtrlStore";
import useBusinessData from "@/components/store/useBusinessData";
import { cn } from "@hi/common";
import { PiSealWarningFill } from "react-icons/pi";

const BusinessControl = () => {
  const setStep = useBusinessCtrl((state) => state.setStep);
  const businessData = useBusinessData((state) => state.businessData);
  const {
    setPrimaryColor,
    setSecondaryColor,
    setExploreLayout,
    setMenuLayout,
    setLayoutFlowEnabled,
  } = useBusinessCtrl((s) => ({
    setPrimaryColor: s.setPrimaryColor,
    setSecondaryColor: s.setSecondaryColor,
    setExploreLayout: s.setExploreLayout,
    setMenuLayout: s.setMenuLayout,
    setLayoutFlowEnabled: s.setLayoutFlowEnabled,
  }));

  const navigate = useNavigate();
  const goToNextStep = useCallback(
    (step: number) => {
      setStep(step);
      if (step === 1) {
        setPrimaryColor(businessData?.primaryColor || "#000000");
        setSecondaryColor(businessData?.secondaryColor || "#ffffff");
        setExploreLayout(businessData?.exploreLayout || "BUTTER");
        setMenuLayout(businessData?.menuLayout || "MAIN_AND_SUB_CATEGORY");
        setLayoutFlowEnabled(businessData?.themeApplied || false);
      }
    },
    [
      businessData,
      setStep,
      setPrimaryColor,
      setSecondaryColor,
      setExploreLayout,
      setMenuLayout,
    ],
  );

  const navigateService = useCallback(
    (service: string) => {
      navigate(`/app/business/${businessData?._id}/${service}`);
    },
    [navigate, businessData],
  );

  return (
    <>
      <article className="card-background">
        <figcaption className="card">
          <h4>Set the theme</h4>
          <small>Set your layout & themes</small>
          <button
            type="button"
            onClick={() => goToNextStep(1)}
            className="relative w-16 px-4 py-1 mt-2 text-white bg-black rounded-3xl"
          >
            Set
            <div className="inset-0 shine2" />
          </button>
        </figcaption>
        <figcaption className="big-card">
          <h3>Set the theme</h3>
          <h4>Set your layout & themes</h4>
          <button
            type="button"
            onClick={() => goToNextStep(1)}
            className="relative w-24 px-6 py-1 mt-6 text-xl text-white bg-black rounded-3xl"
          >
            Set
            <div className="inset-0 shine2" />
          </button>
        </figcaption>
        <img className="image-class" src={Img} alt="Avatar" />
      </article>
      <section className="px-6 pt-6 text-xl font-semibold pb-[5rem]">
        <h3>Your Features</h3>
        {!businessData?.themeApplied && (
          <center className="px-4 -mx-6 text-sm py-2 mt-2 text-[#da0606] bg-[#da060630] flex items-center justify-center">
            <PiSealWarningFill size={32} className="mr-2" />
            Unlock all services after setting the Theme
          </center>
        )}
        <div className="business_control_services_grid">
          {businessCtrlServices.map((service) => (
            <button
              type="button"
              key={service.Title}
              className={cn("business_control_services text-left", {
                "bg-gray-400 cursor-not-allowed":
                  service.navigation &&
                  !businessData?.themeApplied &&
                  service.navigation !== "businessControl",
              })}
              onClick={() =>
                businessData?.themeApplied ||
                service.navigation === "businessControl"
                  ? navigateService(service?.navigation ?? "")
                  : null
              }
            >
              <figure>
                <img
                  width={60}
                  height={60}
                  src={service.image}
                  alt={service.Title}
                  className={cn({
                    "opacity-50":
                      !businessData?.themeApplied &&
                      service.navigation !== "businessControl",
                  })}
                />
              </figure>
              <figcaption className="ml-4">
                <h4
                  className={cn("text-lg font-medium", {
                    "text-gray-500":
                      !businessData?.themeApplied &&
                      service.navigation !== "businessControl",
                    "text-black":
                      businessData?.themeApplied ||
                      service.navigation === "businessControl",
                  })}
                >
                  {service.Title}
                </h4>
                {service.navigation && (
                  <FaArrowRight
                    className={cn("absolute right-4 top-4 -rotate-45", {
                      "text-gray-500":
                        !businessData?.themeApplied &&
                        service.navigation !== "businessControl",
                      "text-black":
                        businessData?.themeApplied ||
                        service.navigation === "businessControl",
                    })}
                  />
                )}
                <div className="flex flex-wrap">
                  {service.tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-4 py-2 m-1 text-xs text-[#6F649B] bg-[#F2F1F6] rounded-full"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </figcaption>
            </button>
          ))}
        </div>
      </section>
    </>
  );
};

const MemoBusinessControl = memo(BusinessControl);

export default MemoBusinessControl;
