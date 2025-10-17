import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { useGetBill } from '@/components/hooks/useBill';
import { useHomeNavigation } from '@/components/hooks/useNavigateHome.ts';
import useBusinessData from '@/components/store/useBusinessData';
import { useOrderStore } from '@/components/store/useOrderData';
import type { IBillData } from '@/components/types/hiClientzData.ts';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useScreenSize } from '@/hooks/useScreenSize';
import { HomeIcon } from 'lucide-react';
import { lazy, memo, useCallback, useMemo } from 'react';
import { MdTableBar } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import CommonBottomButton from '../bottomButton';
import BottomPopUp from '../universalPopup';
import BillItemsList from './BillItemsList.tsx';

// Lazy imports
const QrCodePreview = lazy(() => import('./qrCode'));
const NormalSettle = lazy(() => import('./normalsettle'));
const AddCoinz = lazy(() => import('./addCoinz'));
const BillOptions = lazy(() => import('./BillOptions'));
const EBill = lazy(() => import('./ebill.tsx'));
const PasswordModal = lazy(() => import('../cartItem/PasswordModal.tsx'));

// Component imports
import ActionHistory from './bill/ActionHistory';
import BillHeader from './bill/BillHeader';
import BillSummary from './bill/BillSummary';
import LazyWrapper from './bill/LazyWrapper';
import PhoneActions from './bill/PhoneActions';
import SplitBillGrid from './bill/SplitBillGrid';

// Hook imports - Updated to use variant-aware hooks
import { useRemoveCoinz } from '@/components/hooks/api/useCoinz.ts';
import { useRemoveCoupon } from '@/components/hooks/api/useCoupon.ts';
import { useRemoveServiceCharge } from '@/components/hooks/api/useServiceCharge.ts';
import { useReprintBill } from '@/components/hooks/api/useSettle.ts';
import { useBillActions } from '@/components/hooks/useBillActions';
import { usePhoneActions } from '@/components/hooks/usePhoneActions';
import { Badge } from '@/components/ui/badge.tsx';
import { cn } from '@/lib/utils.ts';
import toast from 'react-hot-toast';

