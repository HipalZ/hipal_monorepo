import type { BusinessDayConfig, ClosedInterval, UpdateBusinessDayConfigPayload } from '@/components/types/business-day-config';
import { getDayName, timeToMinutes } from '@/components/utils/timeUtils';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Clock8, Edit2, Save, X, XCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessDayConfigUIStore } from '../store/booking/businessDayConfigStore';
import ClosedIntervalList from './ClosedIntervalList';
import TimeRangeSelector from './TimeRangeSelector';

/**
 * Props for the DayConfigCard component
 */
type DayConfigCardProps = {
  config: BusinessDayConfig;
  businessId: string;
  onToggleDay: (businessId: string, dayOfWeek: number) => Promise<void>;
  onUpdateConfig: (businessId: string, payload: UpdateBusinessDayConfigPayload) => Promise<void>;
  onDayClick?: (dayOfWeek: number) => void; // Add this prop for navigation
};

/**
 * Component for displaying and editing a single day configuration
 */
const DayConfigCard: React.FC<DayConfigCardProps> = ({ config, businessId, onToggleDay, onUpdateConfig, onDayClick }) => {
  // Local state for expanded view
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get UI state and actions from store
  const {
    editingDayId,
    editState,
    timeRangeError,
    intervalError,
    startEditing,
    cancelEditing,
    updateStartTime,
    updateEndTime,
    addClosedInterval,
    updateClosedInterval,
    removeClosedInterval,
  } = useBusinessDayConfigUIStore();

  // Check if this card is being edited
  const isEditing = editingDayId === config._id;

  /**
   * Start editing this day configuration
   */
  const handleStartEditing = useCallback(() => {
    startEditing(config._id, {
      dayOfWeek: config.dayOfWeek,
      startTime: config.startTime,
      endTime: config.endTime,
      closedIntervals: [...config.closedIntervals],
      isOpen: config.isOpen,
    });
    setIsExpanded(true);
  }, [config, startEditing]);

  /**
   * Toggle day open/closed
   */
  const handleToggleDay = useCallback(() => {
    onToggleDay(businessId, config.dayOfWeek);
  }, [businessId, config.dayOfWeek, onToggleDay]);

  /**
   * Handle start time change
   */
  const handleStartTimeChange = useCallback(
    (newStartTime: string) => {
      updateStartTime(newStartTime);
    },
    [updateStartTime],
  );

  /**
   * Handle end time change
   */
  const handleEndTimeChange = useCallback(
    (newEndTime: string) => {
      updateEndTime(newEndTime);
    },
    [updateEndTime],
  );

  /**
   * Add a new closed interval
   */
  const handleAddClosedInterval = useCallback(
    (startTime: string, endTime: string) => {
      addClosedInterval(startTime, endTime);
    },
    [addClosedInterval],
  );

  /**
   * Save changes to the day configuration
   */
  const handleSave = useCallback(async () => {
    if (!editState) return;

    const payload: UpdateBusinessDayConfigPayload = {
      dayOfWeek: editState.dayOfWeek,
      startTime: editState.startTime,
      endTime: editState.endTime,
      closedIntervals: editState.closedIntervals,
      isOpen: editState.isOpen,
    };

    try {
      await onUpdateConfig(businessId, payload);
    } catch (error) {
      console.error('Error saving day config:', error);
    }
  }, [editState, businessId, onUpdateConfig]);

  /**
   * Toggle expanded view
   */
  const toggleExpanded = useCallback(() => {
    if (!isEditing) {
      setIsExpanded((prev) => !prev);
    }
  }, [isEditing]);

  /**
   * Navigate to day detail page
   */
  const handleDayClick = useCallback(() => {
    if (onDayClick && config.isOpen) {
      onDayClick(config.dayOfWeek);
    }
  }, [onDayClick, config.dayOfWeek, config.isOpen]);

  // Check if there are any validation errors
  const hasErrors = timeRangeError || intervalError;

  // Get day name abbreviation
  const dayAbbr = getDayName(config.dayOfWeek).substring(0, 3);
  const dayName = getDayName(config.dayOfWeek);

  /**
   * Calculate the number of available slots for a given time range and closed intervals
   */
  const calculateAvailableSlots = useCallback((startTime: string, endTime: string, closedIntervals: ClosedInterval[], intervalMinutes = 30) => {
    // Convert times to minutes for easier calculation
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const totalMinutes = endMinutes - startMinutes;

    // Calculate total slots without considering closed intervals
    const totalSlots = Math.floor(totalMinutes / intervalMinutes);

    // Calculate minutes blocked by closed intervals
    let blockedMinutes = 0;
    closedIntervals.forEach((interval) => {
      const intervalStart = timeToMinutes(interval.startTime);
      const intervalEnd = timeToMinutes(interval.endTime);
      blockedMinutes += intervalEnd - intervalStart;
    });

    const blockedSlots = Math.ceil(blockedMinutes / intervalMinutes);
    const availableSlots = totalSlots - blockedSlots;

    const periodRanges = [
      { id: 0, name: 'Morning', start: 240, end: 720 },
      { id: 1, name: 'Afternoon', start: 720, end: 960 },
      { id: 2, name: 'Evening', start: 960, end: 1140 },
      { id: 3, name: 'Night', start: 1140, end: 1680 },
    ];

    // Calculate slots per period
    const periodSlots = periodRanges.map((period) => {
      // Check if this period overlaps with the business hours
      const periodStart = Math.max(period.start, startMinutes);
      const periodEnd = Math.min(period.end, endMinutes);

      if (periodStart >= periodEnd) {
        // This period is not covered by business hours
        return { ...period, slots: 0, available: false };
      }

      // Calculate total slots for this period
      const periodTotalMinutes = periodEnd - periodStart;
      const periodTotalSlots = Math.floor(periodTotalMinutes / intervalMinutes);

      // Calculate blocked slots for this period
      let periodBlockedMinutes = 0;
      closedIntervals.forEach((interval) => {
        const intervalStart = Math.max(timeToMinutes(interval.startTime), periodStart);
        const intervalEnd = Math.min(timeToMinutes(interval.endTime), periodEnd);
        if (intervalStart < intervalEnd) {
          periodBlockedMinutes += intervalEnd - intervalStart;
        }
      });

      const periodBlockedSlots = Math.ceil(periodBlockedMinutes / intervalMinutes);
      const periodAvailableSlots = periodTotalSlots - periodBlockedSlots;

      return {
        ...period,
        slots: periodAvailableSlots,
        available: periodAvailableSlots > 0,
      };
    });

    return {
      totalSlots,
      availableSlots,
      periodSlots,
    };
  }, []);

  // Calculate total available slots
  const { availableSlots, totalSlots } = calculateAvailableSlots(config.startTime, config.endTime, config.closedIntervals);

  // Calculate percentage of available slots
  const availabilityPercentage = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'overflow-hidden rounded-xl border transition-all duration-300',
        isEditing ? 'ring-primary/20 border-primary/30 shadow-md ring-2' : 'border-gray-200',
        config.isOpen ? 'bg-white' : 'bg-gray-50',
        config.isOpen && !isEditing ? 'cursor-pointer hover:shadow-md' : '',
        isHovered && config.isOpen && !isEditing ? 'scale-[1.01] transform' : '',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={config.isOpen && !isEditing ? handleDayClick : undefined}
    >
      {/* Card header */}
      <div
        className={cn(
          'flex items-center justify-between p-4',
          config.isOpen
            ? isHovered && !isEditing
              ? 'from-primary-100 to-primary-50 bg-gradient-to-r'
              : 'from-primary-50 bg-gradient-to-r to-white'
            : 'bg-gray-50',
        )}
      >
        <div className="flex items-center gap-3">
          {/* Day indicator */}
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-all',
              config.isOpen ? (isHovered && !isEditing ? 'bg-primary shadow-md' : 'bg-primary') : 'bg-gray-200',
              config.isOpen ? 'text-white' : 'text-gray-500',
            )}
          >
            <Calendar className="h-5 w-5" />
            <span className="absolute mt-5 text-xs font-bold">{dayAbbr}</span>
          </div>

          {/* Day name and status */}
          <div>
            <h3
              onClick={() => navigate(`${config.dayOfWeek}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`${config.dayOfWeek}`)}
              className="text-base font-semibold text-gray-900"
            >
              {dayName}
            </h3>
            <div className="flex items-center gap-1.5">
              {config.isOpen ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-400" />}
              <span className={cn('text-xs', config.isOpen ? 'text-green-600' : 'text-gray-400')}>
                {config.isOpen ? 'Open for Bookings' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle switch */}
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={config.isOpen}
              onChange={handleToggleDay}
              disabled={isEditing}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="peer-checked:bg-primary peer-focus:ring-primary/30 h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-disabled:opacity-70"></div>
          </label>

          {/* Navigation arrow button */}
          {config.isOpen && !isEditing && onDayClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDayClick(config.dayOfWeek);
              }}
              className="text-primary hover:bg-primary/10 ml-1 rounded-full p-1.5 transition-colors"
              aria-label="View day details"
            >
              <div className="transform rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-1.5 shadow-md transition-transform hover:scale-110">
                <ArrowUpRight size={16} className="text-white" />
              </div>
            </button>
          )}

          {/* Expand/collapse button */}
          {config.isOpen && !isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
              className="ml-1 rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Quick info bar - only show if day is open and not expanded */}
      {config.isOpen && !isExpanded && !isEditing && (
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Clock8 size={14} className="text-primary" />
            <span className="text-xs text-gray-600">
              {config.startTime} - {config.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-full rounded-full',
                  availabilityPercentage > 70 ? 'bg-green-500' : availabilityPercentage > 30 ? 'bg-amber-500' : 'bg-red-500',
                )}
                style={{ width: `${availabilityPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-600">{availableSlots} slots</span>
          </div>
        </div>
      )}

      {/* Card content - only show if day is open */}
      {config.isOpen && (
        <AnimatePresence>
          {(isExpanded || isEditing) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 p-4">
                {/* View mode */}
                {!isEditing ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-medium text-gray-700">Business Hours:</span>
                        <span className="text-sm font-semibold">
                          {config.startTime} - {config.endTime}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditing();
                        }}
                        className="bg-primary-50 text-primary hover:bg-primary-100 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                    </div>

                    {/* Available periods with slots */}
                    <div className="mb-4 mt-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-500">Available Periods With Slots</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {calculateAvailableSlots(config.startTime, config.endTime, config.closedIntervals).periodSlots.map((period) => (
                          <div
                            key={period.id}
                            className={cn('rounded-md border p-2', period.available ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50')}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{period.name}</span>
                              <span className={cn('text-xs font-semibold', period.available ? 'text-green-600' : 'text-gray-400')}>
                                {period.slots} slots
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Display closed intervals if any */}
                    {config.closedIntervals.length > 0 && (
                      <div className="mt-3">
                        <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Closed Intervals</h4>
                        <div className="space-y-2">
                          {config.closedIntervals.map((interval, index) => (
                            <div key={index} className="flex items-center gap-2 rounded-md bg-gray-50 p-2.5 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                              <span className="font-medium text-gray-700">
                                {interval.startTime} - {interval.endTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Edit mode */
                  <div onClick={(e) => e.stopPropagation()}>
                    {/* Time range selector */}
                    {editState && (
                      <>
                        <TimeRangeSelector
                          startTime={editState.startTime}
                          endTime={editState.endTime}
                          onStartTimeChange={handleStartTimeChange}
                          onEndTimeChange={handleEndTimeChange}
                          error={timeRangeError}
                        />

                        {/* Closed intervals list */}
                        <ClosedIntervalList
                          intervals={editState.closedIntervals}
                          dayStartTime={editState.startTime}
                          dayEndTime={editState.endTime}
                          onAddInterval={handleAddClosedInterval}
                          onUpdateInterval={updateClosedInterval}
                          onRemoveInterval={removeClosedInterval}
                          error={intervalError}
                        />
                      </>
                    )}

                    {/* Action buttons */}
                    <div className="mt-5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="bg-primary hover:bg-primary-600 disabled:bg-primary-300 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors"
                        disabled={!!hasErrors}
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default memo(DayConfigCard);
