// components/common/RefreshButton.tsx
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type RefreshButtonProps = {
  isLoading?: boolean;
  label?: string;
  icon?: ReactNode;
  spinDurationMs?: number;
} & ComponentProps<typeof Button>;

export function RefreshButton({
  isLoading = false,
  label = 'Refresh',
  icon,
  spinDurationMs = 3000,
  className,
  disabled,
  ...buttonProps
}: RefreshButtonProps) {
  const effectiveDisabled = disabled ?? isLoading;

  const defaultIcon = (
    <RefreshCcw
      className={cn(
        'h-4 w-4 text-slate-700',
        isLoading && 'animate-spin'
      )}
      style={
        isLoading
          ? { animationDuration: `${spinDurationMs}ms` }
          : undefined
      }
    />
  );

  const Icon = icon ?? defaultIcon;

  return (
    <Button
      type="button"
      {...buttonProps}
      disabled={effectiveDisabled}
      className={cn(
        'inline-flex items-center gap-2',
        className
      )}
    >
      {Icon}
      {label && (
        <span className="text-sm font-medium">
          {label}
        </span>
      )}
    </Button>
  );
}
