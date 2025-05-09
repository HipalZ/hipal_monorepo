import { memo, useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/atom/loadingSpinner/index.tsx';
import AddCouponDialog from '@/components/calendar/add-coupon-dialog';
import PeriodCard from '@/components/calendar/period-card';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPeriodName } from '@/components/utils/timeUtils';
import {
  useGetIndividualDateInfo,
  useUpdateExplicitBooking,
  type ExplicitBookingUpdatePayload,
  type IBookingBusinessDetails,
} from '@/hooks/useBookingCalendar';
import { useGetBusinessCoupons } from '@/hooks/useBusinessCoupons.ts';
import { format, parseISO } from 'date-fns';
import { Clock, Users } from 'lucide-react';

// Define types for component props
interface DateInfoSummaryProps {
  totalBookings: number;
  periodCount: number;
}

// Summary cards component
const DateInfoSummary = memo(({ totalBookings, periodCount }: DateInfoSummaryProps) => {
  return (
    <div className="my-6 grid grid-cols-2 gap-4 px-4">
      <Card>
        <CardContent className="p-2">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <h3 className="text-2xl font-bold">{totalBookings}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-2">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Periods</p>
              <h3 className="text-2xl font-bold">{periodCount}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

DateInfoSummary.displayName = 'DateInfoSummary';

const IndividualDateInfo = () => {
  const { businessId, date } = useParams<{ businessId: string; date: string }>();
  const { dateInfo, gettingDateInfo } = useGetIndividualDateInfo(businessId as string, date as string);
  const { data: allCouponsData, isLoading: loadingCoupons } = useGetBusinessCoupons(businessId as string);
  const { updateExplicitBooking, isUpdating } = useUpdateExplicitBooking();

  // State for editing
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [isOpenState, setIsOpenState] = useState<boolean>(true);
  const [editedCoupons, setEditedCoupons] = useState<{ couponId: string; remaining: number }[]>([]);
  const [showAddCouponDialog, setShowAddCouponDialog] = useState(false);

  // Get all coupons from the response
  const allCoupons = useMemo(() => allCouponsData?.data || [], [allCouponsData]);

  // Calculate total bookings across all periods
  const totalBookings = useMemo(() => dateInfo?.summary?.totalBookingsOfDay || 0, [dateInfo]);

  // Start editing a period
  const startEditing = useCallback((periodData: IBookingBusinessDetails) => {
    setEditingPeriod(periodData.bookingBusiness.period);
    setIsOpenState(periodData.bookingBusiness.isOpen);

    // Initialize edited coupons with current values
    const currentCoupons = periodData.bookingBusiness.couponsRemaining.map((coupon) => ({
      couponId: coupon.couponId._id,
      remaining: coupon.remaining,
    }));
    setEditedCoupons(currentCoupons);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingPeriod(null);
    setEditedCoupons([]);
  }, []);

  // Save changes
  const saveChanges = useCallback(
    (periodData: IBookingBusinessDetails) => {
      const payload: ExplicitBookingUpdatePayload = {};

      // Only include isOpen if it changed
      if (isOpenState !== periodData.bookingBusiness.isOpen) {
        payload.isOpen = isOpenState;
      }

      // Only include coupons if they changed
      if (editedCoupons.length > 0) {
        payload.couponsRemaining = editedCoupons;
      }

      // Only make API call if there are changes
      if (Object.keys(payload).length > 0) {
        updateExplicitBooking({
          businessId: businessId as string,
          date: date as string,
          period: periodData.bookingBusiness.period,
          payload,
        });
      }

      setEditingPeriod(null);
    },
    [businessId, date, editedCoupons, isOpenState, updateExplicitBooking],
  );

  // Update coupon count
  const updateCouponCount = useCallback((couponId: string, change: number) => {
    setEditedCoupons((prev) => {
      const couponIndex = prev.findIndex((c) => c.couponId === couponId);
      if (couponIndex === -1) return prev;

      const newCoupons = [...prev];
      const newCount = Math.max(0, newCoupons[couponIndex].remaining + change);
      newCoupons[couponIndex] = { ...newCoupons[couponIndex], remaining: newCount };
      return newCoupons;
    });
  }, []);

  // Add new coupons
  const addNewCoupons = useCallback((selectedCoupons: Array<{ couponId: string; remaining: number }>) => {
    setEditedCoupons((prev) => {
      const newCoupons = [...prev];

      // Process each selected coupon
      selectedCoupons.forEach((selectedCoupon) => {
        const existingIndex = newCoupons.findIndex((c) => c.couponId === selectedCoupon.couponId);

        if (existingIndex !== -1) {
          // Update existing coupon
          newCoupons[existingIndex].remaining += selectedCoupon.remaining;
        } else {
          // Add new coupon
          newCoupons.push(selectedCoupon);
        }
      });

      return newCoupons;
    });
  }, []);

  // Show add coupon dialog
  const handleShowAddCouponDialog = useCallback(() => {
    setShowAddCouponDialog(true);
  }, []);

  if (gettingDateInfo) {
    return (
      <main>
        <header className="linear_gradient_background">
          <MemoizedHeader title={date} />
        </header>
        <div className="mb-4">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>

        <Skeleton className="mb-6 h-12 w-full" />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!dateInfo) {
    return (
      <main>
        <header className="linear_gradient_background">
          <MemoizedHeader title={date} />
        </header>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-700">No data available</h2>
            <p className="text-gray-500">Could not load booking information for this date. Please try again later.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isUpdating) {
    return <LoadingSpinner />;
  }

  // Format the date for display
  const formattedDate = date ? format(parseISO(date as string), 'EEEE, MMMM d, yyyy') : '';

  return (
    <main className="pb-[5rem]">
      <header className="linear_gradient_background">
        <MemoizedHeader title={formattedDate} />
      </header>

      {/* Summary Cards */}
      <DateInfoSummary totalBookings={totalBookings} periodCount={dateInfo.bookingBusinessDetails.length} />

      {/* Period Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mx-0 mb-4 w-full max-w-[27rem] md:max-w-[22rem] lg:mx-4">
          <TabsTrigger value="all">All</TabsTrigger>
          {dateInfo.bookingBusinessDetails.map((periodData) => (
            <TabsTrigger key={periodData.bookingBusiness.period} value={periodData.bookingBusiness.period.toString()}>
              {getPeriodName(periodData.bookingBusiness.period)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Periods Content */}
        <TabsContent value="all">
          <div className="space-y-6">
            {dateInfo.bookingBusinessDetails.map((periodData) => (
              <PeriodCard
                key={periodData.bookingBusiness.period}
                periodData={periodData}
                editingPeriod={editingPeriod}
                isOpenState={isOpenState}
                editedCoupons={editedCoupons}
                allCoupons={allCoupons}
                isUpdating={isUpdating}
                onStartEditing={startEditing}
                onCancelEditing={cancelEditing}
                onSaveChanges={saveChanges}
                onUpdateCouponCount={updateCouponCount}
                onShowAddCouponDialog={handleShowAddCouponDialog}
              />
            ))}
          </div>
        </TabsContent>

        {/* Individual Period Content */}
        {dateInfo.bookingBusinessDetails.map((periodData) => (
          <TabsContent key={periodData.bookingBusiness.period} value={periodData.bookingBusiness.period.toString()}>
            <PeriodCard
              periodData={periodData}
              editingPeriod={editingPeriod}
              isOpenState={isOpenState}
              editedCoupons={editedCoupons}
              allCoupons={allCoupons}
              isUpdating={isUpdating}
              onStartEditing={startEditing}
              onCancelEditing={cancelEditing}
              onSaveChanges={saveChanges}
              onUpdateCouponCount={updateCouponCount}
              onShowAddCouponDialog={handleShowAddCouponDialog}
              isDetailView={true}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Coupon Dialog */}
      <AddCouponDialog
        open={showAddCouponDialog}
        onOpenChange={setShowAddCouponDialog}
        allCoupons={allCoupons}
        editedCoupons={editedCoupons}
        onAddCoupons={addNewCoupons}
        isLoading={loadingCoupons}
      />
    </main>
  );
};

export default IndividualDateInfo;
