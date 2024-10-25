import Header from "@/components/molecules/header";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import BusinessType from "@/components/templates/addBusinessForm/businessType";
import OutletType from "@/components/templates/addBusinessForm/outletTypeForm";
import AddName from "@/components/templates/addBusinessForm/addName";
import Congratulation from "@/components/templates/signupPage/congratulation";
import SectionWithLogo from "@/components/atom/sectionWithLogo";

const AddBusinessForm = () => {
  const navigate = useNavigate();
  const { step, setStep } = useBusinessCtrl();

  const handleBack = useCallback(() => {
    if (step === 0) {
      navigate("/app/business");
    } else {
      setStep(step - 1);
    }
  }, [navigate, step, setStep]);

  const handleTitle = useCallback(() => {
    const titles = ["Business Type", "Outlet Type", "outlet Name"];
    return titles[step] || "";
  }, [step]);

  const subHeading = useCallback(() => {
    const titles = [
      "What is your business type",
      "Choose the outlet type ",
      "Choose the outlet name ",
    ];
    return titles[step] || "";
  }, [step]);

  return (
    <section>
      {step === 3 && (
        <SectionWithLogo>
          <Congratulation />
        </SectionWithLogo>
      )}
      <main>
        {step !== 3 && (
          <>
            <div className="linear_gradient_background">
              <Header
                title={handleTitle()}
                onBack={handleBack}
                leftIcon={<FaArrowLeft />}
                rightImage={Hi}
                isIconBusinessShow={false}
              />
            </div>

            <header className="flex items-center justify-between p-4 ">
              <h3 className="text-xl font-semibold">{subHeading()}</h3>
              <h3 className="text-xl font-semibold">{step + 1} / 3</h3>
            </header>
          </>
        )}

        {step === 0 && <BusinessType />}

        {step === 1 && <OutletType />}

        {step === 2 && <AddName />}
      </main>
    </section>
  );
};
const MemoizedAddBusinessForm = memo(AddBusinessForm);
export default MemoizedAddBusinessForm;
