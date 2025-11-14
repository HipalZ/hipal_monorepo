import { useHomeNavigation } from '@/components/hooks/useNavigateHome.ts';
import { type orderModal, type TransferTable, useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useScreenSize } from '@/hooks/useScreenSize';
import { BookmarkX, CookingPot, HomeIcon, UserCheck, Users } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { MdTableBar } from 'react-icons/md';
import CommonBottomButton from '../bottomButton';

const MemoTableOptions = () => {
  const setModalType = useOrderStore((s) => s.setModalType);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);

  const { goHome } = useHomeNavigation();
  const screenSize = useScreenSize();

  // ---- PERMISSIONS ----
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canAddPax = hasPermission('add_pax');
  const canTransfer = hasPermission('transfer_item_or_table');
  const canDeleteKot = hasPermission('delete_kot');

  // ---- Handlers ----
  const toggleModalType = useCallback(
    (type: orderModal) => {
      setModalType(type);
    },
    [setModalType],
  );

  const handleTransferTable = useCallback(
    (type: TransferTable) => {
      setTransferTable(type);
      setTransferModal(true);
    },
    [setTransferTable, setTransferModal],
  );

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  // ---- BUTTONS WITH PERMISSION FILTERING ----
  const actionButtons = useMemo(() => {
    const buttons = [];

    // Add Guest Count → add_pax permission
    if (canAddPax) {
      buttons.push(
        <Button key="guest" size="lg" variant="outline" className="w-full" onClick={() => toggleModalType('guest')}>
          <Users className="mr-2 h-5 w-5" />
          Add Guest Count
        </Button>,
      );
    }

    // Know Your Customers → always allowed
    buttons.push(
      <Button key="customer" size="lg" variant="outline" className="w-full" onClick={() => toggleModalType('customer')}>
        <UserCheck className="mr-2 h-5 w-5" />
        Know Your Customers
      </Button>,
    );

    // Transfer Item → transfer_item_or_table
    if (canTransfer) {
      buttons.push(
        <Button key="transfer-item" size="lg" variant="outline" className="w-full" onClick={() => handleTransferTable('ITEM')}>
          <CookingPot className="mr-2 h-5 w-5" />
          Transfer Item
        </Button>,
      );
    }

    // Transfer Table → transfer_item_or_table
    if (canTransfer) {
      buttons.push(
        <Button key="transfer-table" size="lg" variant="outline" className="w-full" onClick={() => handleTransferTable('TABLE')}>
          <MdTableBar className="mr-2 h-5 w-5" />
          Transfer Table
        </Button>,
      );
    }

    // Delete KOT → delete_kot
    if (canDeleteKot) {
      buttons.push(
        <Button key="delete-kot" size="lg" variant="outline" className="w-full" onClick={() => handleTransferTable('DELETE')}>
          <BookmarkX className="mr-2 h-5 w-5" />
          Delete KOT
        </Button>,
      );
    }

    return buttons;
  }, [canAddPax, canTransfer, canDeleteKot, toggleModalType, handleTransferTable]);

  return (
    <section className="mx-auto flex min-h-[90dvh] justify-center px-4 md:py-[8rem]">
      <CardContent className="hide-scrollbar mt-24 h-[70dvh] space-y-4 overflow-auto pb-[5rem] md:mt-6">
        {selectedTable?.hiCode && (
          <Badge variant="secondary" className="flex w-full justify-between">
            <div className="text-2xl font-bold">Table code :-</div>
            <div className="text-2xl font-bold">{selectedTable.hiCode}</div>
          </Badge>
        )}

        {/* Render filtered permission-based buttons */}
        {actionButtons}
      </CardContent>

      <CommonBottomButton
        fixed={true}
        maxWidth={screenSize === 'xs' ? '30rem' : '48rem'}
        backgroundColor={screenSize === 'xs' ? '' : 'white'}
        buttons={[
          {
            text: ' ',
            onClick: goHome,
            icon: <HomeIcon />,
            className: 'rounded-md !w-[4rem] pl-2',
          },
          {
            text: 'Back',
            onClick: closeOrderModalHandler,
            className: 'rounded-md w-full',
          },
        ]}
      />
    </section>
  );
};

const TableOptions = memo(MemoTableOptions);
export default TableOptions;
