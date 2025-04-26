import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {  Sun, Coffee, Sunset, Moon } from "lucide-react";
import { toast } from "react-hot-toast";
import MemoizedHeader from "@/components/molecules/header";
import { Card } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getDayName } from "@/components/utils/timeUtils";
import {
  useGetBusinessPeriodConfigs,
  useUpdatePeriodConfig,
  useTogglePeriod,
  useToggleAllPeriodsForDay,
} from "@/hooks/useBusinessPeriodConfig";
import { type CouponCreatePayload, useCreateCoupon } from "@/hooks/useBusinessCoupons";
import { useQueryClient } from "@tanstack/react-query";

// Import components
import FilterBar from "@/components/period-management/FilterBar";
import DayCard from "@/components/period-management/DayCard";
import PeriodGroup from "@/components/period-management/PeriodGroup";

// Period icons mapping
const periodIcons = [
  { icon: Sun, label: "Morning", color: "text-amber-500" },
  { icon: Coffee, label: "Afternoon", color: "text-blue-500" },
  { icon: Sunset, label: "Evening", color: "text-orange-500" },
  { icon: Moon, label: "Night", color: "text-indigo-500" },
];

// Day colors for visual distinction
const dayColors = [
  "bg-white border-red-100", // Sunday
  "bg-gray-50 border-blue-100", // Monday
  "bg-white border-green-100", // Tuesday
  "bg-gray-50 border-purple-100", // Wednesday
  "bg-white border-yellow-100", // Thursday
  "bg-gray-50 border-pink-100", // Friday
  "bg-white border-teal-100", // Saturday
];

/**
 * Period Management Page Component
 */
