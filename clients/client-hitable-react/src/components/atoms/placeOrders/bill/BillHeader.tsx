import { useStaffPermissionStore } from '@/components/store/usePermissions';
import type { IBillData } from '@/components/types/hiClientzData.ts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ReceiptText } from 'lucide-react';
import { memo } from 'react';
import { BiSync } from 'react-icons/bi';

interface BillHeaderProps {
  isSplitBill: boolean;
  selectedBill: IBillData | null;
  onBackToGrid: () => void;
  onReprintBill: () => void;
  onShowEBill: () => void;
}

const BillHeader = memo(({ isSplitBill, selectedBill, onBackToGrid, onReprintBill, onShowEBill }: BillHeaderProps) => {
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canPrintBill = hasPermission('print_bill');
  const canEBill = hasPermission('e_bill');

  return (
    <CardHeader className="p-2 md:p-6">
      <CardTitle className="flex flex-nowrap items-center justify-between">
        <div className="flex items-center gap-2">
          {isSplitBill && (
            <Button variant="ghost" size="sm" onClick={onBackToGrid} className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span>Bill Summary</span>
          {isSplitBill && selectedBill && <Badge variant="secondary">#{selectedBill.variantName}</Badge>}
        </div>
        <section className="-mb-14 flex flex-col space-y-4 md:-mr-4">
          {canEBill && (
            <Button size="sm" variant="outline" onClick={onShowEBill}>
              <ReceiptText />
              E-Bill
            </Button>
          )}
          {canPrintBill && (
            <Button size="sm" variant="outline" onClick={onReprintBill}>
              <BiSync />
              Print Bill
            </Button>
          )}
        </section>
      </CardTitle>
    </CardHeader>
  );
});

BillHeader.displayName = 'BillHeader';
export default BillHeader;