const MemoGetBill = () => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const openAddCoinz = useOrderStore((s) => s.openAddCoinz);
  const setOpenAddCoinz = useOrderStore((s) => s.setOpenAddCoinz);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const showMoreOption = useOrderStore((s) => s.showMoreOption);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);
  const normalSettle = useOrderStore((s) => s.normalSettle);
  const setNormalSettle = useOrderStore((s) => s.setNormalSettle);
  const showEBill = useOrderStore((s) => s.showEBill);
  const setShowEBill = useOrderStore((s) => s.setShowEBill);
  const showqr = useOrderStore((s) => s.showqr);
  const setShowqr = useOrderStore((s) => s.setShowqr);
  const screenSize = useScreenSize();
  const { goHome } = useHomeNavigation();
  const existingLoyalty = useBusinessData((s) => s.existingLoyalty);
  const setActiveModal = useOrderStore((s) => s.setActiveModal);
  const isExpanded = useOrderStore((s) => s.isExpanded);
  const setIsExpanded = useOrderStore((s) => s.setIsExpanded);
  const selectedBill = useOrderStore((s) => s.selectedBill);
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  const { isLoading, data: billData } = useGetBill();

  // Memoized values
  const isSplitBill = useMemo(() => Array.isArray(billData), [billData]);

  const currentBill = useMemo(() => {
    const selectedBillId = selectedBill?.variantId;
    if (Array.isArray(billData)) {
      return billData.find((b) => b.variantId === selectedBillId) ?? null;
    }
    return billData as IBillData;
  }, [billData, selectedBill]);

  const allItems = useMemo(() => {
    if (!currentBill?.billItems) return [];
    return currentBill.billItems.flatMap((billGroup) => billGroup.items);
  }, [currentBill?.billItems]);

  // Variant-aware hooks - Pass currentBill to get variant support
  const { removingCoinzLoader } = useRemoveCoinz(currentBill);
  const { removingCouponLoader } = useRemoveCoupon(currentBill);
  const { removingServiceChargeLoader } = useRemoveServiceCharge(currentBill);
  const { isPrinting, reprintBill } = useReprintBill(currentBill);

  // Custom hooks
  const { qrBillId, isPending, mutate, removeClaimedCoins, removeCouponHandler, openServiceChargeModal, clickOnKey, toggleQr } =
    useBillActions(currentBill);

  const { isModalOpen, isPhoneVerified, copyTick, handleProtectedAction, handlePasswordVerify, handleModalClose } = usePhoneActions(currentBill);

  // Handlers
  const handleSelectBill = useCallback((bill: IBillData) => {
    setSelectedBill(bill);
  }, []);

  const handleBackToGrid = useCallback(() => {
    setSelectedBill(null);
  }, []);

  const reprintBillHandler = useCallback(() => {
    reprintBill({
      businessId: businessId || '',
      tableName: selectedTable?.name || '',
    });
  }, [reprintBill, businessId, selectedTable?.name]);

  const closeMoreOptions = useCallback(() => {
    setShowMoreOption(false);
    setActiveModal('options');
  }, [setShowMoreOption, setActiveModal]);

  const openNormalSettle = useCallback(() => {
    if (currentBill?.isPaid) {
      return toast.error('This bill is already settled.');
    }
    setNormalSettle(true);
  }, [setNormalSettle, currentBill]);

  const closeNormalSettle = useCallback(() => {
    setNormalSettle(false);
  }, [setNormalSettle]);

  const triggerAddCoinz = useCallback(() => {
    setOpenAddCoinz(true);
  }, [setOpenAddCoinz]);

  // Loading states
  if (isLoading || removingServiceChargeLoader || removingCouponLoader || removingCoinzLoader || isPrinting) {
    return <SpinnerMemo />;
  }

  if (!billData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No bill available.</p>
        <CommonBottomButton
          fixed={true}
          maxWidth={screenSize === 'xs' ? '30rem' : '48rem'}
          backgroundColor={screenSize === 'xs' ? '' : 'white'}
          buttons={[
            {
              text: 'Back',
              onClick: closeOrderModalHandler,
              className: 'rounded-md w-full',
            },
          ]}
        />
      </div>
    );
  }

  // Show split bill grid
  if (isSplitBill && !selectedBill) {
    return (
      <SplitBillGrid billData={billData as IBillData[]} onSelectBill={handleSelectBill} onBack={closeOrderModalHandler} screenSize={screenSize} />
    );
  }

  if (!currentBill) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No bill selected.</p>
        <CommonBottomButton
          fixed={true}
          maxWidth={screenSize === 'xs' ? '30rem' : '48rem'}
          backgroundColor={screenSize === 'xs' ? '' : 'white'}
          buttons={[
            {
              text: 'Back',
              onClick: isSplitBill ? handleBackToGrid : closeOrderModalHandler,
              className: 'rounded-md w-full',
            },
          ]}
        />
      </div>
    );
  }

  return (
    <>
      {!showqr && (
        <Card
          key={currentBill.id}
          className={cn(
            'mx-auto mb-8 min-h-[90dvh] max-w-lg border border-none py-[5rem] shadow-none md:py-[8rem] lg:pb-20 lg:pt-0',
            currentBill.isPaid ? 'h-full overflow-auto bg-green-100' : 'bg-white',
          )}
        >
          <BillHeader
            isSplitBill={isSplitBill}
            selectedBill={selectedBill}
            onBackToGrid={handleBackToGrid}
            onReprintBill={reprintBillHandler}
            onShowEBill={() => setShowEBill(true)}
          />

          <CardContent>
            <PhoneActions
              customerPhone={currentBill?.customerPhone}
              customerName={currentBill?.customerName}
              isPhoneVerified={isPhoneVerified}
              copyTick={copyTick}
              onProtectedAction={handleProtectedAction}
            />

            <div className="mb-4 flex items-center gap-2">
              <MdTableBar className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-700">Table: {currentBill?.tableName}</p>
            </div>
            {currentBill.isPaid && (
              <Badge variant="outline" className="flex items-center justify-center bg-green-900 text-xl text-white">
                Bill Paid
              </Badge>
            )}

            <Separator className="my-4" />

            <ActionHistory currentBill={currentBill} />

            <BillItemsList billData={currentBill} isExpanded={isExpanded} setIsExpanded={setIsExpanded} allItems={allItems} />

            <Separator className="my-4" />

            {!currentBill.isPaid && (
              <BillSummary
                currentBill={currentBill}
                existingLoyalty={existingLoyalty}
                onTriggerAddCoinz={triggerAddCoinz}
                onClickKey={clickOnKey}
                onRemoveClaimedCoins={removeClaimedCoins}
                onRemoveCoupon={removeCouponHandler}
                onOpenServiceChargeModal={openServiceChargeModal}
                onSetActiveModal={setActiveModal}
              />
            )}

            <Separator className="my-4" />
          </CardContent>
        </Card>
      )}

      {/* Lazy loaded modals */}
      {showMoreOption && (
        <BottomPopUp width="w-[30rem]" height="h-[100dvh] lg:h-[90dvh]" hide show={showMoreOption} onClose={closeMoreOptions} rightTopBack>
          <LazyWrapper>
            <BillOptions data={currentBill} />
          </LazyWrapper>
        </BottomPopUp>
      )}

      {showEBill && (
        <BottomPopUp width="w-[30rem]" hide rightTopBack show={showEBill} onClose={() => setShowEBill(false)}>
          <LazyWrapper>
            <EBill />
          </LazyWrapper>
        </BottomPopUp>
      )}

      {showqr && (
        <BottomPopUp width="w-[30rem]" hide show={showqr} onClose={() => setShowqr(false)}>
          <LazyWrapper>
            <QrCodePreview data={currentBill} qrBillId={qrBillId} toggleQr={toggleQr} />
          </LazyWrapper>
        </BottomPopUp>
      )}

      {normalSettle && (
        <BottomPopUp height="h-[100dvh] lg:h-[90dvh]" hide width="w-[30rem]" show={normalSettle} onClose={() => setNormalSettle(false)}>
          <LazyWrapper>
            <NormalSettle closeNormalSettle={closeNormalSettle} data={currentBill} />
          </LazyWrapper>
        </BottomPopUp>
      )}

      {openAddCoinz && (
        <BottomPopUp height="h-[100dvh] lg:h-[85dvh]" width="w-[30rem]" rightTopBack hide show={openAddCoinz} onClose={() => setOpenAddCoinz(false)}>
          <LazyWrapper>
            <AddCoinz data={currentBill} />
          </LazyWrapper>
        </BottomPopUp>
      )}

      {isModalOpen && (
        <LazyWrapper>
          <PasswordModal isOpen={isModalOpen} onVerify={handlePasswordVerify} onClose={handleModalClose} />
        </LazyWrapper>
      )}

      <CommonBottomButton
        maxWidth={screenSize === 'xs' ? '30rem' : '48rem'}
        backgroundColor={screenSize === 'xs' ? 'white' : 'white'}
        fixed={true}
        buttons={[
          {
            text: ' ',
            onClick: goHome,
            icon: <HomeIcon />,
            className: 'rounded-md lg:hidden !w-[8rem] pl-2 ',
          },
          {
            text: '',
            isBackButton: true,
            onClick: isSplitBill && selectedBill ? handleBackToGrid : closeOrderModalHandler,
            className: 'rounded-md pl-3 md:pl-4 !w-[8rem] ml-4',
          },
          {
            text: 'Normal Settle',
            onClick: openNormalSettle,
            className: 'rounded-md !bg-purple-600',
          },
          {
            text: 'Hi Settle',
            onClick: () => {
              if (currentBill.isPaid) {
                return toast.error('This bill is already settled.');
              }
              mutate();
            },
            disable: isPending,
            isLoading: isPending,
            highlight: true,
            className: 'rounded-md',
          },
        ]}
      />
    </>
  );
};

const GetBill = memo(MemoGetBill);
export default GetBill;
