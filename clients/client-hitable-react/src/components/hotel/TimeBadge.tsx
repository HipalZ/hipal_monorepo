import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useElapsed, useTimeAgoTicking } from '../../hooks/useTime';

import { Clock } from 'lucide-react';

export function TimeAgoBadge({ createdAt }: { createdAt: string | number | Date }) {
  const relative = useTimeAgoTicking(createdAt, 30_000);
  const { hms, exact } = useElapsed(createdAt);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-1.5 py-1 pl-1.5 pr-2 text-[11px] font-medium leading-none" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Clock className="h-3.5 w-3.5 opacity-70" />
            <span>{relative}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="font-medium">{hms} elapsed</div>
          <div className="text-muted-foreground">Started: {exact}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
