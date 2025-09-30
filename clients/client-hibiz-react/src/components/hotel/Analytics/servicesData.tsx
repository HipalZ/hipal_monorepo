import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { memo } from 'react';

interface Props {
  servicesData: string[];
  setIsDialogOpen: (isOpen: boolean) => void;
}

const MemoizedServicesData = ({ servicesData, setIsDialogOpen }: Props) => {
  return (
    <div className="bg-card relative flex h-full max-h-96 flex-col overflow-hidden rounded-lg border shadow-md">
      <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight">Services</h2>
        <Button size="sm" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-destructive">
          ✕
        </Button>
      </div>
      <div className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent flex-1 overflow-y-auto px-4 py-3">
        {servicesData.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">No services found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {servicesData.map((service, index) => (
              <Badge
                key={index?.toString()}
                variant="outline"
                className="rounded-full px-3 py-1 text-sm font-medium transition-transform hover:scale-105"
              >
                {service}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ServicesData = memo(MemoizedServicesData);
export default ServicesData;
