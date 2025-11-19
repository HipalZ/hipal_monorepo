import type { IBillData } from '@/components/types/hiClientzData.ts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, User } from 'lucide-react';
import type { FC } from 'react';
import { memo, useMemo } from 'react';
import type { ActionHistoryItem } from './bill.types.ts';

interface ActionHistoryProps {
  currentBill: IBillData;
}

const ActionHistory: FC<ActionHistoryProps> = memo(({ currentBill }) => {
  const actions = useMemo((): ActionHistoryItem[] => {
    const actionList: ActionHistoryItem[] = [];

    if (currentBill.discountAppliedBy) {
      actionList.push({
        type: 'Discount Applied',
        user: currentBill.discountAppliedBy,
        details: `₹${currentBill.discount} discount applied ${currentBill.discountAppliedOn === 'ON_DISH' ? 'on specific items' : 'on entire bill'}`,
        reason: currentBill.reasonOfDiscount,
        color: 'bg-red-50 border-red-200 text-red-800',
        badgeColor: 'bg-red-100 text-red-800',
      });
    }

    if (currentBill.discountRemovedBy) {
      actionList.push({
        type: 'Discount Removed',
        user: currentBill.discountRemovedBy,
        details: 'Previous discount has been removed from the bill',
        color: 'bg-green-50 border-green-200 text-green-800',
        badgeColor: 'bg-green-100 text-green-800',
      });
    }

    if (currentBill.serviceChargeAppliedBy) {
      actionList.push({
        type: 'Service Charge Applied',
        user: currentBill.serviceChargeAppliedBy,
        details: `₹${currentBill.serviceCharge} service charge added to the bill`,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        badgeColor: 'bg-blue-100 text-blue-800',
      });
    }

    if (currentBill.serviceChargeRemovedBy) {
      actionList.push({
        type: 'Service Charge Removed',
        user: currentBill.serviceChargeRemovedBy,
        details: 'Service charge has been removed from the bill',
        reason: currentBill.reasonOfServiceCharge,
        color: 'bg-red-50 border-red-200 text-red-800',
        badgeColor: 'bg-red-100 text-red-800',
      });
    }

    if (currentBill.claimedCoins > 0) {
      actionList.push({
        type: 'Loyalty Coins Applied',
        user: 'Customer',
        details: `₹${currentBill.claimedCoins} loyalty coins redeemed`,
        color: 'bg-purple-50 border-purple-200 text-purple-800',
        badgeColor: 'bg-purple-100 text-purple-800',
      });
    }

    if (currentBill.couponDiscount > 0) {
      actionList.push({
        type: 'Coupon Applied',
        user: 'System',
        details: `₹${currentBill.couponDiscount} coupon discount applied`,
        color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
        badgeColor: 'bg-indigo-100 text-indigo-800',
      });
    }

    return actionList;
  }, [currentBill]);

  if (actions.length === 0) return null;

  return (
    <Card className="border-none !p-0 shadow-none">
      <CardContent className="border-none !p-0 shadow-none">
        {actions.map((action, index) => (
          <Alert key={index} className={`${action.color} mb-1 border-l-4`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold">{action.type}</span>
                    <Badge className={action.badgeColor}>
                      <User className="mr-1 h-3 w-3" />
                      {action.user}
                    </Badge>
                  </div>
                  <p className="text-sm">{action.details}</p>
                  {action.reason && <p className="mt-1 text-xs opacity-80">Reason: {action.reason}</p>}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
});

ActionHistory.displayName = 'ActionHistory';
export default ActionHistory;
