import { useAddTips, useRemoveTips } from '@/components/hooks/api/useTips.ts';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

interface BillData {
  tips: number;
  subTotal?: number;
}

interface TipsModalProps {
  data: BillData;
  onClose: () => void;
}

const MemoTipsModal = ({ data, onClose }: TipsModalProps) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const selectedBill = useOrderStore((s) => s.selectedBill);
  const { captainData: userData } = useHiClientZ();

  // If you support split bills, you can adapt this 'currentBill' just like in service charge modal
  const currentBill = useMemo(() => selectedBill || (data as any), [selectedBill, data]);

  // Effective subtotal (prefer selectedBill, fallback to data)
  const effectiveSubTotal = useMemo(() => {
    const billSub = (selectedBill as any)?.subTotal;
    if (typeof billSub === 'number' && billSub > 0) return billSub;
    if (typeof data.subTotal === 'number' && data.subTotal > 0) return data.subTotal;
    return 0;
  }, [selectedBill, data.subTotal]);

  const isTipApplied = (data.tips ?? 0) > 0;

  // Local state for tips amount
  const [tipAmount, setTipAmount] = useState<number>(data.tips || 0);

  const { addingTipsLoader, addingTips } = useAddTips(currentBill);
  const { removingTipsLoader, removingTips } = useRemoveTips(currentBill);

  const tipPercent = useMemo(() => {
    if (!effectiveSubTotal || !tipAmount) return 0;
    return (tipAmount / effectiveSubTotal) * 100;
  }, [tipAmount, effectiveSubTotal]);

  const handleChangeTipAmount = (value: string) => {
    const num = Number(value);
    const clean = Number.isNaN(num) ? 0 : num;
    setTipAmount(clean);
  };

  // ✅ Add / update tips (send rupee amount; adjust payload to your API)
  const handleSaveTips = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    if (tipAmount <= 0) {
      toast.error('Please enter a valid tip amount.');
      return;
    }

    try {
      // 🔹 Adjust payload keys to match your backend type
      await addingTips({
        businessId,
        tableName: selectedTable.name,
        value: tipAmount,
      } as any);

      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to apply tips.');
    }
  }, [businessId, selectedTable?.name, userData?._id, tipAmount, addingTips, onClose]);

  // ✅ Remove tips
  const handleRemoveTips = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    try {
      // 🔹 Adjust payload keys to match your backend type
      const res = await removingTips({
        businessId,
        tableName: selectedTable.name,
        tipsRemovedBy: userData._id,
      } as any);

      if ((res as any)?.status === 200 || (res as any)?.ok) {
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove tips.');
    }
  }, [businessId, selectedTable?.name, userData?._id, removingTips, onClose]);

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Tips</h3>

      {/* Info */}
      {isTipApplied ? (
        <p className="text-sm text-gray-600">
          Currently added tip: ₹{data.tips}
          {effectiveSubTotal > 0 && (
            <>
              {' '}
              ({((data.tips / effectiveSubTotal) * 100).toFixed(2).replace(/\.00$/, '')}% of ₹{effectiveSubTotal})
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-gray-600">No tips have been added to this bill yet.</p>
      )}

      {/* Tips input */}
      <div className="space-y-2 rounded-md border border-gray-200 p-3">
        <Label htmlFor="tip-amount">Tip Amount (₹)</Label>
        <Input
          id="tip-amount"
          type="number"
          min={0}
          value={Number.isNaN(tipAmount) ? '' : tipAmount}
          onChange={(e) => handleChangeTipAmount(e.target.value)}
          className="mt-1"
        />
        {effectiveSubTotal > 0 && tipAmount > 0 && (
          <p className="text-xs text-gray-500">
            ≈ {tipPercent.toFixed(2)}% of subtotal ₹{effectiveSubTotal}
          </p>
        )}

        <Button onClick={handleSaveTips} disabled={addingTipsLoader || tipAmount <= 0} className="w-full">
          {addingTipsLoader ? (isTipApplied ? 'Updating Tips...' : 'Adding Tips...') : isTipApplied ? 'Update Tips' : 'Add Tips'}
        </Button>
      </div>

      {/* Remove tips (only when something is applied) */}
      {isTipApplied && (
        <div className="border-t pt-4">
          <Button onClick={handleRemoveTips} disabled={removingTipsLoader} className="w-full" variant="destructive">
            {removingTipsLoader ? 'Removing Tips...' : 'Remove Tips'}
          </Button>
        </div>
      )}
    </div>
  );
};

const TipsModal = memo(MemoTipsModal);
export default TipsModal;
