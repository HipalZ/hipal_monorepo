import type { BusinessDayConfig } from '@/components/types/business-day-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Edit, Plus } from 'lucide-react';
import { memo } from 'react';

type ClosedIntervalsSectionProps = {
  dayConfig: BusinessDayConfig;
  onEditDay: () => void;
};

const ClosedIntervalsSection = ({ dayConfig, onEditDay }: ClosedIntervalsSectionProps) => {
  const hasClosedIntervals = dayConfig.closedIntervals && dayConfig.closedIntervals.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Closed Intervals</CardTitle>
        <Button variant="outline" size="sm" onClick={onEditDay}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Interval
        </Button>
      </CardHeader>
      <CardContent>
        {!hasClosedIntervals ? (
          <div className="flex h-24 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
            <Clock className="mb-2 h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-500">No closed intervals configured</p>
            <p className="text-xs text-gray-400">Add closed intervals to block specific time ranges during business hours</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayConfig.closedIntervals.map((interval, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {interval?.startTime}- {interval.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                 
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-500" onClick={onEditDay}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(ClosedIntervalsSection);
