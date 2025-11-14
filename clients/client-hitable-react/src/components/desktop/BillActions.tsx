import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BadgePercent, Percent, Split } from 'lucide-react';
import { memo, useCallback } from 'react';

interface BillActionsProps {
  discount?: number;
  serviceCharge?: number;
}

const MemoBillActions = ({ discount = 0, serviceCharge = 0 }: BillActionsProps) => {
  const setActiveModal = useOrderStore((s) => s.setActiveModal);
  const isBillSplit = useOrderStore((s) => s.isBillSplit);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);

  // 🔐 Permission checks
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);

  const canDiscount = hasPermission('add_discount');
  const canServiceCharge = hasPermission('add_or_remove_service_charge');
  const canSplit = hasPermission('split_bill');

  const openMoreOptions = useCallback(
    (option: 'discount' | 'serviceCharge' | 'split') => {
      setActiveModal(option);
      setShowMoreOption(true);
    },
    [setActiveModal, setShowMoreOption],
  );

  return (
    <TooltipProvider>
      <div className="bg-background flex items-center justify-around gap-2 border-t p-3">
        {/* 🟡 Discount Button */}
        {canDiscount && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[6.5rem] bg-transparent font-semibold hover:border-amber-300 hover:bg-amber-50"
                onClick={() => openMoreOptions('discount')}
              >
                <BadgePercent className="h-5 w-5 text-amber-600" strokeWidth={2.5} />
                Discount
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Add or Remove Discount</p>
              <p className="text-muted-foreground text-xs">Current: ₹{discount}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 🔵 Service Charge */}
        {canServiceCharge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[8.5rem] bg-transparent font-semibold hover:border-cyan-300 hover:bg-cyan-50"
                onClick={() => openMoreOptions('serviceCharge')}
              >
                <Percent className="h-5 w-5 text-cyan-600" strokeWidth={2.5} />
                Service Charge
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Add or Remove Service Charge</p>
              <p className="text-muted-foreground text-xs">Current: ₹{serviceCharge}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 🟣 Split Bill */}
        {!isBillSplit && canSplit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[6.5rem] bg-transparent font-semibold hover:border-indigo-300 hover:bg-indigo-50"
                onClick={() => openMoreOptions('split')}
              >
                <Split className="h-5 w-5 text-indigo-600" strokeWidth={2.5} />
                Split Bill
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Split Bill</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

const BillActions = memo(MemoBillActions);
export default BillActions;
