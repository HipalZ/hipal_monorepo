import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getCartItemLineTotal } from '@/components/utils/cartPricing';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, Package, Timer } from 'lucide-react';
import { memo } from 'react';

interface Alert {
  _id: string;
  serviceIds: Array<{ name: string; avgAcceptanceTime: number; avgDeliveryTime: number }>;
  createdAt: number;
  acceptedAt: number;
  deliveredAt: number;
  isEscalated: boolean;
  level: number;
  cart?: Array<{ quantity: number; dish: { name: string; price: number }; portion?: { name?: string; price?: number } | null; extras?: Array<{ price?: number; quantity?: number }> }>;
}

interface Props {
  servicesData: Alert[];
  setIsDialogOpen: (isOpen: boolean) => void;
}

const minsToHours = (minutes: number) => (minutes / 60).toFixed(2);

const formatMinutes = (minutes: number) => {
  if (minutes < 1) return `${Math.round(minutes * 60)} sec`;
  const rounded = Math.round(minutes * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} min`;
};

const buildOrderItems = (cart?: Alert['cart']) =>
  cart?.length
    ? cart
        .map((item) => {
          const portionName = item?.portion?.name ? ` - ${item.portion.name}` : '';
          return `${item?.quantity ?? 1}x ${item?.dish?.name || 'Item'}${portionName}`;
        })
        .join(' | ')
    : '';

const MemoizedServicesData = ({ servicesData, setIsDialogOpen }: Props) => {
  const totalActiveMinutes = servicesData.reduce((sum, alert) => {
    const acceptM = (alert.acceptedAt - alert.createdAt) / 1000 / 60;
    const deliverM = (alert.deliveredAt - alert.acceptedAt) / 1000 / 60;
    return sum + acceptM + deliverM;
  }, 0);

  const totalActiveHours = minsToHours(totalActiveMinutes);

  return (
    <div className="bg-card flex h-full max-h-[80vh] flex-col overflow-hidden rounded-lg border shadow-lg">
      {/* Sticky Header - Now Shows Total Active Hours */}
      <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Service History</h2>
          <Badge variant="outline" className="flex items-center gap-1 text-sm font-medium">
            <Timer className="h-4 w-4" />
            Total Active: {totalActiveHours} hrs
          </Badge>
        </div>
        <Button size="sm" variant="destructive" onClick={() => setIsDialogOpen(false)} className="text-white">
          Close
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 !overflow-y-auto px-4 py-3">
        {servicesData.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">No services found.</p>
        ) : (
          <div className="space-y-4 pb-4">
            {servicesData.map((alert) => {
              const svc = alert.serviceIds[0];
              const hasCart = Boolean(alert.cart?.length);
              const serviceName = svc?.name || (hasCart ? 'Food Order' : '—');
              const orderItems = buildOrderItems(alert.cart);
              const serviceAcceptSla = svc?.avgAcceptanceTime ?? (hasCart ? 2 : 0);
              const foodPrepMins = hasCart ? alert.cart?.reduce((max, item) => Math.max(max, Number((item?.dish as any)?.avgPrepTime || 0)), 0) || 0 : 0;
              const serviceDeliverSla = svc?.avgDeliveryTime ?? (hasCart ? foodPrepMins || 30 : 0);
              const acceptM = (alert.acceptedAt - alert.createdAt) / 1000 / 60;
              const deliverM = (alert.deliveredAt - alert.acceptedAt) / 1000 / 60;
              const lateAccept = serviceAcceptSla > 0 && acceptM > serviceAcceptSla;
              const lateDeliver = serviceDeliverSla > 0 && deliverM > serviceDeliverSla;

              return (
                <Card key={alert._id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-base font-medium">{serviceName}</CardTitle>
                      </div>
                      {alert.isEscalated && (
                        <Badge variant="destructive" className="text-xs">
                          Level {alert.level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">Requested {formatDistanceToNow(alert.createdAt, { addSuffix: true })}</p>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className={cn('h-4 w-4', lateAccept ? 'text-red-500' : 'text-green-500')} />
                        <div>
                          <strong>{formatMinutes(acceptM)}</strong> to accept
                          {lateAccept && <span className="ml-1 text-xs text-red-500">(slow)</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className={cn('h-4 w-4', lateDeliver ? 'text-red-500' : 'text-green-500')} />
                        <div>
                          <strong>{formatMinutes(deliverM)}</strong> to deliver
                          {lateDeliver && <span className="ml-1 text-xs text-red-500">(slow)</span>}
                        </div>
                      </div>
                    </div>

                    {alert.cart && alert.cart.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs font-medium">Food Order</p>
                          {orderItems ? <p className="mb-2 text-xs font-medium text-slate-700">{orderItems}</p> : null}
                          <ul className="space-y-1 text-xs">
                            {alert.cart.map((item, i) => (
                              <li key={i} className="flex justify-between">
                                <span>
                                  • {item.quantity}x {item.dish.name}
                                </span>
                                <span className="font-medium">₹{getCartItemLineTotal(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

const ServicesData = memo(MemoizedServicesData);
export default ServicesData;
