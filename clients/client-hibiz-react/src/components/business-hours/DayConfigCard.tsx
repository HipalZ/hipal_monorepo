import type { BusinessDayConfig, ClosedInterval, UpdateBusinessDayConfigPayload } from '@/components/types/business-day-config';
import { getDayName, timeToMinutes } from '@/components/utils/timeUtils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, CheckCircle2, Clock8, XCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessDayConfigUIStore } from '../store/booking/businessDayConfigStore';

type DayConfigCardProps = {
  config: BusinessDayConfig;
  businessId: string;
  onToggleDay: (businessId: string, dayOfWeek: number) => Promise<void>;
  onUpdateConfig: (businessId: string, payload: UpdateBusinessDayConfigPayload) => Promise<void>;
  onDayClick?: (dayOfWeek: number) => void;
};

/**
 * Component for displaying and editing a single day configuration
 */
const DayConfigCard = ({ config}:DayConfigCardProps) => {
  // Local state for expanded view
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Get UI state and actions from store
  const { editingDayId } = useBusinessDayConfigUIStore((state) => ({
    editingDayId: state.editingDayId,
  }));

  // Check if this card is being edited
  const isEditing = editingDayId === config._id;

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
      onClick={() => navigate(`${config.dayOfWeek}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`${config.dayOfWeek}`)}
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
            <Calendar className="h-5 w-5 mb-4" />
            <span className="absolute mt-5 text-xs font-bold">{dayAbbr}</span>
          </div>

          {/* Day name and status */}
          <div>
            <h3
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

        <div className="flex items-center gap-2 p-4">
          <ArrowUpRight size={20} />
        </div>
      </div>
      {/* Quick info bar - only show if day is open and not expanded */}
      {config.isOpen && !isEditing && (
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
              />
            </div>
            <span className="text-xs font-medium text-gray-600">{availableSlots} slots</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(DayConfigCard);
