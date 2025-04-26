import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDayName } from '@/components/utils/timeUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle, ChevronUp, Clock, Filter, Tag, X, XCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

type FilterBarProps = {
  activeTab: string;
  selectedDays: string[];
  selectedPeriods: string[];
  periodIcons: Array<{
    icon: any;
    label: string;
    color: string;
  }>;
  onTabChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  isMobile: boolean;
  statusFilter?: 'all' | 'open' | 'closed';
  onStatusFilterChange?: (status: 'all' | 'open' | 'closed') => void;
  couponFilter?: 'all' | 'with' | 'without';
  onCouponFilterChange?: (status: 'all' | 'with' | 'without') => void;
};

// Add a helper function to count active filters at the top of the component
const countActiveFilters = (selectedDays: string[], selectedPeriods: string[], statusFilter: string, couponFilter: string) => {
  let count = 0;

  // Count day filters if not "all"
  if (!selectedDays.includes('all')) {
    count += selectedDays.length;
  }

  // Count period filters if not "all"
  if (!selectedPeriods.includes('all')) {
    count += selectedPeriods.length;
  }

  // Count status filter if not "all"
  if (statusFilter !== 'all') {
    count += 1;
  }

  // Count coupon filter if not "all"
  if (couponFilter !== 'all') {
    count += 1;
  }

  return count;
};

interface ActiveFiltersProps {
  selectedDays: string[];
  selectedPeriods: string[];
  statusFilter: string;
  couponFilter: string;
  onDayChange: (day: string) => void;
  onPeriodChange: (period: string) => void;
  onStatusFilterChange: (status: string) => void;
  onCouponFilterChange: (status: string) => void;
  periodIcons: Array<{
    icon: any;
    label: string;
    color: string;
  }>;
}

