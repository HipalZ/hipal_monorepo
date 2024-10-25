import { useCallback, lazy, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import Header from "@/components/molecules/header";
import SectionWithLogo from "@/components/atom/sectionWithLogo";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";
import Themesandlayout from "@/components/templates/businessForm/themesandlayout";

// Lazy load the components
const ExplorePage = lazy(
  () => import("@/components/templates/businessForm/explorePage"),
);
const MenuPage = lazy(() => import("@/components/templates/businessForm/menu"));
const Congratulation = lazy(
  () => import("@/components/templates/signupPage/congratulation"),
);
const BusinessControl = lazy(
  () => import("@/components/templates/businessForm/businessControl"),
);
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
  }, [businessId, step, themeApplied, layoutFlowEnabled]);

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

      {step === 0 && <BusinessControl />}

      {themeApplied && layoutFlowEnabled && step === 1 ? (
        <Themesandlayout />
      ) : (
        <>
          {step === 1 && <ExplorePage />}
          {step === 2 && <MenuPage />}
          {step === 3 && <Setting />}
          {step === 4 && (
            <SectionWithLogo>
              <Congratulation />
            </SectionWithLogo>
          )}
        </>
      )}
    </main>
  );
};

const MemoizedMainBusinessPage = memo(MainBusinessPage);

export default MemoizedMainBusinessPage;
