import Hi from '@/assets/svg/hi.svg';
import MiddlePopUp from '@/components/atom/middlePopUp';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import useWhatsapp, { Step, TemplateSteps } from '@/components/store/useWhatsapp';
import { useWhatsappTempStore } from '@/components/store/useWhatsappTempStore';
import { lazy, memo, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// ─── WHATSAPP UNDER-REVIEW GATE ─────────────────────────────────────────────
// Mirrors the flag in the business-side entry. Flip back to `false` once Meta
// clears the WhatsApp Business Account.
const WHATSAPP_UNDER_REVIEW = false;

const WhatzappPayment = lazy(() => import('@/components/templates/whatsappTemplates/whatzappPayment'));
const CreateEditTemplate = lazy(() => import('@/components/templates/whatsappTemplates/createEditTemplate'));
const NotifyAndWallet = lazy(() => import('@/components/templates/whatsappTemplates/notifyAndWallet'));
const WalletHistory = lazy(() => import('@/components/templates/whatsappTemplates/walletHistory'));
const WhatzappDashboard = lazy(() => import('@/components/templates/whatsappTemplates/whatzappDashboard'));
const WhyNotEditPopup = lazy(() => import('@/components/templates/whatsappTemplates/WhyNotEditPopup'));

const MemoWhatzapp = () => {
  const step = useWhatsapp((s) => s.step);
  const setStep = useWhatsapp((s) => s.setStep);
  const notEditPopup = useWhatsapp((s) => s.notEditPopup);
  const setNotEditPopup = useWhatsapp((s) => s.setNotEditPopup);
  const templateSteps = useWhatsapp((s) => s.templateSteps);
  const setTemplateSteps = useWhatsapp((s) => s.setTemplateSteps);
  const businessData = useBusinessData((s) => s.businessData);
  const setOpenAnalytics = useWhatsappTempStore((s) => s.setOpenAnalytics);
  const openAnalytics = useWhatsappTempStore((s) => s.openAnalytics);
  const setCreateEditFlow = useWhatsappTempStore((s) => s.setCreateEditFlow);
  const createEditFlow = useWhatsappTempStore((s) => s.createEditFlow);
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
          } else {
            navigate(`/app/hotel/${businessData?._id}/`);
          }
          break;
        default:
          navigate(`/app/hotel/${businessData?._id}/`);
          break;
      }
    }
  }, [setStep, step, templateSteps, setTemplateSteps, navigate, businessData, openAnalytics, setOpenAnalytics, createEditFlow, setCreateEditFlow]);

  if (WHATSAPP_UNDER_REVIEW) {
    return (
      <section>
        <div className="whatzapp_gradient_background absolute top-20 z-50 w-full rounded-lg">
          <MemoizedHeader title="WhatzApp" leftIcon={<FaArrowLeft />} rightImage={Hi} onBack={() => navigate(-1)} headingColor="white" />
        </div>
        <MiddlePopUp show onlyPopUp>
          <div className="w-[min(420px,90vw)] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-white">
              <FiInfo className="text-2xl" />
              <h3 className="text-lg font-semibold">Application Update In Progress</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm leading-relaxed text-gray-700">Your WhatsApp Business application is currently under review with Meta.</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                To continue using WhatsApp services, please reach out to your administrator to upgrade your application for security and policy
                compliance.
              </p>
              <p className="mt-4 text-sm font-medium text-gray-900">Thank you for your patience and cooperation.</p>
              <p className="mt-3 text-xs italic text-gray-500">— Hipalz Team</p>
            </div>
            <div className="flex items-center justify-end border-t bg-gray-50 px-6 py-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Got it
              </button>
            </div>
          </div>
        </MiddlePopUp>
      </section>
    );
  }

  return (
    <section>
      <div>
        {/* Header */}
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
    </section>
  );
};

const Whatzapp = memo(MemoWhatzapp);
export default Whatzapp;
