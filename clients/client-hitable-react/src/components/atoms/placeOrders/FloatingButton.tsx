import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { useTempItemStore } from '@/components/store/useTempItemStore';
import { AnimatePresence, motion } from 'framer-motion';
import { BookmarkX, CookingPot, Plus, UserCheck, Users, X } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { MdTableBar } from 'react-icons/md';

interface Action {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface FloatingTableActionsProps {
  secondaryActions?: Action[];
  showPrimary?: boolean;
  showSecondary?: boolean;
  position?: string;
  mainColor?: string;
}

const MemoFloatingTableActions = ({
  secondaryActions = [],
  showPrimary = true,
  showSecondary = true,
  position = 'bottom-[4.5rem] right-6',
  mainColor = 'bg-primary',
}: FloatingTableActionsProps) => {
  const [open, setOpen] = useState(false);

  // store actions
  const setModalType = useOrderStore((s) => s.setModalType);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);

  // ---- Permissions ----
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canAddPax = hasPermission('add_pax');
  const canTransfer = hasPermission('transfer_item_or_table');
  const canDeleteKot = hasPermission('delete_kot');
  const canAddTempItem = hasPermission('temp_item');
  const setOpenItem = useTempItemStore((s) => s.setOpenItem);
  // helpers
  const toggleModalType = useCallback(
    (type: 'guest' | 'customer') => {
      setOpenOrderModal(true);
      setModalType(type);
      setOpen(false);
    },
    [setModalType, setOpenOrderModal],
  );

  const handleTransferTable = useCallback(
    (type: 'ITEM' | 'TABLE' | 'DELETE') => {
      setTransferTable(type);
      setTransferModal(true);
      setOpen(false);
    },
    [setTransferTable, setTransferModal],
  );

  /** Primary built-in actions – permission controlled */
  const primaryActions: Action[] = useMemo(() => {
    const actions: Action[] = [];

    // 🟪 Packs — add_pax
    if (canAddPax) {
      actions.push({
        label: 'Packs',
        icon: <Users className="h-5 w-5" />,
        onClick: () => toggleModalType('guest'),
        color: 'bg-purple-500 text-white',
      });
    }

    // 🟩 Customers — always visible
    actions.push({
      label: 'Customers',
      icon: <UserCheck className="h-5 w-5" />,
      onClick: () => toggleModalType('customer'),
      color: 'bg-purple-500 text-white',
    });

    // 🟥 Delete KOT — delete_kot permission
    if (canDeleteKot) {
      actions.push({
        label: 'Delete KOT',
        icon: <BookmarkX className="h-5 w-5" />,
        onClick: () => handleTransferTable('DELETE'),
        color: 'bg-purple-500 text-white',
      });
    }

    // 🟧 Transfer Item / Table — transfer_item_or_table permission
    if (canTransfer) {
      actions.push(
        {
          label: 'Transfer Item',
          icon: <CookingPot className="h-5 w-5" />,
          onClick: () => handleTransferTable('ITEM'),
          color: 'bg-purple-500 text-white',
        },
        {
          label: 'Transfer Table',
          icon: <MdTableBar className="h-5 w-5" />,
          onClick: () => handleTransferTable('TABLE'),
          color: 'bg-purple-500 text-white',
        },
      );
    }

    // 🟨 Temp Item — temp_item permission
    if (canAddTempItem) {
      actions.push({
        label: 'Temp Item',
        icon: <MdTableBar className="h-5 w-5" />,
        onClick: () => {
          setOpenItem(true);
          setOpen(false);
        },
        color: 'bg-purple-500 text-white',
      });
    }

    return actions;
  }, [canAddPax, canAddTempItem, setOpenItem, canDeleteKot, canTransfer, toggleModalType, handleTransferTable]);

  /** Final Actions List */
  const actionsToRender: Action[] = useMemo(
    () => [...(showPrimary ? primaryActions : []), ...(showSecondary ? secondaryActions : [])],
    [primaryActions, secondaryActions, showPrimary, showSecondary],
  );

  // ❌ If no actions after permission filters → hide plus icon also
  if (actionsToRender.length === 0) return null;

  return (
    <div className={`fixed ${position} z-[999] flex flex-col items-end space-y-3 lg:hidden`}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ staggerChildren: 0.08, delayChildren: 0.05 }}
            className="mb-4 flex flex-col items-end space-y-3"
          >
            {actionsToRender.map((action, idx) => (
              <motion.button
                key={`${action.label}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={action.onClick}
                title={action.label}
                className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 shadow-md transition-transform duration-150 hover:scale-105 active:scale-95 ${
                  action.color || 'bg-purple-500 text-white'
                }`}
              >
                {action.icon}
                {action.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ${
          open ? 'bg-purple-500' : mainColor
        }`}
      >
        {open ? <X size={30} /> : <Plus size={30} />}
      </motion.button>
    </div>
  );
};

const FloatingTableActions = memo(MemoFloatingTableActions);
export default FloatingTableActions;
