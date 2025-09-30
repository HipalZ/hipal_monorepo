import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type HeaderBarProps = {
  title: string;
  onBack?: () => void;
  className?: string;
  actions?: React.ReactNode; // buttons, filters, etc.
  subtitle?: React.ReactNode; 
  rightButton?: JSX.Element;
};

export default function HeaderBar({
  title,
  onBack,
  className,
  actions,
  subtitle,
  rightButton
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full bg-[#FFEFE2]/90 backdrop-blur supports-[backdrop-filter]:bg-[#FFEFE2]/70",
        "border-b border-black/5",
        className
      )}
    >
      {/* Top row: back + title */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 md:px-6 lg:px-8 py-3">
        {onBack ? (
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-9 shrink-0" />
        )}

        <div className="min-w-0 flex-1 text-center md:text-left">
          <h1 className="inter text-xl font-semibold text-gray-900 md:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <div className="mt-0.5 text-xs text-gray-600">{subtitle}</div>
          ) : null}
        </div>

        {/* Right spacer to keep title centered when back button exists */}
        <div className="w-9 shrink-0 md:w-[140px]" />
        <div className="absolute text-sm right-6">{rightButton}</div>
      </div>

      {/* Actions row */}
      {actions ? (
        <>
          <Separator />
          <div className="mx-auto max-w-7xl px-3 md:px-6 lg:px-8">
            <div
              className={cn(
                "flex items-center gap-2 py-3",
                "flex-wrap md:flex-nowrap",
                "overflow-x-auto md:overflow-visible"
              )}
            >
              {actions}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
