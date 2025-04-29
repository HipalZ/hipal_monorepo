import ClosedDayState from '@/components/individual-day/ClosedDayState';
import ClosedIntervalsSection from '@/components/individual-day/ClosedIntervalsSection';
import DayStatusCard from '@/components/individual-day/DayStatusCard';
import EditDayModal from '@/components/individual-day/EditDayModal';
import LoadingState from '@/components/individual-day/LoadingState';
import PeriodEditModal from '@/components/individual-day/PeriodEditModal';
import MemoizedHeader from '@/components/molecules/header';
import { useBusinessDayConfigUIStore } from '@/components/store/booking/businessDayConfigStore';
import { memo, useCallback, useState } from 'react';
import { getDayName } from '../utils/timeUtils.ts';
import PeriodSection from './PeriodSection.tsx';

type IndividualDayViewProps = {
  businessId: string;
  dayNumber: number;
  dayConfig: any;
  dayPeriodConfigs: any;
  coupons: any[];
  isLoadingConfigs: boolean;
  isLoadingPeriods: boolean;
  isUpdating: boolean;
  isUpdatingPeriod: boolean;
  isCreatingCoupon: boolean;
  onToggleDay: () => Promise<void>;
  onSaveDayConfig: (editState: any) => Promise<boolean>;
  onSavePeriodConfig: (periodId: number, baseCharge: number, redeemableCoverCharge: number, couponAllocations: any[]) => Promise<boolean>;
  onCreateCoupon: (couponData: any) => Promise<boolean>;
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
  } = useBusinessDayConfigUIStore();

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

  // Loading state
  if (isLoadingConfigs || isLoadingPeriods) {
    return <LoadingState />;
  }

  // Day is not configured
  if (!dayConfig.isOpen) {
    return <ClosedDayState dayConfig={dayConfig} onToggleDay={onToggleDay} />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="linear_gradient_background">
        <MemoizedHeader title={`${getDayName(dayConfig.dayOfWeek)} Settings`} />
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Day Status Card */}
        <DayStatusCard dayConfig={dayConfig} onToggleDay={onToggleDay} onEditDay={handleEditDay} />

        {/* Closed Intervals Section */}
        <ClosedIntervalsSection dayConfig={dayConfig} onEditDay={handleEditDay} />
        {/* Periods Section */}
        <PeriodSection dayConfig={dayConfig} periodConfigs={dayPeriodConfigs} onEditPeriod={handleEditPeriod} coupons={coupons} />
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
          isOpen={isPeriodEditModalOpen}
          onOpenChange={setIsPeriodEditModalOpen}
          businessId={businessId}
          periodId={selectedPeriod}
          periodConfig={dayPeriodConfigs[selectedPeriod]}
          coupons={coupons}
          isUpdating={isUpdatingPeriod}
          isCreatingCoupon={isCreatingCoupon}
          onSave={(baseCharge, redeemableCoverCharge, couponAllocations) =>
            onSavePeriodConfig(selectedPeriod, baseCharge, redeemableCoverCharge, couponAllocations)
          }
          onCreateCoupon={onCreateCoupon}
        />
      )}
    </main>
  );
};

export default memo(IndividualDayView);
