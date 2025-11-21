import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import type { IBillData } from '@/components/types/hiClientzData.ts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useAddCustomer } from '@/components/hooks/useAddCustomer';
import { useOrderStore } from '@/components/store/useOrderData';
import { ArrowLeft, PersonStandingIcon, ReceiptText } from 'lucide-react';
import { memo, useState } from 'react';
import toast from 'react-hot-toast';
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
  const selectedTable = useOrderStore((s) => s.selectedTable);

  // Get businessId from HiClient store
  const selectedBiz = useHiClientZ((s) => s.selectedBiz);
  const businessId = selectedBiz?.businessId?._id || '';

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { mutate: addCustomer, isPending } = useAddCustomer();

  const handleOpenAddCustomer = () => {
    // Prefill from selected bill if available
    setCustomerName((selectedBill?.customerName || '').trim());
    setCustomerPhone(selectedBill?.customerPhone || '');
    setNameError('');
    setPhoneError('');
    setShowAddCustomer(true);
  };

  const validateForm = () => {
    let valid = true;
    const name = customerName.trim();
    setNameError('');
    setPhoneError('');

    if (name.length < 2 || name.length > 25) {
      setNameError('Name must be between 2 and 25 characters.');
      valid = false;
    } else if (!/^[A-Za-z\s.]+$/.test(name)) {
      setNameError('Name can only contain letters, spaces and dots.');
      valid = false;
    }

    if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
      setPhoneError('Phone must be exactly 10 digits.');
      valid = false;
    }

    return valid;
  };

  const handleAddCustomer = () => {
    if (!validateForm()) return;

    addCustomer(
      {
        businessId,
        tableName: selectedTable?.name || '',
        customerName: customerName.trim(),
        phone: customerPhone || undefined,
        ...(selectedBill?.variantId && { variantId: String(selectedBill?.variantId) }),
      },
      {
        onSuccess: () => {
          setShowAddCustomer(false);
        },
      },
    );
  };

  return (
    <>
      <CardHeader className="p-2 md:px-6">
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

          <section className="-mb-14 flex flex-col space-y-2 md:-mr-4">
            {canEBill && (
              <Button size="sm" variant="outline" onClick={onShowEBill}>
                <ReceiptText className="mr-1 h-4 w-4" />
                E-Bill
              </Button>
            )}

            {canPrintBill && (
              <Button size="sm" variant="outline" onClick={onReprintBill}>
                <BiSync className="mr-1 h-4 w-4" />
                Print Bill
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAddCustomer}
              disabled={isPending}
              title={!selectedBill ? 'Select a bill first' : ''}
            >
              <PersonStandingIcon className="mr-1 h-4 w-4" />
              Add Customer
            </Button>
          </section>
        </CardTitle>
      </CardHeader>

      {/* Centered modal: Add Customer */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Add Customer Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAddCustomer(false)} className="-mr-2">
                Close
              </Button>
            </div>

            {selectedBill && (
              <p className="mb-3 text-xs text-gray-500">
                Table: <strong>{selectedBill.tableName}</strong>
                {selectedBill.variantName && (
                  <>
                    {' '}
                    • Variant: <strong>#{selectedBill.variantName}</strong>
                  </>
                )}
              </p>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input id="customerName" value={customerName || ''} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Sankalesh" />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="customerPhone">Phone (optional)</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone || ''}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
                {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomerName('');
                  setCustomerPhone('');
                }}
                disabled={isPending}
              >
                Clear
              </Button>
              <Button size="sm" onClick={handleAddCustomer} disabled={isPending}>
                {isPending ? 'Adding…' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

BillHeader.displayName = 'BillHeader';
export default BillHeader;
