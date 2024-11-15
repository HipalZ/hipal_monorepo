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
  );
};

const MemoBusinessControl = memo(BusinessControl);

export default MemoBusinessControl;