// Add a component to display active filters
const ActiveFilters = ({
  selectedDays,
  selectedPeriods,
  statusFilter,
  couponFilter,
  onDayChange,
  onPeriodChange,
  onStatusFilterChange,
  onCouponFilterChange,
  periodIcons,
}: ActiveFiltersProps) => {
  const hasActiveFilters = !selectedDays.includes('all') || !selectedPeriods.includes('all') || statusFilter !== 'all' || couponFilter !== 'all';

  if (!hasActiveFilters) return null;

  const clearAllBtn = useCallback(() => {
    onDayChange('all');
    onPeriodChange('all');
    onStatusFilterChange('all');
    onCouponFilterChange('all');
  }, []);

  return (
    <div className="md:hide-scrollbar flex flex-nowrap gap-2 overflow-x-auto !text-nowrap px-4 py-2 md:px-0">
      {/* Day filters */}
      {!selectedDays.includes('all') &&
        selectedDays.map((day) => (
          <div key={`day-${day}`} className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
            <span>{getDayName(Number(day))}</span>
            <button type="button" onClick={() => onDayChange(day)} className="hover:bg-primary/20 rounded-full p-0.5">
              <X size={14} />
            </button>
          </div>
        ))}

      {/* Period filters */}
      {!selectedPeriods.includes('all') &&
        selectedPeriods.map((period) => {
          const periodInfo = periodIcons[Number(period)];
          const PeriodIcon = periodInfo?.icon;
          return (
            <div key={`period-${period}`} className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
              {PeriodIcon && <PeriodIcon size={10} className={periodInfo.color} />}
              <span>{periodInfo?.label || `Period ${period}`}</span>
              <button type="button" onClick={() => onPeriodChange(period)} className="hover:bg-primary/20 rounded-full p-0.5">
                <X size={14} />
              </button>
            </div>
          );
        })}

      {/* Status filter */}
      {statusFilter !== 'all' && (
        <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <span>{statusFilter === 'open' ? 'Open Only' : 'Closed Only'}</span>
          <button type="button" onClick={() => onStatusFilterChange('all')} className="hover:bg-primary/20 rounded-full p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Coupon filter */}
      {couponFilter !== 'all' && (
        <div className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-1 text-xs">
          <span>{couponFilter === 'with' ? 'With Coupons' : 'Without Coupons'}</span>
          <button type="button" onClick={() => onCouponFilterChange('all')} className="hover:bg-primary/20 rounded-full p-0.5">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clear all button */}
      <Button size="sm" type="button" onClick={clearAllBtn} variant="outline">
        Clear all
        <X />
      </Button>
    </div>
  );
};

const FilterBar = ({
  activeTab,
  selectedDays,
  selectedPeriods,
  periodIcons,
  onTabChange,
  onDayChange,
  onPeriodChange,
  isMobile,
  statusFilter = 'all',
  onStatusFilterChange = () => {},
  couponFilter = 'all',
  onCouponFilterChange = () => {},
}: FilterBarProps) => {
  // For desktop view, make it sticky and collapsible
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderFilterContent = () => (
    <Tabs defaultValue="by-day" value={activeTab} onValueChange={onTabChange}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-primary relative z-10">
              <Filter size={18} strokeWidth={2} />
            </div>
          </motion.div>
          <div>
            <h3 className="text-sm font-medium text-gray-800">View Options</h3>
            <p className="text-xs text-gray-500">Choose how to organize and filter</p>
          </div>
        </div>

        <TabsList className="grid h-auto w-full grid-cols-2 p-1 sm:w-auto">
          <TabsTrigger
            value="by-day"
            className="data-[state=active]:bg-primary flex items-center gap-1 py-1.5 text-xs data-[state=active]:text-white"
          >
            <Calendar size={14} />
            <span>By Day</span>
          </TabsTrigger>
          <TabsTrigger
            value="by-period"
            className="data-[state=active]:bg-primary flex items-center gap-1 py-1.5 text-xs data-[state=active]:text-white"
          >
            <Clock size={14} />
            <span>By Period</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Status filter (open/closed) */}
      <div className="mb-4">
        <Label className="mb-2 block text-xs font-medium text-gray-700">Filter by Status</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('all')}
            className="h-8 text-xs"
          >
            All Periods
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'open' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('open')}
            className="flex h-8 items-center gap-1 text-xs"
          >
            <CheckCircle size={12} className="text-green-500" />
            Open Only
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'closed' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('closed')}
            className="flex h-8 items-center gap-1 text-xs"
          >
            <XCircle size={12} className="text-red-500" />
            Closed Only
          </Button>
        </div>
      </div>

      {/* Coupon filter (with/without coupons) */}
      <div className="mb-4">
        <Label className="mb-2 block text-xs font-medium text-gray-700">Filter by Coupons</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={couponFilter === 'all' ? 'default' : 'outline'}
            onClick={() => onCouponFilterChange('all')}
            className="h-8 text-xs"
          >
            All Periods
          </Button>
          <Button
            size="sm"
            variant={couponFilter === 'with' ? 'default' : 'outline'}
            onClick={() => onCouponFilterChange('with')}
            className="flex h-8 items-center gap-1 text-xs"
          >
            <Tag size={12} className="text-purple-500" />
            With Coupons
          </Button>
          <Button
            size="sm"
            variant={couponFilter === 'without' ? 'default' : 'outline'}
            onClick={() => onCouponFilterChange('without')}
            className="flex h-8 items-center gap-1 text-xs"
          >
            <Tag size={12} className="text-gray-400" />
            Without Coupons
          </Button>
        </div>
      </div>

      {activeTab === 'by-day' ? (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700">Filter by Days</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="all-days" checked={selectedDays.includes('all')} onCheckedChange={() => onDayChange('all')} />
              <Label htmlFor="all-days" className="text-xs">
                All Days
              </Label>
            </div>
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${index}`}
                  checked={selectedDays.includes(index.toString())}
                  onCheckedChange={() => onDayChange(index.toString())}
                />
                <Label htmlFor={`day-${index}`} className="text-xs">
                  {getDayName(index)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700">Filter by Periods</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="all-periods" checked={selectedPeriods.includes('all')} onCheckedChange={() => onPeriodChange('all')} />
              <Label htmlFor="all-periods" className="text-xs">
                All Periods
              </Label>
            </div>
            {periodIcons.map((period, index) => {
              const PeriodIcon = period.icon;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${index}`}
                    checked={selectedPeriods.includes(index.toString())}
                    onCheckedChange={() => onPeriodChange(index.toString())}
                  />
                  <Label htmlFor={`period-${index}`} className="flex items-center gap-1 text-xs">
                    <PeriodIcon size={12} className={period.color} />
                    {period.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Tabs>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed bottom-20 right-4 z-50 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <div className="relative">
                <Button size="icon" className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-full shadow-lg">
                  <Filter size={20} />
                </Button>
                {countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter)}
                  </span>
                )}
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-hidden rounded-t-xl pt-4">
              <div className="flex h-full flex-col">
                <div className="px-1 pb-2 text-sm font-medium">Filters</div>
                <ScrollArea className="-mr-4 flex-1 pb-16 pr-4">{renderFilterContent()}</ScrollArea>
                <div className="from-background pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t to-transparent" />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile active filters indicator */}
          {countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter) > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom fixed bottom-4 left-4 right-4 z-30 rounded-lg bg-white p-2 shadow-lg duration-300">
              <ActiveFilters
                selectedDays={selectedDays}
                selectedPeriods={selectedPeriods}
                statusFilter={statusFilter}
                couponFilter={couponFilter}
                onDayChange={onDayChange}
                onPeriodChange={onPeriodChange}
                onStatusFilterChange={onStatusFilterChange}
                onCouponFilterChange={onCouponFilterChange}
                periodIcons={periodIcons}
              />
            </div>
          )}
        </div>
        <div className="hidden sm:block">
          <Card className="mb-5 shadow-sm">
            <CardContent className="p-4">{renderFilterContent()}</CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="sticky top-[5rem] p-2 bg-[#00000010] backdrop-blur-md rounded-xl z-30 mb-5">
      <Card className="overflow-hidden shadow-sm">
        <div
          className="flex cursor-pointer items-center justify-between bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
          onKeyDown={() => setIsCollapsed(!isCollapsed)}
          role="button"
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} className="text-primary" />
            </motion.div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-800">Filters & View Options</h3>
              {countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter) > 0 && (
                <span className="bg-primary rounded-full px-2 py-0.5 text-xs text-white">
                  {countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter)}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronUp size={18} />
            </motion.div>
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="border-t border-gray-100 p-4">{renderFilterContent()}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show active filters when collapsed */}
        {isCollapsed && countActiveFilters(selectedDays, selectedPeriods, statusFilter, couponFilter) > 0 && (
          <div className="border-t border-gray-100 px-4 py-2">
            <ActiveFilters
              selectedDays={selectedDays}
              selectedPeriods={selectedPeriods}
              statusFilter={statusFilter}
              couponFilter={couponFilter}
              onDayChange={onDayChange}
              onPeriodChange={onPeriodChange}
              onStatusFilterChange={onStatusFilterChange}
              onCouponFilterChange={onCouponFilterChange}
              periodIcons={periodIcons}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default memo(FilterBar);
