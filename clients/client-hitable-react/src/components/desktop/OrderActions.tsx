import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookmarkX, CookingPot, UserCheck, Users } from 'lucide-react';
import { memo } from 'react';
import { MdTableBar } from 'react-icons/md';

const MemoOrderActions = () => {
  const setModalType = useOrderStore((s) => s.setModalType);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);

  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);

  // 🔐 Permission mapping
  const canAddPax = hasPermission('add_pax');
  const canTransfer = hasPermission('transfer_item_or_table');
  const canDeleteKot = hasPermission('delete_kot');

  const handleTransferTable = (type: 'ITEM' | 'TABLE' | 'DELETE') => {
    setTransferTable(type);
    setTransferModal(true);
  };

  const toggleModalType = (type: 'guest' | 'customer') => {
    setOpenOrderModal(true);
    setModalType(type);
  };

  return (
    <TooltipProvider>
      <div className="bg-background flex flex-wrap items-center justify-evenly gap-2 border-t p-3">
        {/* 🟦 GUEST / ADD PAX */}
        {canAddPax && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[7rem] bg-transparent font-semibold hover:border-blue-300 hover:bg-blue-50"
                onClick={() => toggleModalType('guest')}
              >
                <Users className="h-12 w-12 text-blue-600" strokeWidth={2.5} />
                Guest
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Add Guest Count</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 🟩 CUSTOMER (no permission restriction unless you want) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="w-full max-w-[7rem] bg-transparent font-semibold hover:border-green-300 hover:bg-green-50"
              onClick={() => toggleModalType('customer')}
            >
              <UserCheck className="h-12 w-12 text-green-600" strokeWidth={2.5} />
              Customer
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Know Your Customers</p>
          </TooltipContent>
        </Tooltip>

        {/* 🟧 TRANSFER ITEM */}
        {canTransfer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[7.5rem] bg-transparent font-semibold hover:border-orange-300 hover:bg-orange-50"
                onClick={() => handleTransferTable('ITEM')}
              >
                <CookingPot className="h-12 w-12 text-orange-600" strokeWidth={2.5} />
                Transfer Item
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Transfer Item</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 🟣 TRANSFER TABLE */}
        {canTransfer && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[8rem] bg-transparent font-semibold hover:border-purple-300 hover:bg-purple-50"
                onClick={() => handleTransferTable('TABLE')}
              >
                <MdTableBar className="h-12 w-12 text-purple-600" strokeWidth={2.5} />
                Transfer Table
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Transfer Table</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* 🔴 DELETE KOT */}
        {canDeleteKot && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="w-full max-w-[7rem] bg-transparent font-semibold hover:border-red-300 hover:bg-red-50"
                onClick={() => handleTransferTable('DELETE')}
              >
                <BookmarkX className="h-12 w-12 text-red-600" strokeWidth={2.5} />
                Delete KOT
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Delete KOT</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

const OrderActions = memo(MemoOrderActions);
export default OrderActions;
