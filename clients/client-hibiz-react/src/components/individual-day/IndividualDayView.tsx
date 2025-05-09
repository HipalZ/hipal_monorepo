import ClosedDayState from '@/components/individual-day/ClosedDayState';
import ClosedIntervalsSection from '@/components/individual-day/ClosedIntervalsSection';
import DayStatusCard from '@/components/individual-day/DayStatusCard';
import EditDayModal from '@/components/individual-day/EditDayModal';
import LoadingState from '@/components/individual-day/LoadingState';
import PeriodEditModal from '@/components/individual-day/PeriodEditModal';
import MemoizedHeader from '@/components/molecules/header';
import { useBusinessDayConfigUIStore } from '@/components/store/booking/businessDayConfigStore';
import { Button } from '@/components/ui/button';
import type { Coupon, CouponCreatePayload } from '@/hooks/useBusinessCoupons.ts';
import { Eye } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedBottomButton from '../atom/bottomButton/advancedBottomButton.tsx';
import type { BusinessDayConfig } from '../types/business-day-config.ts';
import { getDayName } from '../utils/timeUtils.ts';
import PeriodSection from './PeriodSection.tsx';
import SlotsPreviewModal from './slots-preview-modal';
import type { IndividualDayPeriodConfigs } from '@/hooks/useBusinessPeriodConfig.ts';

type IndividualDayViewProps = {
  businessId: string;
  dayNumber: number;
  dayConfig: BusinessDayConfig | null;
  dayPeriodConfigs: IndividualDayPeriodConfigs | null;
  coupons: Coupon[];
  isLoadingConfigs: boolean;
  isLoadingPeriods: boolean;
  isUpdating: boolean;
  isUpdatingPeriod: boolean;
  isCreatingCoupon: boolean;
  onToggleDay: () => Promise<void>;
  onSaveDayConfig: (editState: any) => Promise<boolean>;
  onSavePeriodConfig: (
    periodId: number,
    baseCharge: number,
    redeemableCoverCharge: number,
    couponAllocations: any[],
    isOpen?: boolean,
  ) => Promise<boolean>;
  onCreateCoupon: (couponData: CouponCreatePayload) => Promise<boolean>;
};

const IndividualDayView = ({
  businessId,
  dayConfig,
  dayPeriodConfigs,
  coupons,
  isLoadingConfigs,
  isLoadingPeriods,
  isUpdating,
  isUpdatingPeriod,
  isCreatingCoupon,
  onToggleDay,
  onSaveDayConfig,
  onSavePeriodConfig,
  onCreateCoupon,
}: IndividualDayViewProps) => {
  // Local state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPeriodEditModalOpen, setIsPeriodEditModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get UI state and actions from store
  const {
    editState,
    timeRangeError,
    intervalError,
    startEditing,
    updateStartTime,
    updateEndTime,
    addClosedInterval,
    updateClosedInterval,
    removeClosedInterval,
  } = useBusinessDayConfigUIStore((state) => ({
    editState: state.editState,
    timeRangeError: state.timeRangeError,
    intervalError: state.intervalError,
    startEditing: state.startEditing,
    updateStartTime: state.updateStartTime,
    updateEndTime: state.updateEndTime,
    addClosedInterval: state.addClosedInterval,
    updateClosedInterval: state.updateClosedInterval,
    removeClosedInterval: state.removeClosedInterval,
  }));

  // Open edit modal
  const handleEditDay = useCallback(() => {
    if (!dayConfig) return;

    startEditing(dayConfig._id, {
      dayOfWeek: dayConfig.dayOfWeek,
      startTime: dayConfig.startTime,
      endTime: dayConfig.endTime,
      closedIntervals: [...dayConfig.closedIntervals],
      isOpen: dayConfig.isOpen,
    });

    setIsEditModalOpen(true);
  }, [dayConfig, startEditing]);

  // Open period edit modal
  const handleEditPeriod = useCallback((periodId: number) => {
    setSelectedPeriod(periodId);
    setIsPeriodEditModalOpen(true);
  }, []);

  // Save changes to the day configuration
  const handleSaveDayConfig = useCallback(async () => {
    if (!editState) return;

    const success = await onSaveDayConfig(editState);
    if (success) {
      setIsEditModalOpen(false);
    }
  }, [editState, onSaveDayConfig]);

  // Open slots preview modal
  const handleOpenPreview = useCallback(() => {
    setIsPreviewModalOpen(true);
  }, []);

  const goToPeriods = useCallback(() => {
    navigate(`/app/business/${businessId}/bookings/everyday/period`);
  }, []);

  // Loading state
  if (isLoadingConfigs || isLoadingPeriods) {
    return <LoadingState />;
  }

  // Day is not configured
  if (!dayConfig?.isOpen) {
    return <ClosedDayState dayConfig={dayConfig} onToggleDay={onToggleDay} />;
  }

  return (
    <main className="min-h-screen">
      <header className="linear_gradient_background">
        <MemoizedHeader title={`${getDayName(dayConfig.dayOfWeek)} Settings`} />
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Preview Button */}
        <div className="mb-6 flex justify-end">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleOpenPreview}>
            <Eye className="h-4 w-4" />
            <span>Preview Slots</span>
          </Button>
        </div>

        {/* Day Status Card */}
        <DayStatusCard dayConfig={dayConfig} onToggleDay={onToggleDay} onEditDay={handleEditDay} />

        {/* Closed Intervals Section */}
        <ClosedIntervalsSection dayConfig={dayConfig} onEditDay={handleEditDay} />

        {/* Periods Section */}
        <PeriodSection dayConfig={dayConfig} periodConfigs={dayPeriodConfigs} onEditPeriod={handleEditPeriod} coupons={coupons} />

        <AdvancedBottomButton
          buttons={[
            {
              text: 'Go All Time Periods',
              onClick: goToPeriods,
              className: 'w-full max-w-[30rem]',
            },
          ]}
        />
      </div>

      {/* Edit Day Modal */}
      <EditDayModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        dayConfig={dayConfig}
        editState={editState}
        timeRangeError={timeRangeError}
        intervalError={intervalError}
        isUpdating={isUpdating}
        onStartTimeChange={updateStartTime}
        onEndTimeChange={updateEndTime}
        onAddInterval={addClosedInterval}
        onUpdateInterval={updateClosedInterval}
        onRemoveInterval={removeClosedInterval}
        onSave={handleSaveDayConfig}
      />

      {/* Period Edit Modal */}
      {selectedPeriod !== null && (
        <PeriodEditModal
          key={`period-edit-modal-${selectedPeriod}`}
          isOpen={isPeriodEditModalOpen}
          onOpenChange={setIsPeriodEditModalOpen}
          businessId={businessId}
          periodId={selectedPeriod}
          periodConfig={dayPeriodConfigs[selectedPeriod]}
          coupons={coupons}
          isUpdating={isUpdatingPeriod}
          isCreatingCoupon={isCreatingCoupon}
          onSave={(baseCharge, redeemableCoverCharge, couponAllocations, isOpen) =>
            onSavePeriodConfig(selectedPeriod, baseCharge, redeemableCoverCharge, couponAllocations, isOpen)
          }
          onCreateCoupon={onCreateCoupon}
        />
      )}

      {/* Slots Preview Modal */}
      <SlotsPreviewModal isOpen={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} dayConfig={dayConfig} />
    </main>
  );
};

export default memo(IndividualDayView);
