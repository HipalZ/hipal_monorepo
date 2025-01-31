import { useCallback, lazy, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import Header from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";

const Setting = lazy(
  () => import("@/components/templates/businessForm/setting"),
);

const MainBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const { step, setStep, layoutFlowEnabled } = useBusinessCtrl((s) => ({
    step: s.step,
    setStep: s.setStep,
    layoutFlowEnabled: s.layoutFlowEnabled,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const themeApplied = useBusinessData((s) => s.businessData?.themeApplied);

  const handleBack = useCallback(() => {
    if (themeApplied && layoutFlowEnabled && step === 1) {
      setStep(0);
    } else if (step === 0) {
      navigate(`/app/business/${businessId}`);
    } else {
      setStep(step - 1);
    }
  }, [businessId, step, themeApplied, layoutFlowEnabled, setStep, navigate]);

  const handleTitle = useCallback(() => {
    if (themeApplied && layoutFlowEnabled && step === 1) {
      return "Theme & Layout";
    }

    const titles = [
      "Business Control",
      "Explore Page",
      "Menu Page",
      "Settings",
    ];
    return titles[step] || "";
  }, [step, themeApplied, layoutFlowEnabled]);

  return (
    <main className="business_control_background">
      <div className="linear_gradient_background">
        <Header
          title={handleTitle()}
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
      </div>
      <Setting />
    </main>
  );
};

const MemoizedMainBusinessPage = memo(MainBusinessPage);

export default MemoizedMainBusinessPage;
