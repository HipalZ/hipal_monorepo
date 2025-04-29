import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import ClosedIntervalList from '@/components/business-hours/ClosedIntervalList';
import TimeRangeSelector from '@/components/business-hours/TimeRangeSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { memo } from 'react';
import type { ClosedInterval } from '../types/business-day-config.ts';
import { Button } from '../ui/button.tsx';

type EditDayModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dayConfig: any;
  editState: any;
  timeRangeError: string | null;
  intervalError: string | null;
  isUpdating: boolean;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onAddInterval: () => void;
  onUpdateInterval: (index: number, interval: ClosedInterval) => boolean;
  onRemoveInterval: (index: number) => void;
  onSave: () => Promise<void>;
};

const EditDayModal = ({
  isOpen,
  onOpenChange,
  editState,
  timeRangeError,
  intervalError,
  onStartTimeChange,
  onEndTimeChange,
  onAddInterval,
  onUpdateInterval,
  onRemoveInterval,
  onSave,
}: EditDayModalProps) => {
  if (!editState) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="h-[100vh] overflow-y-auto pb-[10rem] md:h-[85dvh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Edit Day Settings</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Business Hours */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Business Hours</Label>
                <p className="text-sm text-gray-500">Set the operating hours for this day</p>
              </div>

              <TimeRangeSelector
                startTime={editState.startTime}
                endTime={editState.endTime}
                onStartTimeChange={onStartTimeChange}
                onEndTimeChange={onEndTimeChange}
                error={timeRangeError}
              />
            </div>

            {/* Closed Intervals */}
            <div className="space-y-4">
              {intervalError && (
                <Alert variant="destructive">
                  <AlertDescription>{intervalError}</AlertDescription>
                </Alert>
              )}

              <ClosedIntervalList
                intervals={editState.closedIntervals}
                dayStartTime={editState.startTime}
                dayEndTime={editState.endTime}
                onAddInterval={onAddInterval}
                onUpdateInterval={onUpdateInterval}
                onRemoveInterval={onRemoveInterval}
              />
            </div>
          </div>

          <section className='flex gap-4'>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
              Cancel
            </Button>
            <Button onClick={onSave} className="w-full">
              Save
            </Button>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(EditDayModal);