const PeriodManagement = () => {
  const { businessId = "" } = useParams<{ businessId: string }>();
  const [activeTab, setActiveTab] = useState<string>("by-day");
  const [selectedDays, setSelectedDays] = useState<string[]>(["all"]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(["all"]);
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">(
    "all",
  );
  const [couponFilter, setCouponFilter] = useState<"all" | "with" | "without">(
    "all",
  );
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Check if the device is mobile
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Fetch period configurations
  const { data: periodConfigsResponse, isLoading } =
    useGetBusinessPeriodConfigs(businessId);
  const { updatePeriod } = useUpdatePeriodConfig();
  const { togglePeriod } = useTogglePeriod();
  const { toggleAllPeriodsForDay } = useToggleAllPeriodsForDay();
  const { createCoupon, isCreating: isCreatingCoupon } = useCreateCoupon();
  const queryClient = useQueryClient();

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Handle day selection change
  const handleDayChange = useCallback((value: string) => {
    setSelectedDays((prev) => {
      // If "all" is selected, clear other selections
      if (value === "all") {
        return ["all"];
      }

      // If a specific day is selected, remove "all" from selection
      const newSelection = prev.filter((day) => day !== "all");

      // Toggle the selected day
      if (newSelection.includes(value)) {
        const filtered = newSelection.filter((day) => day !== value);
        // If no days are selected, default to "all"
        return filtered.length === 0 ? ["all"] : filtered;
      } else {
        return [...newSelection, value];
      }
    });
  }, []);

  // Handle period selection change
  const handlePeriodChange = useCallback((value: string) => {
    setSelectedPeriods((prev) => {
      // If "all" is selected, clear other selections
      if (value === "all") {
        return ["all"];
      }

      // If a specific period is selected, remove "all" from selection
      const newSelection = prev.filter((period) => period !== "all");

      // Toggle the selected period
      if (newSelection.includes(value)) {
        const filtered = newSelection.filter((period) => period !== value);
        // If no periods are selected, default to "all"
        return filtered.length === 0 ? ["all"] : filtered;
      } else {
        return [...newSelection, value];
      }
    });
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback(
    (status: "all" | "open" | "closed") => {
      setStatusFilter(status);
    },
    [],
  );

  // Add the coupon filter handler
  const handleCouponFilterChange = useCallback(
    (filter: "all" | "with" | "without") => {
      setCouponFilter(filter);
    },
    [],
  );

  // Handle create coupon
  const handleCreateCoupon = useCallback(
    async (payload: CouponCreatePayload) => {
      setIsActionInProgress(true);
      try {
        await createCoupon({ businessId, payload });
        // Invalidate queries to refresh the coupon list
        queryClient.invalidateQueries({
          queryKey: ["businessCoupons", businessId],
        });
        toast.success("Coupon created successfully");
        return true;
      } catch (error) {
        console.error("Failed to create coupon:", error);
        toast.error("Failed to create coupon");
        return false;
      } finally {
        setIsActionInProgress(false);
      }
    },
    [businessId, createCoupon, queryClient],
  );

  // Save period changes
  const handleSavePeriod = useCallback(
    async (
      dayOfWeek: number,
      period: number,
      baseCharge: number,
      redeemableCoverCharge: number,
      isOpen: boolean,
      couponAllocations?: any[],
    ) => {
      setIsActionInProgress(true);
      try {
        await updatePeriod({
          businessId,
          dayOfWeek,
          period,
          payload: {
            baseCharge,
            redeemableCoverCharge,
            isOpen,
            couponAllocations,
          },
        });
        toast.success("Period configuration updated successfully");
      } catch (error) {
        console.error("Failed to update period configuration:", error);
        toast.error("Failed to update period configuration");
      } finally {
        setIsActionInProgress(false);
      }
    },
    [businessId, updatePeriod],
  );

  // Toggle a period's open/closed status
  const handleTogglePeriod = useCallback(
    async (dayOfWeek: number, period: number) => {
      setIsActionInProgress(true);
      try {
        await togglePeriod({
          businessId,
          dayOfWeek,
          period,
        });
        const periodName = periodIcons[period].label;
        const dayName = getDayName(dayOfWeek);
        toast.success(
          `${periodName} period for ${dayName} toggled successfully`,
        );
      } catch (error) {
        console.error("Failed to toggle period:", error);
        toast.error("Failed to toggle period");
      } finally {
        setIsActionInProgress(false);
      }
    },
    [businessId, togglePeriod],
  );

  // Toggle all periods for a day
  const handleToggleAllPeriodsForDay = useCallback(
    async (dayOfWeek: number) => {
      setIsActionInProgress(true);
      try {
        await toggleAllPeriodsForDay({
          businessId,
          dayOfWeek,
        });
        const dayName = getDayName(dayOfWeek);
        toast.success(`All periods for ${dayName} toggled successfully`);
      } catch (error) {
        console.error("Failed to toggle all periods:", error);
        toast.error("Failed to toggle all periods");
      } finally {
        setIsActionInProgress(false);
      }
    },
    [businessId, toggleAllPeriodsForDay],
  );

  // Update the filteredData useMemo to include coupon filtering
  const filteredData = useMemo(() => {
    if (!periodConfigsResponse?.data) return { byDay: {}, byPeriod: {} };

    const { dayWise, periodWise } = periodConfigsResponse.data;

    // Filter by day if needed
    let filteredByDay = {};
    if (selectedDays.includes("all")) {
      filteredByDay = { ...dayWise };
    } else {
      selectedDays.forEach((day) => {
        if (dayWise[day]) {
          filteredByDay[day] = { ...dayWise[day] };
        }
      });
    }

    // Filter by period if needed
    let filteredByPeriod = {};
    if (selectedPeriods.includes("all")) {
      filteredByPeriod = { ...periodWise };
    } else {
      selectedPeriods.forEach((period) => {
        if (periodWise[period]) {
          filteredByPeriod[period] = { ...periodWise[period] };
        }
      });
    }

    // Apply status filter (open/closed)
    if (statusFilter !== "all") {
      // Filter days
      Object.keys(filteredByDay).forEach((dayKey) => {
        const dayPeriods = filteredByDay[dayKey];
        const filteredDayPeriods = {};

        Object.entries(dayPeriods).forEach(([periodKey, periodConfig]) => {
          const isOpen = periodConfig.isOpen;
          if (
            (statusFilter === "open" && isOpen) ||
            (statusFilter === "closed" && !isOpen)
          ) {
            filteredDayPeriods[periodKey] = periodConfig;
          }
        });

        filteredByDay[dayKey] = filteredDayPeriods;

        // Remove day if it has no periods after filtering
        if (Object.keys(filteredDayPeriods).length === 0) {
          delete filteredByDay[dayKey];
        }
      });

      // Filter periods
      Object.keys(filteredByPeriod).forEach((periodKey) => {
        const periodDays = filteredByPeriod[periodKey];
        const filteredPeriodDays = {};

        Object.entries(periodDays).forEach(([dayKey, periodConfig]) => {
          const isOpen = periodConfig.isOpen;
          if (
            (statusFilter === "open" && isOpen) ||
            (statusFilter === "closed" && !isOpen)
          ) {
            filteredPeriodDays[dayKey] = periodConfig;
          }
        });

        filteredByPeriod[periodKey] = filteredPeriodDays;

        // Remove period if it has no days after filtering
        if (Object.keys(filteredPeriodDays).length === 0) {
          delete filteredByPeriod[periodKey];
        }
      });
    }

    // Apply coupon filter
    if (couponFilter !== "all") {
      // Filter days
      Object.keys(filteredByDay).forEach((dayKey) => {
        const dayPeriods = filteredByDay[dayKey];
        const filteredDayPeriods = {};

        Object.entries(dayPeriods).forEach(([periodKey, periodConfig]) => {
          const hasCoupons =
            periodConfig.couponAllocations &&
            periodConfig.couponAllocations.length > 0;
          if (
            (couponFilter === "with" && hasCoupons) ||
            (couponFilter === "without" && !hasCoupons)
          ) {
            filteredDayPeriods[periodKey] = periodConfig;
          }
        });

        filteredByDay[dayKey] = filteredDayPeriods;

        // Remove day if it has no periods after filtering
        if (Object.keys(filteredDayPeriods).length === 0) {
          delete filteredByDay[dayKey];
        }
      });

      // Filter periods
      Object.keys(filteredByPeriod).forEach((periodKey) => {
        const periodDays = filteredByPeriod[periodKey];
        const filteredPeriodDays = {};

        Object.entries(periodDays).forEach(([dayKey, periodConfig]) => {
          const hasCoupons =
            periodConfig.couponAllocations &&
            periodConfig.couponAllocations.length > 0;
          if (
            (couponFilter === "with" && hasCoupons) ||
            (couponFilter === "without" && !hasCoupons)
          ) {
            filteredPeriodDays[dayKey] = periodConfig;
          }
        });

        filteredByPeriod[periodKey] = filteredPeriodDays;

        // Remove period if it has no days after filtering
        if (Object.keys(filteredPeriodDays).length === 0) {
          delete filteredByPeriod[periodKey];
        }
      });
    }

    return { byDay: filteredByDay, byPeriod: filteredByPeriod };
  }, [
    periodConfigsResponse,
    selectedDays,
    selectedPeriods,
    statusFilter,
    couponFilter,
  ]);

  // Check if any day has all periods open
  const dayOpenStatus = useMemo(() => {
    if (!periodConfigsResponse?.data?.dayWise) return {};

    const status: Record<string, boolean> = {};

    Object.entries(periodConfigsResponse.data.dayWise).forEach(
      ([day, periods]) => {
        const periodValues = Object.values(periods);
        status[day] = periodValues.some((period) => period.isOpen);
      },
    );

    return status;
  }, [periodConfigsResponse]);

  // Loading state
  const showLoading = isLoading || isActionInProgress;

  return (
    <main className="min-h-screen pb-[10rem]">
      {/* Header */}
      <header className="linear_gradient_background">
        <MemoizedHeader title="Period Management" />
      </header>

      {/* Main content */}
      <div className="container py-4 mx-auto">
        {/* Loading indicator */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-xl"
              >
                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
                <p className="font-medium text-gray-700">
                  Updating period configurations...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter and view controls */}
        <FilterBar
          activeTab={activeTab}
          selectedDays={selectedDays}
          selectedPeriods={selectedPeriods}
          periodIcons={periodIcons}
          onTabChange={handleTabChange}
          onDayChange={handleDayChange}
          onPeriodChange={handlePeriodChange}
          isMobile={isMobile}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          couponFilter={couponFilter}
          onCouponFilterChange={handleCouponFilterChange}
        />

        {/* Period configurations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "by-day" ? (
              // By Day View
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(filteredData.byDay).map(
                  ([dayOfWeek, periods]) => {
                    const dayIndex = Number.parseInt(dayOfWeek);
                    const dayName = getDayName(dayIndex);
                    const isAnyPeriodOpen = dayOpenStatus[dayOfWeek] || false;

                    return (
                      <DayCard
                        key={dayOfWeek}
                        dayOfWeek={dayOfWeek}
                        dayIndex={dayIndex}
                        periods={periods}
                        dayName={dayName}
                        isAnyPeriodOpen={isAnyPeriodOpen}
                        periodIcons={periodIcons}
                        dayColors={dayColors}
                        onToggleAllPeriodsForDay={handleToggleAllPeriodsForDay}
                        onTogglePeriod={handleTogglePeriod}
                        onSavePeriod={handleSavePeriod}
                        isActionInProgress={isActionInProgress}
                        businessId={businessId}
                        onCreateCoupon={handleCreateCoupon}
                        isCreatingCoupon={isCreatingCoupon}
                      />
                    );
                  },
                )}

                {Object.keys(filteredData.byDay).length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      No periods match your filter criteria. Please adjust your
                      filters.
                    </p>
                  </Card>
                )}
              </div>
            ) : (
              // By Period View
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(filteredData.byPeriod).map(
                  ([periodKey, days]) => {
                    const periodIndex = Number.parseInt(periodKey);
                    const periodInfo = periodIcons[periodIndex];

                    return (
                      <PeriodGroup
                        key={periodKey}
                        periodKey={periodKey}
                        periodIndex={periodIndex}
                        days={days}
                        periodInfo={periodInfo}
                        dayColors={dayColors}
                        onTogglePeriod={handleTogglePeriod}
                        onSavePeriod={handleSavePeriod}
                        isActionInProgress={isActionInProgress}
                        businessId={businessId}
                        onCreateCoupon={handleCreateCoupon}
                        isCreatingCoupon={isCreatingCoupon}
                      />
                    );
                  },
                )}

                {Object.keys(filteredData.byPeriod).length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      No periods match your filter criteria. Please adjust your
                      filters.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
};

export default PeriodManagement;
