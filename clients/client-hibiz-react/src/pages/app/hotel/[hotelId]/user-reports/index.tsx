import { lazy, Suspense, useState } from "react";
import LoadingSpinner from "@/components/atom/loadingSpinner/index.tsx";
import MemoizedHeader from "@/components/molecules/header/index.tsx";
import useTimings from "@/components/store/useTimings.ts";
import {
  type IHotelStaff,
  useGetAllHotelStaff,
} from "@/hooks/useHotelStaff.ts";
import useBusinessData from "@/components/store/useBusinessData.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStaffAlertReport } from "@/hooks/hotel/useStaffAlertReport.ts";
import StaffPerformanceDashboard from "@/components/hotel/Analytics/userAnalytics.tsx";

const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);

const UserReport = () => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  const [selectedStaffId, setSelectedStaffId] = useState<string>("all");

  const { staffData = [] as IHotelStaff[] } =
    useGetAllHotelStaff(businessId || "") || {};

  const hookParams = {
    businessId: businessId,
    from: timeStampStart,
    to: timeStampEnd,
    ...(selectedStaffId !== "all" && { staffId: selectedStaffId }),
  };

  const { data, isLoading } = useStaffAlertReport(hookParams);

  console.log("Start:", data);

  return (
    <main className="pb-20">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Staff performance Dashboard" />
      </header>
      <Suspense fallback={<LoadingSpinner />}>
        <DateRangePicker />
      </Suspense>

      <div className="px-4 mt-4">
        <div className="flex items-center gap-4 mb-4">
          <label
            htmlFor="staff-filter"
            className="text-sm font-medium text-gray-700"
          >
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

      <div className="px-4 mt-6">
        <StaffPerformanceDashboard
          isLoading={isLoading}
          data={data}

        />
      </div>
    </main>
  );
};

export default UserReport;
