import { useAddServiceCharge, useEditServiceCharge, useRemoveServiceCharge } from '@/components/hooks/api/useServiceCharge.ts';
import { useIsPasswordActive } from '@/components/hooks/usePasswordManager';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lock } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

interface BillData {
  serviceCharge: number;
  serviceChargeAppliedBy: string;
  serviceChargeRemovedBy: string;
  subTotal?: number;
  serviceChargePercentage?: number;
}

interface ServiceChargeModalProps {
  data: BillData;
  onClose: () => void;
}

// 🔹 Predefined reasons for removing service charge
const QUICK_SERVICE_REMOVE_REASONS = ['Guest request', 'Goodwill gesture', 'Manager approval – special guest'];

type ServiceChargeMode = 'amount' | 'percentage';

const MemoServiceChargeModal = ({ data, onClose }: ServiceChargeModalProps) => {
  const { businessId } = useParams();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const selectedBill = useOrderStore((s) => s.selectedBill);
  const { captainData: userData } = useHiClientZ();

  // Split-bill placeholder (kept to match your older pattern)
  const isSplitBill = useMemo(() => Array.isArray(data), [data]);
  const currentBill = useMemo(() => selectedBill || (isSplitBill ? null : (data as any)), [selectedBill, isSplitBill, data]);

  // Effective subtotal from selectedBill or modal data
  const effectiveSubTotal = useMemo(() => {
    const billSub = (selectedBill as any)?.subTotal;
    if (typeof billSub === 'number' && billSub > 0) return billSub;
    if (typeof data.subTotal === 'number' && data.subTotal > 0) return data.subTotal;
    return 0;
  }, [selectedBill, data.subTotal]);

  // Password management hook - only for removing service charge
  const { isLoading: isPasswordLoading, isActive: isPasswordActive } = useIsPasswordActive('SERVICE_CHARGE');

  const isServiceChargeApplied = data.serviceCharge > 0;

  // 🔹 Initial percentage based on existing data
  const initialPercent = useMemo(() => {
    if (typeof data.serviceChargePercentage === 'number') {
      return data.serviceChargePercentage;
    }
    if (!effectiveSubTotal || !data.serviceCharge) return 0;
    return (data.serviceCharge / effectiveSubTotal) * 100;
  }, [data.serviceCharge, data.serviceChargePercentage, effectiveSubTotal]);

  // 🔹 Mode: amount (₹) or percentage (%)
  const [mode, setMode] = useState<ServiceChargeMode>('amount');

  // Separate states for amount & percentage; kept in sync when one changes
  const [amountInput, setAmountInput] = useState<number>(data.serviceCharge || 0);
  const [percentInput, setPercentInput] = useState<number>(Number.isFinite(initialPercent) ? Number(initialPercent.toFixed(2)) : 0);

  const [serviceChargeReason, setServiceChargeReason] = useState<string>('');
  const [removePassword, setRemovePassword] = useState<string>('');

  const { addingServiceChargeLoader, addingServiceCharge } = useAddServiceCharge(currentBill);
  const { removingServiceChargeLoader, removingServiceCharge } = useRemoveServiceCharge(currentBill);
  const { editingServiceChargeLoader, editingServiceCharge } = useEditServiceCharge(currentBill);

  // For display: ensure we always show consistent derived values
  const derivedPercentFromAmount = useMemo(() => {
    if (!effectiveSubTotal || !amountInput) return 0;
    return (amountInput / effectiveSubTotal) * 100;
  }, [amountInput, effectiveSubTotal]);

  const derivedAmountFromPercent = useMemo(() => {
    if (!effectiveSubTotal || !percentInput) return 0;
    return (percentInput / 100) * effectiveSubTotal;
  }, [percentInput, effectiveSubTotal]);

  // ********** HANDLERS **********

  const handleChangeMode = (nextMode: ServiceChargeMode) => {
    if (nextMode === mode) return;
    // If subtotal is missing, percentage mode is not usable
    if (nextMode === 'percentage' && !effectiveSubTotal) {
      toast.error('Subtotal not available. Percentage mode is disabled.');
      return;
    }
    setMode(nextMode);
  };

  // Amount input change → update amount + auto-sync percentage
  const handleAmountChange = (value: string) => {
    const num = Number(value);
    const clean = Number.isNaN(num) ? 0 : num;
    setAmountInput(clean);

    if (effectiveSubTotal > 0) {
      const p = (clean / effectiveSubTotal) * 100;
      setPercentInput(Number(p.toFixed(2)));
    }
  };

  // Percentage input change → update percent + auto-sync amount
  const handlePercentChange = (value: string) => {
    const num = Number(value);
    const clean = Number.isNaN(num) ? 0 : num;
    setPercentInput(clean);

    if (effectiveSubTotal > 0) {
      const amt = (clean / 100) * effectiveSubTotal;
      setAmountInput(Number(amt.toFixed(2)));
    }
  };

  // ✅ Default service charge button – uses backend default business config (e.g. 20%)
  const handleAddDefaultServiceCharge = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    try {
      await addingServiceCharge({
        businessId,
        tableName: selectedTable.name,
        serviceChargeAppliedBy: userData._id,
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add default service charge.');
    }
  }, [businessId, selectedTable?.name, userData?._id, addingServiceCharge, onClose]);

  // ✅ Custom service charge save – amount OR % → always send % to backend
  const handleSaveCustomServiceCharge = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id) {
      return;
    }

    if (!effectiveSubTotal) {
      toast.error('Subtotal is missing. Cannot apply custom service charge.');
      return;
    }

    let finalPercent = 0;

    if (mode === 'amount') {
      if (amountInput <= 0) {
        toast.error('Please enter a valid service charge amount.');
        return;
      }
      if (amountInput > effectiveSubTotal) {
        toast.error('Service charge amount cannot be more than subtotal.');
        return;
      }

      finalPercent = (amountInput / effectiveSubTotal) * 100;
    } else {
      if (percentInput <= 0) {
        toast.error('Please enter a valid service charge percentage.');
        return;
      }
      if (percentInput > 100) {
        toast.error('Service charge percentage cannot be more than 100%.');
        return;
      }
      finalPercent = percentInput;
    }

    if (finalPercent <= 0 || finalPercent > 100) {
      toast.error('Service charge must be between 0% and 100% of subtotal.');
      return;
    }

    try {
      await editingServiceCharge({
        businessId,
        tableName: selectedTable.name,
        serviceChargeAppliedBy: userData._id,
        value: finalPercent,
      });

      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update custom service charge.');
    }
  }, [businessId, selectedTable?.name, userData?._id, effectiveSubTotal, mode, amountInput, percentInput, editingServiceCharge, onClose]);

  // ✅ Remove service charge
  const handleRemoveServiceCharge = useCallback(async () => {
    if (!businessId || !selectedTable?.name || !userData?._id || !serviceChargeReason) {
      return;
    }

    if (isPasswordActive && !removePassword.trim()) {
      toast.error('Please enter the remove service charge password.');
      return;
    }

    try {
      const payload: any = {
        businessId,
        tableName: selectedTable.name,
        serviceChargeRemovedBy: userData._id,
        reasonOfServiceCharge: serviceChargeReason,
      };

      if (isPasswordActive) {
        payload.password = removePassword;
      }

      const res = await removingServiceCharge(payload);
      if (res.status === 200) {
        setServiceChargeReason('');
        setRemovePassword('');
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove service charge.');
    }
  }, [businessId, selectedTable?.name, userData?._id, serviceChargeReason, removingServiceCharge, isPasswordActive, removePassword, onClose]);

  // ********** LOADING STATE **********
  if (isPasswordLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  // ********** RENDER **********
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Service Charge Management</h3>

      {/* Info */}
      {isServiceChargeApplied ? (
        <p className="text-sm text-gray-600">
          Currently applied service charge: ₹{data.serviceCharge}
          {effectiveSubTotal > 0 && (
            <>
              {' '}
              ({((data.serviceCharge / effectiveSubTotal) * 100).toFixed(2).replace(/\.00$/, '')}% of ₹{effectiveSubTotal})
            </>
          )}
        </p>
      ) : (
        <p className="text-sm text-gray-600">No service charge is currently applied.</p>
      )}

      {/* Default service charge (only if not yet applied) */}
      {!isServiceChargeApplied && (
        <div className="space-y-2 rounded-md border border-dashed border-gray-300 p-3">
          <p className="text-xs text-gray-500">
            Apply the <span className="font-semibold">default service charge</span> set by this business (e.g., 10% of the bill amount).
          </p>
          <Button onClick={handleAddDefaultServiceCharge} disabled={addingServiceChargeLoader} className="w-full">
            {addingServiceChargeLoader ? 'Applying Default Service Charge...' : 'Apply Default Service Charge'}
          </Button>
        </div>
      )}

      {/* Custom section: Amount / Percentage toggle */}
      <div className="space-y-3 rounded-md border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-800">Custom Service Charge</p>
          <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1">
            <Button
              type="button"
              size="xs"
              variant={mode === 'amount' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs"
              onClick={() => handleChangeMode('amount')}
            >
              ₹ Amount
            </Button>
            <Button
              type="button"
              size="xs"
              variant={mode === 'percentage' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs"
              onClick={() => handleChangeMode('percentage')}
              disabled={!effectiveSubTotal}
            >
              % Percentage
            </Button>
          </div>
        </div>

        {/* Amount input */}
        {mode === 'amount' && (
          <div className="space-y-1">
            <Label htmlFor="sc-amount">Amount (₹)</Label>
            <Input
              id="sc-amount"
              type="number"
              min={0}
              value={Number.isNaN(amountInput) ? '' : amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="mt-1 text-base font-semibold"
            />
            {effectiveSubTotal > 0 && amountInput > 0 && (
              <p className="text-primary text-sm font-semibold opacity-75">
                ≈ {derivedPercentFromAmount.toFixed(2)}% of subtotal ₹{effectiveSubTotal} (max allowed: ₹{effectiveSubTotal})
              </p>
            )}
          </div>
        )}

        {/* Percentage input */}
        {mode === 'percentage' && (
          <div className="space-y-1">
            <Label htmlFor="sc-percent">Percentage (%)</Label>
            <Input
              id="sc-percent"
              type="number"
              min={0}
              max={100}
              value={Number.isNaN(percentInput) ? '' : percentInput}
              onChange={(e) => handlePercentChange(e.target.value)}
              className="mt-1 text-base font-semibold"
            />
            {effectiveSubTotal > 0 && percentInput > 0 && (
              <p className="text-primary text-sm font-semibold opacity-75">
                ≈ ₹{derivedAmountFromPercent.toFixed(2)} on subtotal ₹{effectiveSubTotal} (max: 100% = ₹{effectiveSubTotal})
              </p>
            )}
          </div>
        )}

        <Button
          onClick={handleSaveCustomServiceCharge}
          disabled={
            editingServiceChargeLoader ||
            (!amountInput && !percentInput) ||
            (mode === 'amount' && amountInput <= 0) ||
            (mode === 'percentage' && percentInput <= 0)
          }
          className="w-full"
        >
          {editingServiceChargeLoader
            ? isServiceChargeApplied
              ? 'Updating Custom Service Charge...'
              : 'Applying Custom Service Charge...'
            : isServiceChargeApplied
              ? 'Update Custom Service Charge'
              : 'Apply Custom Service Charge'}
        </Button>
      </div>

      {/* Remove section (only if applied) */}
      {isServiceChargeApplied && (
        <div className="mt-4 border-t pt-4">
          <div>
            <Label htmlFor="service-charge-reason">Reason for Removal</Label>
            <Textarea
              id="service-charge-reason"
              placeholder="Enter reason for removing service charge"
              value={serviceChargeReason}
              onChange={(e) => setServiceChargeReason(e.target.value)}
            />

            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_SERVICE_REMOVE_REASONS.map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  size="sm"
                  variant={serviceChargeReason === reason ? 'default' : 'outline'}
                  onClick={() => setServiceChargeReason(reason)}
                  className="h-7 px-2 text-xs"
                >
                  {reason}
                </Button>
              ))}
            </div>
          </div>

          {isPasswordActive && (
            <div className="mt-3">
              <Label htmlFor="remove-service-charge-password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Remove Service Charge Password
              </Label>
              <Input
                id="remove-service-charge-password"
                type="password"
                value={removePassword}
                onChange={(e) => setRemovePassword(e.target.value)}
                placeholder="Enter remove service charge password"
                className="mt-1 text-base font-semibold"
              />
            </div>
          )}

          <Button
            onClick={handleRemoveServiceCharge}
            disabled={removingServiceChargeLoader || !serviceChargeReason || (isPasswordActive && !removePassword.trim())}
            className="mt-3 w-full"
            variant="destructive"
          >
            {removingServiceChargeLoader ? 'Removing...' : 'Remove Service Charge'}
          </Button>
        </div>
      )}
    </div>
  );
};

const ServiceChargeModal = memo(MemoServiceChargeModal);
export default ServiceChargeModal;
