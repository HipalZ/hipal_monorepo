import { memo, useCallback, useState } from "react";
import MemoizedHeader from "@/components/molecules/header";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import MiddlePopUp from "@/components/atom/middlePopUp";
import PosSetupModal from "@/components/templates/posSetupModal";
import CodeVerificationModal from "@/components/templates/posSetupModal/codeVerificationModal.tsx";
import PosConfigCard from "@/components/templates/posSetupModal/posConfigCard.tsx";
import PopUp from "@/components/atom/popUp/index.tsx";
import { FileText } from "lucide-react";
import { useGetPosConfig } from "@/hooks/usePosHook.ts";

const MemoPOS = () => {
  const navigate = useNavigate();
  const businessId = useParams<{ businessId: string }>().businessId;
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const { posConfig, isLoading, refetch } = useGetPosConfig(
    businessId as string,
  );

  const handleConfigurePos = useCallback(() => {
    setShowSetupModal(true);
  }, []);

  const handleEditConfig = useCallback(() => {
    setShowCodeModal(true);
  }, []);

  const handleCodeVerified = useCallback(() => {
    setShowCodeModal(false);
    setShowSetupModal(true);
  }, []);

  const handleSetupComplete = useCallback(() => {
    setShowSetupModal(false);
    refetch();
  }, []);

  const goBack = useCallback(() => {
    return navigate(`/app/business/${businessId}`);
  }, [businessId, navigate]);

  return (
    <main className="min-h-screen">
      <header className="linear_gradient_background">
        <MemoizedHeader title="POS" onBack={goBack} />
      </header>

      {/* POS Config Section */}
      <section className="p-4 md:p-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : posConfig ? (
          <>
            <PosConfigCard config={posConfig} onEdit={handleEditConfig} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No POS Configuration Found
              </h3>
              <p className="text-gray-600 mb-6">
                Please apply POS for further features
              </p>
              <button
                type="button"
                onClick={handleConfigurePos}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Configure POS
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Setup Modal */}
      {showSetupModal && (
        <PopUp
          show={showSetupModal}
          rightTopBack
          onClose={() => setShowSetupModal(false)}
          width="w-[30rem]"
        >
          <PosSetupModal
            onComplete={handleSetupComplete}
            onClose={() => setShowSetupModal(false)}
            existingConfig={posConfig}
          />
        </PopUp>
      )}

      {/* Code Verification Modal */}
      {showCodeModal && (
        <MiddlePopUp
          show={showCodeModal}
          onlyPopUp
          onClose={() => setShowCodeModal(false)}
        >
          <CodeVerificationModal
            onVerified={handleCodeVerified}
            onClose={() => setShowCodeModal(false)}
          />
        </MiddlePopUp>
      )}
    </main>
  );
};

const POS = memo(MemoPOS);
export default POS;
