import IndividualDayView from '@/components/individual-day/IndividualDayView';
import type { DayPeriodConfig, DayPeriodConfigs, UpdateBusinessDayConfigPayload } from '@/components/types/business-day-config.ts';
import { getDayName } from '@/components/utils/timeUtils.ts';
import { type CouponCreatePayload, useCreateCoupon, useGetBusinessCoupons } from '@/hooks/useBusinessCoupons';
import { useGetBusinessDayConfigs, useToggleDay, useUpdateBusinessDayConfig } from '@/hooks/useBusinessDayConfig';
import { useGetIndividualDayPeriodConfigs, useUpdatePeriodConfig } from '@/hooks/useBusinessPeriodConfig';
import { memo, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

/**
 * Individual Day Configuration Page
 * Displays and manages settings for a specific day of the week
 */
const IndividualDay = () => {
  // Get URL parameters
  const params = useParams();
  const { businessId, day } = params;
  const dayNumber = Number.parseInt(day || '0', 10);

  // Fetch data
  const { data: businessDayConfigs, isLoading: isLoadingConfigs, getBusinessDay } = useGetBusinessDayConfigs(businessId as string);
  const { isLoading: isLoadingPeriods, IndividualDayData, callIndividual } = useGetIndividualDayPeriodConfigs(businessId as string, dayNumber);
  const { data: couponsResponse } = useGetBusinessCoupons(businessId as string);
  const { updateBusinessDayConfig, isUpdating } = useUpdateBusinessDayConfig();
  const { updatePeriod, isUpdating: isUpdatingPeriod } = useUpdatePeriodConfig();
  const { toggleDay } = useToggleDay();
  const { createCoupon, isCreating: isCreatingCoupon } = useCreateCoupon();

  // Memoize day config
  const dayConfig = useMemo(() => {
    if (!businessDayConfigs || businessDayConfigs.length === 0) return null;
    return businessDayConfigs.find((config) => config.dayOfWeek === dayNumber) || null;
  }, [businessDayConfigs, dayNumber]);

  // Memoize period configs for this day

  const dayPeriodConfigs: DayPeriodConfigs = useMemo(() => {
    if (!IndividualDayData) return {};

    // Convert array to object with period as key
    const periodConfigMap: DayPeriodConfigs = {};
    for (const config of IndividualDayData as DayPeriodConfig[]) {
      periodConfigMap[config.period] = config;
    }

    return periodConfigMap;
  }, [IndividualDayData]);

  // Memoize available coupons
  const coupons = useMemo(() => {
    return couponsResponse?.data || [];
  }, [couponsResponse]);

  // Toggle day open/closed
  const handleToggleDay = useCallback(async () => {
    if (!dayConfig || !businessId) return;

    try {
      await toggleDay({ businessId, dayOfWeek: dayConfig.dayOfWeek });
      toast.success(`${dayConfig.isOpen ? 'Closed' : 'Opened'} ${getDayName(dayConfig.dayOfWeek)}`);
    } catch (error) {
      toast.error('Error toggling day');
      console.error('Error toggling day:', error);
    }
  }, [businessId, dayConfig, toggleDay]);

  // Save changes to the day configuration
  const handleSaveDayConfig = useCallback(
    async (editState: UpdateBusinessDayConfigPayload) => {
      if (!editState || !businessId) return;

      const payload = {
        dayOfWeek: editState.dayOfWeek,
        startTime: editState.startTime,
        endTime: editState.endTime,
        closedIntervals: editState.closedIntervals,
        isOpen: editState.isOpen,
      };

      try {
        await updateBusinessDayConfig({ businessId, payload });
        toast.success('Day settings updated');
        return true;
      } catch (error) {
        toast.error('Error saving day settings');
        console.error('Error saving day config:', error);
        return false;
      }
    },
    [businessId, updateBusinessDayConfig],
  );

  // Save changes to period configuration
  const handleSavePeriodConfig = useCallback(
    async (periodId: number, baseCharge: number, redeemableCoverCharge: number, couponAllocations: any[],isOpen?:boolean) => {
      if (!businessId || !dayConfig) return false;

      try {
        const config = await updatePeriod({
          businessId,
          dayOfWeek: dayConfig.dayOfWeek,
          period: periodId,
          payload: {
            baseCharge,
            redeemableCoverCharge,
            couponAllocations,
            isOpen,
          },
        });
        if (config.status === 200 || config.status === 201) {
          getBusinessDay();
          callIndividual();
          toast.success('Period settings updated');
        }
        return true;
      } catch (error) {
        toast.error('Error saving period settings');
        console.error('Error saving period config:', error);
        return false;
      }
    },
    [businessId, dayConfig, updatePeriod],
  );

  // Create new coupon
  const handleCreateCoupon = useCallback(
    async (couponData: CouponCreatePayload) => {
      if (!businessId) return;

      try {
        await createCoupon({ businessId, payload: couponData });
        toast.success('Coupon created successfully');
        return true;
      } catch (error) {
        toast.error('Failed to create coupon');
        console.error('Error creating coupon:', error);
        return false;
      }
    },
    [businessId, createCoupon],
  );

  return (
    <IndividualDayView
      key={dayNumber}
      businessId={businessId || ''}
      dayNumber={dayNumber}
      dayConfig={dayConfig}
      dayPeriodConfigs={dayPeriodConfigs}
      coupons={coupons}
      isLoadingConfigs={isLoadingConfigs}
      isLoadingPeriods={isLoadingPeriods}
      isUpdating={isUpdating}
      isUpdatingPeriod={isUpdatingPeriod}
      isCreatingCoupon={isCreatingCoupon}
      onToggleDay={handleToggleDay}
      onSaveDayConfig={handleSaveDayConfig}
      onSavePeriodConfig={handleSavePeriodConfig}
      onCreateCoupon={handleCreateCoupon}
    />
  );
};

export default memo(IndividualDay);
