import { FaArrowLeft } from "react-icons/fa";
import { Suspense, lazy, memo, useCallback, type FormEvent } from "react";
import { usePaymentHelpers } from "./paymentHelper";
import { useWhatsappTempStore } from "@/components/store/useWhatsappTempStore";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import MemoizedHeader from "@/components/molecules/header";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import PendingStatusStep from "./pendingStatus";

const IntroductionStep = lazy(() => import("./introductionStep"));
const PhoneDisplay = lazy(() => import("./phoneDisplay"));
const PhoneAndDisplayStep = lazy(() => import("./phoneAndDisplay"));

function MemoWhatsAppRegistration() {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { handleCreateOrder } = usePaymentHelpers();
  const navigate = useNavigate();
  const { step, setStep, isLoading } = useWhatsappTempStore((s) => ({
    step: s.step,
    setStep: s.setStep,
    isLoading: s.isLoading,
  }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleCreateOrder();
  };

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate(`/app/business/${businessId}`);
    }
  }, [step, setStep, navigate, businessId]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <main className="relative">
        <nav className="sticky top-0 flex items-center gap-4 mb-4">
          <div className="z-50 w-full rounded-lg whatzapp_gradient_background">
            <MemoizedHeader
              title="WhatzApp"
              leftIcon={<FaArrowLeft />}
              onBack={handleBack}
              headingColor="white"
            />
          </div>
        </nav>
        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md"
          >
            {isLoading ? <LoadingSpinner /> : null}
            {step === 0 && <IntroductionStep />}
            {step === 1 && (
              <div className="grid items-center md:grid-cols-2">
                <PhoneAndDisplayStep />
                <PhoneDisplay />
              </div>
            )}
            {step === 2 && <PendingStatusStep />}
          </form>
        </div>
      </main>
    </Suspense>
  );
}

const WhatsAppRegistration = memo(MemoWhatsAppRegistration);
export default WhatsAppRegistration;
