import MiddlePopUp from "@/components/atom/middlePopUp";
import useWhatsapp, {
  Step,
  TemplateSteps,
} from "@/components/store/useWhatsapp";
import { memo, useCallback } from "react";
import { FiAlertTriangle, FiEdit3, FiSend } from "react-icons/fi";

const MemoOpenConfirmEdit = () => {
  const {
    isOpenEditModal,
    setIsOpenEditModal,
    setStep,
    setTemplateSteps,
    setShowSuccessPopup,
  } = useWhatsapp((s) => ({
    isOpenEditModal: s.isOpenEditModal,
    setIsOpenEditModal: s.setIsOpenEditModal,
    setStep: s.setStep,
    setTemplateSteps: s.setTemplateSteps,
    setShowSuccessPopup: s.setShowSuccessPopup,
  }));

  const handleEdit = useCallback(() => {
    setStep(Step.CREATE_EDIT);
    setTemplateSteps(TemplateSteps.CREATE_EDIT);
    setShowSuccessPopup(false);
    setIsOpenEditModal(false);
  }, [setStep, setTemplateSteps, setShowSuccessPopup, setIsOpenEditModal]);

  const handleCampaign = useCallback(() => {
    setIsOpenEditModal(false);
    setTemplateSteps(TemplateSteps.SHOW_OPTIONS);
    setStep(Step.CREATE_EDIT);
  }, [setIsOpenEditModal, setTemplateSteps, setStep]);

  const handleCancel = useCallback(() => {
    setIsOpenEditModal(false);
  }, [setIsOpenEditModal]);

  return (
    <>
      {isOpenEditModal && (
        <MiddlePopUp onlyPopUp show>
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <header className="mb-6 text-center">
              <FiAlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Template Action
              </h2>
            </header>
            <main className="mb-6">
              <p className="mb-4 text-center text-gray-600">
                What would you like to do with this template?
              </p>
              <article className="flex flex-col space-y-4">
                <button
                  type="button"
                  className="flex items-center justify-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                  onClick={handleEdit}
                >
                  <FiEdit3 className="w-5 h-5 mr-2" />
                  Edit Template
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-6 py-3 font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  onClick={handleCampaign}
                >
                  <FiSend className="w-5 h-5 mr-2" />
                  Start Campaign
                </button>
              </article>
            </main>
            <footer className="flex justify-center">
              <button
                type="button"
                className="px-6 py-2 font-medium text-white transition-colors duration-200 bg-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </footer>
          </div>
        </MiddlePopUp>
      )}
    </>
  );
};

const OpenConfirmEdit = memo(MemoOpenConfirmEdit);
export default OpenConfirmEdit;
