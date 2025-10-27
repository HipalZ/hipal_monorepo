import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/universalPopup';
import { useMergeTableStore } from '@/components/store/useMergeTableStore';
import type { TableData } from '@/components/store/useZonesAndTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@hi/common';
import { AnimatePresence, motion } from 'framer-motion';
import { IndianRupee, Search, X } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MdPerson, MdTableBar } from 'react-icons/md';
import { useMergeTables } from '../hooks/useMergeTables';
import { useOrderStore } from '../store/useOrderData';
import { useZonesAndTablesStore } from '../store/useZonesAndTable';

const getStatusColor = (status: string) => {
  switch ((status || '').toUpperCase()) {
    case 'BILL':
      return 'bg-yellow-500 text-yellow-50';
    case 'ACTIVE':
      return 'bg-purple-600 text-purple-50';
    default:
      return 'bg-slate-500 text-slate-50';
  }
};

type Props = { show: boolean; onClose: () => void; staffId: string; tables: TableData[] };

const MemoMergeTablesModal = ({ show, onClose, staffId, tables }: Props) => {
  const zones = useZonesAndTablesStore((s) => s.zones);
  const { parentTableId, childTableIds, setParentTableId, toggleChildTableId, resetMergeState } = useMergeTableStore();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const { isMerging, mergeTables } = useMergeTables();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!show) return;
    if (!parentTableId && selectedTable?._id) {
      setParentTableId(selectedTable._id);
    }
  }, [show]);

  const effectiveParentId = parentTableId ?? null;
  const parentTable = useMemo(() => tables.find((t) => t._id === effectiveParentId) || null, [tables, effectiveParentId]);
  const selectedChildren = useMemo(() => tables.filter((t) => childTableIds.includes(t._id)), [tables, childTableIds]);

  const canProceed = !!effectiveParentId && selectedChildren.length > 0 && selectedChildren.length <= 3;

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tables.filter((t) => !term || !t.isMerge || t.name.toLowerCase().includes(term) || (t.hiCode?.toLowerCase().includes(term) ?? false));
  }, [tables, searchTerm]);

  const groupedByZone = useMemo(() => {
    const map = new Map<string, TableData[]>();
    for (const t of filtered) {
      if (!map.has(t.zoneId)) map.set(t.zoneId, []);
      map.get(t.zoneId)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // ---------- Interaction logic ----------
  const setAsParent = (id: string) => {
    if (id === parentTableId) return;
    if (childTableIds.includes(id)) toggleChildTableId(id); // remove if it was a child
    setParentTableId(id);
    toast.success('Parent selected');
  };

  const toggleChild = (id: string) => {
    if (!parentTableId) {
      toast('Select a parent first');
      return;
    }
    if (id === parentTableId) {
      toast.error('Parent cannot be a child');
      return;
    }
    if (!childTableIds.includes(id) && childTableIds.length >= 3) {
      toast.error('Max 3 child tables allowed');
      return;
    }
    toggleChildTableId(id);
  };

  const handleCardClick = (t: TableData) => {
    if (!parentTableId) {
      setAsParent(t._id);
      return;
    }
    toggleChild(t._id);
  };

  const handleCardDoubleClick = (t: TableData) => {
    setAsParent(t._id);
  };

  const removeParent = () => {
    setParentTableId(null as any);
    toast('Parent cleared. Select a parent to continue.');
  };

  const removeChild = (id: string) => {
    if (childTableIds.includes(id)) {
      toggleChildTableId(id);
      toast('Child removed');
    }
  };

  const handleConfirmMerge = async () => {
    if (!canProceed) {
      toast.error('Please select parent and at least one child');
      return;
    }
    const payload = {
      fromTableIds: childTableIds,
      toTableId: parentTableId!,
      staffId,
    };
    await mergeTables(payload);
    resetMergeState();
    onClose();
  };

  const handleClose = () => {
    resetMergeState();
    onClose();
  };

  const TableCard = ({ t }: { t: TableData }) => {
    const isParent = t._id === effectiveParentId;
    const isChild = childTableIds.includes(t._id);
    const isMerged = t.isMerge;
    if (isMerged) {
      return null;
    }
    return (
      <motion.button
        layout
        key={t._id}
        onClick={() => handleCardClick(t)}
        onDoubleClick={() => handleCardDoubleClick(t)}
        className={cn(
          'relative rounded-xl border p-2 text-left transition-all duration-200',
          'hover:bg-accent bg-white dark:bg-slate-900/60',
          isParent && 'bg-green-50 ring-2 ring-green-500',
          isChild && 'bg-purple-50 ring-2 ring-purple-400',
        )}
      >
        <div className="flex gap-2 py-2">
          <MdTableBar className="text-primary mt-0.5 h-5 w-5" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold">{t.name}</p>
              <Badge className={cn(getStatusColor(t.status), 'absolute right-0 top-0 px-1.5 py-0 text-[10px]')}>{t.status}</Badge>
            </div>
            <div className="-ml-4 mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <MdPerson className="h-4 w-4 text-black" />
                <span>{t.userIds?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4 text-black" />
                <span>{t.currentTableAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  const MobilePreview = () => (
    <>
      <div className="sticky top-0 z-10 rounded-xl border bg-white/80 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/60 lg:hidden">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-semibold">Merge Preview</h3>
        </div>
        <Separator className="mb-3" />

        {/* Parent */}
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-black">Parent</p>
          {parentTable ? (
            <div className="relative rounded-lg border bg-green-50 p-2">
              <button
                type="button"
                onClick={removeParent}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                aria-label="Remove parent"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-sm font-semibold">{parentTable.name}</p>
              <p className="mt-0.5 text-[11px] text-black">
                Guests: {parentTable.userIds?.length || 0} • ₹{parentTable.currentTableAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-black">Tap any table to select parent</p>
          )}
        </div>

        {/* Children */}
        <div className="mb-2">
          <p className="mb-1 text-xs font-medium text-black">Children ({selectedChildren.length}/3)</p>
          {selectedChildren.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedChildren.map((c) => (
                <div key={c._id} className="relative flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-700">
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => removeChild(c._id)}
                    className="rounded-full p-0.5 text-red-600 hover:bg-red-100"
                    aria-label={`Remove ${c.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-black">Tap other tables to add as children</p>
          )}
        </div>

        {/* Mobile actions */}
      </div>
      <CommonBottomButton
        fixed={true}
        position="mid"
        maxWidth="30rem"
        buttons={[
          {
            text: 'Cancel',
            onClick: handleClose,
            color: '#6b7280',
            textColor: '#ffffff',
            isBackButton: true,
            className: 'rounded-md pl-3',
          },
          {
            text: isMerging ? 'Merging…' : 'Proceed',
            onClick: handleConfirmMerge,
            disable: !canProceed,
            swipe: true,
          },
        ]}
      />
    </>
  );

  return (
    <BottomPopUp show={show} onClose={handleClose} width="w-full lg:w-[90dvw]" height="h-[100dvh] lg:h-[90dvh]" rightTopBack hide>
      <div className="flex h-full flex-row gap-4 py-4">
        <div className="sticky top-0 hidden h-full w-80 flex-shrink-0 flex-col rounded-2xl px-4 lg:flex">
          <h3 className="mb-1 text-lg font-semibold">Merge Preview</h3>

          <Separator className="mb-3" />

          <div className="mb-4">
            <p className="mb-1 text-sm font-medium text-black">Parent Table</p>
            {parentTable ? (
              <div className="relative rounded-xl border bg-green-50 p-3">
                <button
                  type="button"
                  onClick={removeParent}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  aria-label="Remove parent"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="font-semibold">{parentTable.name}</p>
                <p className="text-xs text-black">
                  Guests: {parentTable.userIds?.length || 0} • ₹{parentTable.currentTableAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-xs text-black">Click any table to select parent</p>
            )}
          </div>

          {/* Children */}
          <div className="mb-4">
            <p className="mb-1 text-sm font-medium text-black">Child Tables ({selectedChildren.length}/3)</p>
            {selectedChildren.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedChildren.map((c) => (
                  <div key={c._id} className="relative flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => removeChild(c._id)}
                      className="rounded-full p-0.5 text-red-600 hover:bg-red-100"
                      aria-label={`Remove ${c.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-black">Click other tables to add as children</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <MobilePreview />
          <div className="mb-3 mt-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-black" />
            <Input placeholder="Search tables..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-72" />
          </div>

          <ScrollArea className="m-4 h-[calc(100dvh-12rem)] rounded-2xl border p-2 lg:h-[calc(100dvh-12rem)]">
            {groupedByZone.length === 0 && <p className="py-10 text-center text-sm text-black">No tables found.</p>}
            <AnimatePresence>
              {groupedByZone.map(([zoneId, list]) => {
                const zone = zones.find((z) => z.zoneId === zoneId);
                return (
                  <motion.div key={zoneId} layout className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="ml-2 text-base font-semibold">{zone?.name || 'Unknown Zone'}</h4>
                      <Badge variant="outline">{list.length}</Badge>
                    </div>
                    <div className="mx-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
                      {list.map((t) => (
                        <TableCard key={t._id} t={t} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </div>
    </BottomPopUp>
  );
};

const MergeTablesModal = memo(MemoMergeTablesModal);
export default MergeTablesModal;
