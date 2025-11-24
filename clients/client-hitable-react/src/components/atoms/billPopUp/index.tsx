import { useReprintBill } from '@/components/hooks/usePrint.ts';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { useStaffPermissionStore } from '@/components/store/usePermissions.ts';
import { NavItemTypesEnum } from '@/components/types/hiClientzData';
import { useErrorHandling } from '@/components/utils/helpers';
import { cn } from '@/lib/utils.ts';
import { apiRpc } from '@hi/common';
import { lazy, memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import CommonBottomButton from '../bottomButton/index.tsx';
import NormalSettle from '../placeOrders/normalsettle';
import BillPopupData from './billPopupData.tsx';

const BottomPopUp = lazy(() => import('../universalPopup'));

const BillPopUpMemo = () => {
  const { errorText } = useErrorHandling();

  const selectedNavItem = useLiteStore((s) => s.selectedNavItem);
  const viewData = useLiteStore((s) => s.viewData);
  const removeOnlineAlert = useLiteStore((s) => s.removeOnlineAlert);
  const setOnlineCount = useLiteStore((s) => s.setOnlineCount);
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);

  const canPrintBill = hasPermission('print_bill');

  const { reprintBill } = useReprintBill();

  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const captainData = useHiClientZ((s) => s.captainData);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);

  const handleCloseAlert = async (id: string) => {
    const res = await apiRpc.payments[':pid'].rejectOrder[':alertId'].$put({
      json: {
        waiterName: captainData?.name,
      },
      param: { alertId: id },
    });
    if (res.status === 401) {
      return errorText();
    }
    toast.success('order reject successfully');
    setClickViewMore(false);
    removeOnlineAlert(id);
    setOnlineCount((count) => count - 1);
  };

  const handleCloseOnline = useCallback(() => {
    setClickViewMore(false);
  }, [setClickViewMore]);

  const handleAccept = () => {
    setNormalSettle(true);
  };

  const closeNormalSettle = () => {
    setNormalSettle(false);
  };

  const reprintBillHandler = async (orderId: string) => {
    await reprintBill({
      orderId: orderId,
    });
  };

  // Calculate totals and discounts
  const orderData = viewData?.order_id;

  return (
    <BottomPopUp rightTopBack height="h-[100dvh] lg:h-[80vh]" show={clickViewMore} onClose={handleCloseOnline}>
      {normalSettle ? (
        <NormalSettle closeNormalSettle={closeNormalSettle} data={{ total: Number(orderData?.total) }} alertData={viewData} />
      ) : (
        <section className="hide-scrollbar" style={{ maxHeight: '90%', overflowY: 'auto' }}>
          <BillPopupData viewData={viewData} />
          {/* Action Buttons */}
          {viewData?.alertType !== 'OFFLINE' || selectedNavItem === NavItemTypesEnum.HISTORY ? (
            <CommonBottomButton
              fixed={true}
              maxWidth="30rem"
              position="mid"
              buttons={[
                {
                  text: 'Print Bill',
                  onClick: () => reprintBillHandler(viewData?.order_id?._id),
                  className: cn('rounded-md w-full', { canPrintBill: 'hidden' }),
                },
                {
                  text: 'Close Alert',
                  onClick: handleCloseOnline,
                  className: 'rounded-md w-full',
                },
              ]}
            />
          ) : (
            <div className="fixed bottom-0 z-20 w-full max-w-[48rem] border-t border-gray-200 bg-white p-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleCloseAlert(viewData?._id)}
                  className="flex-1 rounded-lg bg-red-600 py-3 font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </BottomPopUp>
  );
};

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
