import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { memo } from 'react';
import { useElapsed, useTimeAgoTicking } from '../../hooks/useTime';

const RingClock = memo(function RingClock({ createdAt }: { createdAt: string | number | Date }) {
  const { s, m, hms, exact } = useElapsed(createdAt);
  const relative = useTimeAgoTicking(createdAt, 30_000);

  // progress of current minute (0..1)
  const progress = s / 60;
  const ring = `conic-gradient(currentColor ${progress * 360}deg, hsl(var(--muted)) 0)`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2" aria-live="polite">
            <div
              className="relative inline-grid h-7 w-7 place-items-center text-emerald-600"
              style={{ backgroundImage: ring, borderRadius: '9999px' }}
            >
              <div className="bg-background grid h-[22px] w-[22px] place-items-center rounded-full text-[10px] font-semibold">{m}</div>
            </div>
            <span className="text-muted-foreground text-[11px]">{relative}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="font-medium">{hms} elapsed</div>
          <div className="text-muted-foreground">Started: {exact}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export { RingClock };
