import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getDayName } from '@/components/utils/timeUtils';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Edit } from 'lucide-react';
import { memo } from 'react';

type DayStatusCardProps = {
  dayConfig: any;
  onToggleDay: () => Promise<void>;
  onEditDay: () => void;
};

const DayStatusCard = ({ dayConfig, onToggleDay, onEditDay }: DayStatusCardProps) => {
  if (!dayConfig) return null;

  const isOpen = dayConfig.isOpen;

  return (
    <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-white to-gray-50 shadow-lg">
      <CardContent className="p-0">
        <div className="relative">
          {/* Status indicator bar */}
          <div
            className={`absolute left-0 top-0 h-1 w-full ${
              isOpen ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'
            }`}
          />

          <div className="flex flex-col md:flex-row">
            {/* Left section with day info */}
            <div className="flex-1 p-6 pt-8">
              <div className="mb-5 flex items-center">
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${isOpen ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="ml-3 text-2xl font-bold">{getDayName(dayConfig.dayOfWeek)}</h3>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <span className={`text-sm font-medium ${isOpen ? 'text-green-600' : 'text-gray-500'}`}>{isOpen ? 'Open' : 'Closed'}</span>
                  <Switch
                    checked={isOpen}
                    onCheckedChange={onToggleDay}
                    className={`${isOpen ? 'bg-green-500' : ''} data-[state=checked]:bg-green-500`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Business hours */}
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-sm text-gray-500">Business Hours</p>
                    <div className="flex items-center">
                      <span className="font-semibold">{dayConfig?.startTime || '00:00'}</span>
                      <ArrowRight className="mx-2 h-3.5 w-3.5 text-gray-400" />
                      <span className="font-semibold">{dayConfig?.endTime || '00:00'}</span>
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center">
                  <motion.div
                    className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${isOpen ? 'bg-green-50' : 'bg-gray-100'}`}
                    animate={{ scale: isOpen ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: isOpen ? Number.POSITIVE_INFINITY : 0, duration: 2 }}
                  >
                    <div className={`h-5 w-5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </motion.div>
                  <div>
                    <p className="mb-0.5 text-sm text-gray-500">Current Status</p>
                    <p className={`font-semibold ${isOpen ? 'text-green-600' : 'text-gray-600'}`}>
                      {isOpen ? 'Open for Bookings' : 'Closed for Bookings'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section with edit button */}
            <div className="flex items-center justify-center border-t bg-gray-50 p-6 md:w-48 md:border-l md:border-t-0">
              <Button className='w-full' onClick={onEditDay}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(DayStatusCard);
