import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/universalPopup';
import { useCart } from '@/components/store/useCart';
import { useOrderStore } from '@/components/store/useOrderData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiRpc, cn } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, IndianRupee, Merge } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { MdPerson, MdTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '../../hooks/use-mobile';
import { useTableData } from '../hooks/useTableData';

interface TableData {
  _id: string;
  name: string;
  status: string;
  zoneId: string;
  zoneName?: string;
  userIds?: string[];
  currentTableAmount?: number;
  hiCode?: string;
}

const TableQuickNav = () => {
  const { businessId, tableId } = useParams();
  const navigate = useNavigate();
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const { setIsPlacingNewOrder } = useCart((s) => ({
    setIsPlacingNewOrder: s.setIsPlacingNewOrder,
  }));

  const isMobile = useIsMobile();

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedMergeTable, setSelectedMergeTable] = useState<string | null>(null);
  const [switchPopoverOpen, setSwitchPopoverOpen] = useState(false);
  const { filteredTables } = useTableData();
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
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  const activeTables = useMemo(() => {
    const merged = [...new Map([...tables, ...filteredTables].map((table) => [table._id, table])).values()];
    return merged as TableData[];
  }, [tables, filteredTables]) as TableData[];

  const currentTable = useMemo(() => {
    return tables.find((table) => table._id === tableId);
  }, [tables, tableId]);

  const mergeableTables = useMemo(() => {
    return activeTables.filter((table) => table._id !== tableId);
  }, [activeTables, tableId]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BILL':
        return 'bg-amber-500 text-amber-50';
      case 'ACTIVE':
        return 'bg-emerald-500 text-emerald-50';
      default:
        return 'bg-gray-500 text-gray-50';
    }
  };

  const goToTable = (table: TableData) => {
    if (isMobile) {
      setIsPlacingNewOrder(true);
    }
    setSelectedBill(null);
    navigate(`/${businessId}/alerts/${table._id}`);
    setSwitchPopoverOpen(false);
  };

  const handleMergeClick = () => {
    setShowMergeModal(true);
    setSelectedMergeTable(tableId || null);
  };

  const handleMergeConfirm = () => {
    if (selectedMergeTable && tableId) {
      console.log('[v0] Merging tables:', {
        currentTable: tableId,
        mergeWithTable: selectedMergeTable,
      });
      // TODO: Implement actual merge logic here
      setShowMergeModal(false);
      setSelectedMergeTable(null);
    }
  };

  const handleMergeCancel = () => {
    setShowMergeModal(false);
    setSelectedMergeTable(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Current Table Display - Compact */}
        <div className="bg-primary/10 border-primary/20 flex flex-1 items-center gap-2 rounded-lg border-2 px-3 py-2">
          <MdTableBar className="text-primary h-5 w-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">{selectedTable ? selectedTable.name : 'No Table'}</p>
            <p className="text-muted-foreground truncate text-xs leading-tight">Current Table</p>
          </div>
          {selectedTable && (
            <Badge className={`${getStatusColor(selectedTable.status)} flex-shrink-0 px-2 py-0.5 text-xs`}>{selectedTable.status}</Badge>
          )}
        </div>

        {/* Action Buttons - Using shadcn Button */}
        <Popover open={switchPopoverOpen} onOpenChange={setSwitchPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" className="gap-2 bg-transparent font-semibold">
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Switch</span>
              {activeTables.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeTables.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="bg-muted/50 border-b p-3">
              <h4 className="font-semibold">Active Tables</h4>
              <p className="text-muted-foreground text-xs">Switch to another table</p>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground text-sm">Loading...</div>
                  </div>
                ) : activeTables.length > 0 ? (
                  <div className="space-y-1">
                    {activeTables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => goToTable(table)}
                        className={cn(
                          'hover:bg-accent w-full rounded-lg p-3 text-left transition-colors',
                          table._id === tableId && 'bg-accent ring-primary ring-2',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MdTableBar className="text-primary h-5 w-5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-semibold">{table.name}</p>
                                <Badge className={`${getStatusColor(table.status)} px-1.5 py-0 text-xs`}>{table.status}</Badge>
                              </div>
                              {table.status.toUpperCase() === 'ACTIVE' && table.hiCode && (
                                <p className="text-xs font-medium text-purple-600">Code: {table.hiCode}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <MdPerson className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">{table.userIds?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="text-muted-foreground h-4 w-4" />
                            <span className="font-semibold">{table.currentTableAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MdTableBar className="text-muted-foreground mb-2 h-12 w-12" />
                    <p className="text-muted-foreground text-sm">No active tables</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="default" className="gap-2 bg-transparent font-semibold" onClick={handleMergeClick}>
          <Merge className="h-4 w-4" />
          <span className="hidden sm:inline">Merge</span>
        </Button>
      </div>

      <BottomPopUp hide rightTopBack show={showMergeModal} onClose={handleMergeCancel}>
        <div className="space-y-4 p-4">
          {/* Instructions */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="mb-2 font-semibold">Merge Instructions</h3>
            <p className="text-muted-foreground text-sm">
              You are merging <span className="text-primary font-semibold">{currentTable?.name}</span> with another table. Select the table you want
              to merge with below.
            </p>
          </div>

          {/* Current Table (Pre-selected) */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">Current Table (Selected by default)</p>
            <div className="bg-primary/10 border-primary rounded-lg border-2 p-3">
              <div className="flex items-center gap-2">
                <MdTableBar className="text-primary h-5 w-5" />
                <div className="flex-1">
                  <p className="font-semibold">{currentTable?.name}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MdPerson className="text-muted-foreground h-4 w-4" />
                      <span>{currentTable?.userIds?.length || 0} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="text-muted-foreground h-4 w-4" />
                      <span>{currentTable?.currentTableAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(currentTable?.status || '')}`}>{currentTable?.status}</Badge>
              </div>
            </div>
          </div>

          {/* Select Table to Merge With */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">Select table to merge with</p>
            <ScrollArea className="h-[300px] rounded-lg border">
              <div className="space-y-1 p-2">
                {mergeableTables.length > 0 ? (
                  mergeableTables.map((table) => (
                    <button
                      key={table._id}
                      onClick={() => setSelectedMergeTable(table._id)}
                      className={cn(
                        'hover:bg-accent w-full rounded-lg p-3 text-left transition-colors',
                        selectedMergeTable === table._id && 'bg-accent ring-primary ring-2',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MdTableBar className="text-primary h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{table.name}</p>
                            <Badge className={`${getStatusColor(table.status)} px-1.5 py-0 text-xs`}>{table.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MdPerson className="text-muted-foreground h-4 w-4" />
                              <span>{table.userIds?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="text-muted-foreground h-4 w-4" />
                              <span>{table.currentTableAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MdTableBar className="text-muted-foreground mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">No other tables available to merge</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <CommonBottomButton
            fixed={false}
            position="mid"
            buttons={[
              {
                text: 'Cancel',
                onClick: handleMergeCancel,
                color: '#6b7280',
                textColor: '#ffffff',
              },
              {
                text: 'Confirm Merge',
                onClick: handleMergeConfirm,
                color: '#10b981',
                textColor: '#ffffff',
                disable: !selectedMergeTable || selectedMergeTable === tableId,
              },
            ]}
          />
        </div>
      </BottomPopUp>
    </>
  );
};

export default memo(TableQuickNav);
