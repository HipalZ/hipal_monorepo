import { useCart } from '@/components/store/useCart';
import { useOrderStore } from '@/components/store/useOrderData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Merge, Plus } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { MdTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '../../hooks/use-mobile';
import SpinnerMemo from '../atoms/loadingSpinner';
import { useTableData } from '../hooks/useTableData';
import useBusinessData from '../store/useBusinessData';
import { useHiClientZ } from '../store/useHiClientzData';
import { useMergeTableStore } from '../store/useMergeTableStore';
import { useTempItemStore } from '../store/useTempItemStore';
import type { TableData } from '../store/useZonesAndTable';
import MergeTablesModal from './MergeTableModal';
import SwitchTablesModal from './SwitchTable';
import TempItemModal from './TempItem';

const TableQuickNav = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const { setIsPlacingNewOrder } = useCart((s) => ({
    setIsPlacingNewOrder: s.setIsPlacingNewOrder,
  }));

  const isHipalzPos = useBusinessData((s) => s?.outletInfo?.isHipalzPos);

  const userDetails = useHiClientZ((s) => s.captainData);
  const setShowMergeModal = useMergeTableStore((s) => s.setShowMergeModal);
  const showMergeModal = useMergeTableStore((s) => s.showMergeModal);
  const openItem = useTempItemStore((s) => s.openItem);
  const setOpenItem = useTempItemStore((s) => s.setOpenItem);

  const isMobile = useIsMobile();

  const [switchPopoverOpen, setSwitchPopoverOpen] = useState(false);
  const { filteredTables } = useTableData({
    enabled: switchPopoverOpen || showMergeModal,
    businessIdOverride: businessId,
  });
  const selectedTable = useOrderStore((s) => s.selectedTable);

  const fetchTables = async (businessId: string) => {
    const response = await apiRpc.table.all[':businessId'].$get({
      param: { businessId },
    });
    const json = await response.json();
    const tablesData = json.data || [];
    return tablesData;
  };

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables', businessId],
    queryFn: () => fetchTables(businessId || ''),
    enabled: !!businessId && (switchPopoverOpen || showMergeModal),
  });

  const activeTables = useMemo(() => {
    const merged = [...new Map([...tables, ...filteredTables].map((table) => [table._id, table])).values()];
    return merged as TableData[];
  }, [tables, filteredTables]) as TableData[];

  const goToTable = (table: TableData) => {
    if (isMobile) {
      setIsPlacingNewOrder(true);
    }
    setSelectedBill(null);
    setSwitchPopoverOpen(false);
    navigate(`/${businessId}/alerts/${table._id}`);
    return;
  };

  const handleMergeClick = () => setShowMergeModal(true);
  const handleMergeCancel = () => setShowMergeModal(false);

  if (isLoading) {
    return <SpinnerMemo />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        {/* Current Table Display */}
        <div className="flex flex-col gap-2">
          <section className="flex items-center gap-2">
            <MdTableBar className="h-10 w-10 flex-shrink-0 text-purple-600" />
            <p className="truncate text-3xl font-semibold leading-tight">{selectedTable ? selectedTable.name : 'No Table'}</p>
          </section>
          {selectedTable?.isMerge && selectedTable.mergeTableIds?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-muted-foreground text-[11px] font-medium">Merged:</span>
              {selectedTable.mergeTableIds.map((m, i) => (
                <div key={m._id} className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="space-x-1 rounded-full bg-purple-50 text-xs text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                  >
                    <MdTableBar className="h-4 w-4 pr-1" />
                    {m.name}
                  </Badge>
                  {i !== selectedTable.mergeTableIds.length - 1 && (
                    <Separator orientation="vertical" className="mx-1 h-4 w-px bg-purple-300/50 dark:bg-purple-700/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <section className="space-x-2 space-y-2 text-right">
          <Button onClick={() => setSwitchPopoverOpen(true)} variant="outline" size="default" className="gap-2 bg-transparent font-semibold">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Switch</span>
            <MdTableBar className="mt-0.5 h-4 w-4" />
          </Button>
          {isHipalzPos && (
            <Button onClick={() => setOpenItem(true)} variant="outline" size="default" className="gap-2 bg-transparent font-semibold">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          )}

          {isHipalzPos && !selectedTable?.isMerge && (
            <Button variant="outline" size="default" className="gap-2 bg-transparent font-semibold" onClick={handleMergeClick}>
              <Merge className="h-4 w-4" />
              <span className="hidden sm:inline">Merge</span>
              <MdTableBar className="mt-0.5 h-4 w-4" />
            </Button>
          )}
        </section>
      </div>

      {/* Switch Modal */}
      {switchPopoverOpen && (
        <SwitchTablesModal
          show={switchPopoverOpen}
          onClose={() => setSwitchPopoverOpen(false)}
          currentTable={selectedTable}
          tables={activeTables}
          onSwitch={(table) => goToTable(table)}
        />
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <MergeTablesModal show={showMergeModal} onClose={handleMergeCancel} staffId={userDetails?._id || ''} tables={activeTables} />
      )}
      {openItem && <TempItemModal show={openItem} onClose={() => setOpenItem(false)} />}
    </>
  );
};

export default memo(TableQuickNav);
