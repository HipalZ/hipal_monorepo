import Hi from '@/assets/svg/hi.svg';
import MiddlePopUp from '@/components/atom/middlePopUp';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { Step, TemplateSteps } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import WhatsAppRegistration from '@/components/templates/whatsappTemplates/mainForm';
import WhatsAppLoader from '@/components/templates/whatsappTemplates/whatsappLoader';
import { useCheckRegistration } from '@/hooks/useTemplates';
import { lazy, memo, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PendingStatusStep = lazy(() => import('@/components/templates/whatsappTemplates/pendingStatus'));
const WhatzappPayment = lazy(() => import('@/components/templates/whatsappTemplates/whatzappPayment'));
const CreateEditTemplate = lazy(() => import('@/components/templates/whatsappTemplates/createEditTemplate'));
const NotifyAndWallet = lazy(() => import('@/components/templates/whatsappTemplates/notifyAndWallet'));
const WalletHistory = lazy(() => import('@/components/templates/whatsappTemplates/walletHistory'));
const WhatzappDashboard = lazy(() => import('@/components/templates/whatsappTemplates/whatzappDashboard'));
const WhyNotEditPopup = lazy(() => import('@/components/templates/whatsappTemplates/WhyNotEditPopup'));

const MemoWhatzapp = () => {
  const { isLoading } = useCheckRegistration();
  const step = useWhatsapp((s) => s.step);
  const setStep = useWhatsapp((s) => s.setStep);
  const notEditPopup = useWhatsapp((s) => s.notEditPopup);
  const setNotEditPopup = useWhatsapp((s) => s.setNotEditPopup);
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const whatzappFormEnabled = useWhatsapp((s) => s.whatzappFormEnabled);
  const businessData = useBusinessData((s) => s.businessData);
  const whatzappStatus = useWhatsappTempStore((s) => s.whatzappStatus);
  const setOpenAnalytics = useWhatsappTempStore((s) => s.setOpenAnalytics);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const setCreateEditFlow = useWhatsappTempStore((s) => s.setCreateEditFlow);
  const createEditFlow = useWhatsappTempStore((s) => s.createEditFlow);
  const openBot = useWhatsapp((s) => s.openBot);

  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (templateSteps !== TemplateSteps.NONE) {
      switch (templateSteps) {
        case TemplateSteps.MODIFY:
        case TemplateSteps.CREATE_EDIT:
          if (step === Step.TRANSACTIONS || step === Step.WALLET_HISTORY || step === Step.CHATS) {
            setTemplateSteps(TemplateSteps.CREATE_EDIT);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.NONE);
            setStep(Step.SETUP);
          }
          break;
        case TemplateSteps.SHOW_OPTIONS:
          if (step === Step.TRANSACTIONS || step === Step.WALLET_HISTORY) {
            setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.CREATE_EDIT);
          }
          break;
        case TemplateSteps.SEND:
          if (step === Step.TRANSACTIONS || step === Step.WALLET_HISTORY) {
            setTemplateSteps(TemplateSteps.SEND);
            setStep(Step.CREATE_EDIT);
          } else {
            setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
          }
          break;
        default:
          setTemplateSteps(TemplateSteps.NONE);
          setStep(Step.SETUP);
          break;
      }
    } else {
      switch (step) {
        case Step.WALLET_HISTORY:
        case Step.CREATE_EDIT:
        case Step.TRANSACTIONS:
          setStep(Step.SETUP);
          break;
        case Step.SETUP:
          if (openAnalytics || createEditFlow) {
            setOpenAnalytics(false);
            setCreateEditFlow(false);
            console.log('createEditFlow', createEditFlow);
          } else {
            navigate(`/app/business/${businessData?._id}/`);
          }
          break;
        default:
          navigate(`/app/business/${businessData?._id}/`);
          break;
      }
    }
  }, [
    setStep,
    step,
    templateSteps,
    setTemplateSteps,
    navigate,
    businessData,
    openAnalytics,
    setOpenAnalytics,
    createEditFlow,
    setCreateEditFlow,
    navigate,
  ]);

  return (
    <>
      {isLoading ? (
        <WhatsAppLoader />
      ) : (
        <main className="lg:max-w-full">
          {!whatzappFormEnabled && <WhatsAppRegistration />}
          {whatzappFormEnabled && !whatzappStatus && (
            <>
              <MemoizedHeader title="WhatzApp" leftIcon={<FaArrowLeft />} onBack={handleBack} headingColor="white" />
              <PendingStatusStep />
            </>
          )}
          {whatzappFormEnabled && whatzappStatus && (
            <div>
              {/* Header */}
              {!openBot && (
                <div className="whatzapp_gradient_background absolute top-20 z-50 w-full rounded-lg">
                  <MemoizedHeader
                    title="WhatzApp"
                    leftIcon={<FaArrowLeft />}
                    rightImage={Hi}
                    rightButton={<NotifyAndWallet />}
                    onBack={handleBack}
                    headingColor="white"
                  />
                </div>
              )}
              {/* Banner */}
              {step === Step.SETUP && <WhatzappDashboard />}
              {step === Step.WALLET_HISTORY && <WalletHistory />}
              {step === Step.CREATE_EDIT && <CreateEditTemplate />}
              {step === Step.TRANSACTIONS && <WhatzappPayment />}
              {notEditPopup && (
                <MiddlePopUp show={notEditPopup} onClose={() => setNotEditPopup(false)}>
                  <WhyNotEditPopup />
                </MiddlePopUp>
              )}
            </div>
          )}
        </main>
      )}
    </>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
