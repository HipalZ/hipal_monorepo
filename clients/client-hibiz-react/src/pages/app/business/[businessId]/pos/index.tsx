import LoadingSpinner from '@/components/atom/loadingSpinner';
import MiddlePopUp from '@/components/atom/middlePopUp';
import PopUp from '@/components/atom/popUp/index.tsx';
import MemoizedHeader from '@/components/molecules/header';
import { useBusinessData } from '@/components/store/useBusinessData';
import PosSetupModal from '@/components/templates/posSetupModal';
import CodeVerificationModal from '@/components/templates/posSetupModal/codeVerificationModal.tsx';
import PosConfigCard from '@/components/templates/posSetupModal/posConfigCard.tsx';
import PosWithMenuCard from '@/components/templates/posSetupModal/posWithMenuCard';
import { useGetPosConfig } from '@/hooks/usePosHook.ts';
import { FileText } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const MemoPOS = () => {
  const navigate = useNavigate();
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const businessId = useParams<{ businessId: string }>().businessId;
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const { posConfig, isLoading, refetch } = useGetPosConfig(businessId as string);
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
  }, [refetch]);

  const goBack = useCallback(() => {
    return navigate(`/app/business/${businessId}`);
  }, [businessId, navigate]);

  const hasPosWithMenuOnly = outletInfo?.posWithOnlyMenu;

  return (
    <main className="min-h-screen">
      <header className="linear_gradient_background">
        <MemoizedHeader title="POS" onBack={goBack} />
      </header>
      {/* Config Section */}
      <section className="p-4 md:p-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : !hasPosWithMenuOnly ? (
          posConfig ? (
            <PosConfigCard config={posConfig} onEdit={handleEditConfig} />
          ) : (
            <div className="py-12 text-center">
              <div className="mb-6">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No POS Configuration Found</h3>
                <p className="mb-6 text-gray-600">Please apply POS for further features</p>
                <button
                  type="button"
                  onClick={handleConfigurePos}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Configure POS
                </button>
              </div>
            </div>
          )
        ) : (
          <PosWithMenuCard config={posConfig} onEdit={handleEditConfig} />
        )}
      </section>

      {/* Setup Modal */}
      {showSetupModal && (
        <PopUp show={showSetupModal} rightTopBack onClose={() => setShowSetupModal(false)} width="w-[30rem]">
          <PosSetupModal onComplete={handleSetupComplete} onClose={() => setShowSetupModal(false)} existingConfig={posConfig} />
        </PopUp>
      )}

      {/* Code Verification Modal */}
      {showCodeModal && (
        <MiddlePopUp show={showCodeModal} onlyPopUp onClose={() => setShowCodeModal(false)}>
          <CodeVerificationModal onVerified={handleCodeVerified} onClose={() => setShowCodeModal(false)} />
        </MiddlePopUp>
      )}
    </main>
  );
};

const POS = memo(MemoPOS);
export default POS;
