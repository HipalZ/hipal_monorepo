import TipsModal from '@/components/atoms/placeOrders/billModals/TipsModal.tsx';
import { useOrderStore } from '@/components/store/useOrderData.ts';
import { useStaffPermissionStore } from '@/components/store/usePermissions.ts';
import type { IBillData } from '@/components/types/hiClientzData.ts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Split } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { MdOutlineCall } from 'react-icons/md';
import PasswordModal from '../cartItem/PasswordModal.tsx';
import SplitBillModal from './bill/split/SplitBillModal.tsx';
import DiscountModal from './billModals/DiscountModal.tsx';
import ServiceChargeModal from './billModals/ServiceChargeModal.tsx';

interface BillOptionsProps {
  data: IBillData;
}

const MemoBillOptions = ({ data }: BillOptionsProps) => {
  const activeModal = useOrderStore((s) => s.activeModal);
  const setActiveModal = useOrderStore((s) => s.setActiveModal);
  const setShowMoreOption = useOrderStore((s) => s.setShowMoreOption);
  const isSplitBill = useOrderStore((s) => s.isBillSplit);
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);

  // Password protection states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<'copy' | 'call' | null>(null);
  const [copyTick, setCopyTick] = useState(false);

  const canDiscount = hasPermission('add_discount');
  const canServiceCharge = hasPermission('add_or_remove_service_charge');
  const canSplit = hasPermission('split_bill');

  const closeModal = useCallback(() => {
    setActiveModal('options');
    setShowMoreOption(false);
  }, [setActiveModal, setShowMoreOption]);

  // Phone protection functions
  const hideMiddleNumbers = useCallback((phone: string) => {
    if (!phone) return '';
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  }, []);

  const handleProtectedAction = useCallback(
    (action: 'copy' | 'call') => {
      if (isPhoneVerified) {
        executePhoneAction(action);
      } else {
        setPendingAction(action);
        setIsModalOpen(true);
      }
    },
    [isPhoneVerified],
  );

  const executePhoneAction = useCallback(
    (action: 'copy' | 'call') => {
      const phone = data.customerPhone;
      if (!phone) return;

      if (action === 'copy') {
        navigator.clipboard.writeText(phone).then(() => {
          setCopyTick(true);
          setTimeout(() => setCopyTick(false), 3000);
        });
      } else if (action === 'call') {
        window.location.href = `tel:+91${phone}`;
      }
    },
    [data.customerPhone],
  );

  const handlePasswordVerify = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setIsPhoneVerified(true);
        if (pendingAction) {
          executePhoneAction(pendingAction);
          setPendingAction(null);
        }
        // Auto-lock after 5 minutes for security
        setTimeout(() => setIsPhoneVerified(false), 5 * 60 * 1000);
      }
    },
    [pendingAction, executePhoneAction],
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  return (
    <>
      {activeModal === 'options' && (
        <>
          <div className="absolute top-0 z-50 flex w-full items-center justify-between rounded-t-xl bg-white p-4">
            <h2 className="-mt-4 text-xl font-semibold">Bill Options</h2>
            <section className="mt-4">
              <p className="text-sm text-gray-600">Table: {data.tableName}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  {data.customerName} ({isPhoneVerified ? data.customerPhone : hideMiddleNumbers(data.customerPhone || '')})
                </p>
                {data.customerPhone && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className={cn('rounded p-1 text-xs', copyTick ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600')}
                      onClick={() => handleProtectedAction('copy')}
                    >
                      <FiCopy className="h-3 w-3" />
                    </button>
                    <button type="button" className="rounded bg-blue-100 p-1 text-blue-600" onClick={() => handleProtectedAction('call')}>
                      <MdOutlineCall className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
          <div className="h-[90dvh] space-y-4 overflow-auto px-4 pb-[5rem] pt-[5rem]">
            {/* Current Bill Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Bill Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">SubTotal: ₹{data.subTotal}</p>
                    <p className="font-medium">GST: ₹{data.gst}</p>
                    <p className="font-medium">Service Charge: ₹{data.serviceCharge}</p>
                  </div>
                  <div>
                    <p className="font-medium">Discount: ₹{data.discount}</p>
                    <p className="font-medium">Claimed Coins: ₹{data.claimedCoins}</p>
                    <p className="text-lg font-medium">Total: ₹{data.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Action Buttons */}
            <div className="space-y-3">
              {canDiscount && (
                <Button onClick={() => setActiveModal('discount')} className="h-12 w-full">
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">Add or Remove Discount</p>
                    <p className="text-xs">Current: ₹{data.discount}</p>
                  </div>
                </Button>
              )}
              {canServiceCharge && (
                <Button onClick={() => setActiveModal('serviceCharge')} className="h-12 w-full">
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">Add or Remove Service Charge</p>
                    <p className="text-xs">Current: ₹{data.serviceCharge}</p>
                  </div>
                </Button>
              )}

              {!isSplitBill && canSplit && (
                <Button onClick={() => setActiveModal('split')} className="h-12 w-full">
                  <Split />
                  Split Bill
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {activeModal === 'discount' && <DiscountModal data={data} onClose={closeModal} />}
      {activeModal === 'serviceCharge' && <ServiceChargeModal data={data} onClose={closeModal} />}
      {activeModal === 'split' && <SplitBillModal data={data} onClose={closeModal} />}
      {activeModal === 'tips' && <TipsModal data={data} onClose={closeModal} />}

      {/* Password Modal */}
      <PasswordModal isOpen={isModalOpen} onVerify={handlePasswordVerify} onClose={handleModalClose} />
    </>
  );
};

const BillOptions = memo(MemoBillOptions);
export default BillOptions;
