import LoadingSpinner from '@/components/atom/loadingSpinner/index.tsx';
import StaffPerformanceDashboard from '@/components/hotel/Analytics/userAnalytics.tsx';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import useBusinessData from '@/components/store/useBusinessData.ts';
import useTimings from '@/components/store/useTimings.ts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStaffAlertReport } from '@/hooks/hotel/useStaffAlertReport.ts';
import { type IHotelStaff, useGetAllHotelStaff } from '@/hooks/useHotelStaff.ts';
import { cn } from '@/lib/utils.ts';
import { lazy, memo, Suspense, useState } from 'react';

const DateRangePicker = lazy(() => import('@/components/molecules/dateRangePicker'));

interface IStaffRepoCompProps {
  hide?: boolean;
}

const MemoStaffRepoComp = ({ hide = false }: IStaffRepoCompProps) => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

  const { staffData = [] as IHotelStaff[] } = useGetAllHotelStaff(businessId || '') || {};

  const hookParams = {
    businessId: businessId,
    from: timeStampStart,
    to: timeStampEnd,
    ...(selectedStaffId !== 'all' && { staffId: selectedStaffId }),
  };

  const { data, isLoading } = useStaffAlertReport(hookParams);

  return (
    <main className="pb-20">
      <header className={cn('linear_gradient_background', hide && 'lg:!rounded-2xl')}>
        <MemoizedHeader title="Staff Performance Dashboard" hideBack={hide} />
      </header>
      <Suspense fallback={<LoadingSpinner />}>
        <DateRangePicker />
      </Suspense>

      <div className="mt-4 px-4">
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="staff-filter" className="text-sm font-medium text-gray-700">
            Filter by Staff:
          </label>
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffData.map((staff) => (
                <SelectItem key={staff._id} value={staff._id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 px-4">
        <StaffPerformanceDashboard isLoading={isLoading} data={data} />
      </div>
    </main>
  );
};

const StaffRepoComp = memo(MemoStaffRepoComp);
export default StaffRepoComp;
