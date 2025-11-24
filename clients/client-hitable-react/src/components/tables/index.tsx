import CommonBottomButton from '@/components/atoms/bottomButton';
import SpinnerMemo from '@/components/atoms/loadingSpinner';
import MergeTablesModal from '@/components/desktop/MergeTableModal';
import { useTableData, useTableTransfer } from '@/components/hooks/useTableData';
import useBusinessData from '@/components/store/useBusinessData';
import { useCart } from '@/components/store/useCart';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useMergeTableStore } from '@/components/store/useMergeTableStore';
import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { useZonesAndTablesStore, type TableData } from '@/components/store/useZonesAndTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
interface EmptyTableListProps {
  transfer?: boolean;
  onClose?: () => void;
}

const MemoEmptyTableList = ({ transfer, onClose }: EmptyTableListProps) => {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const setIsPlacingNewOrder = useCart((s) => s.setIsPlacingNewOrder);
  const { selectedTable, selectedItems } = useOrderStore();
  const { isLoading, filteredTables, searchTerm, setSearchTerm } = useTableData({
    businessIdOverride: businessId,
    enabled: true,
  });
  const isHipalzPos = useBusinessData((s) => s?.outletInfo?.isHipalzPos);
  const zones = useZonesAndTablesStore((s) => s.zones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const setShowMergeModal = useMergeTableStore((s) => s.setShowMergeModal);
  const showMergeModal = useMergeTableStore((s) => s.showMergeModal);
  const userDetails = useHiClientZ((s) => s.captainData);
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canMergeTable = hasPermission('merge_table');

  const { toTable, setToTable, isConfirming, setIsConfirming, isPending, closeTransferModal, confirmTransfer } = useTableTransfer(businessId || '');

  const tables = useZonesAndTablesStore((s) => s.tables);
  const handleMergeClick = () => setShowMergeModal(true);
  const handleMergeCancel = () => setShowMergeModal(false);

  const sortByName = useCallback(
    (arr: TableData[]) =>
      [...arr].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: 'base',
        }),
      ),
    [],
  );

  const allTables = useMemo(() => {
    if (!transfer) {
      return sortByName(filteredTables);
    }
    if (selectedItems.length > 0) {
      const merged = [...new Map([...tables, ...filteredTables].map((table) => [table._id, table])).values()];
      return sortByName(merged);
    }
    return sortByName(filteredTables);
  }, [transfer, selectedItems, tables, filteredTables, sortByName]);

  // Get available zones that have tables
  const availableZones = useMemo(() => {
    const zoneGroups = new Map();

    // Group tables by their zoneId
    for (const table of allTables) {
      const zoneId = table.zoneId;
      if (!zoneGroups.has(zoneId)) {
        zoneGroups.set(zoneId, []);
      }
      zoneGroups.get(zoneId).push(table);
    }

    // Return zones that have tables, with table counts
    const result = [];
    for (const zone of zones) {
      const zoneTables = zoneGroups.get(zone.zoneId);
      if (zoneTables && zoneTables.length > 0) {
        result.push({
          ...zone,
          tableCount: zoneTables.length,
        });
      }
    }

    return result;
  }, [allTables, zones]);

  // Group tables by zones based on selected zone
  const zonesWithTables = useMemo(() => {
    const zoneGroups = new Map();

    // Group tables by their zoneId
    for (const table of allTables) {
      const zoneId = table.zoneId;
      if (!zoneGroups.has(zoneId)) {
        zoneGroups.set(zoneId, []);
      }
      zoneGroups.get(zoneId).push(table);
    }

    const result = [];

    if (selectedZoneId === null) {
      // Show all zones
      for (const zone of zones) {
        const zoneTables = zoneGroups.get(zone.zoneId);
        if (zoneTables && zoneTables.length > 0) {
          result.push({
            zone,
            tables: sortByName(zoneTables),
          });
        }
      }
    } else {
      // Show only selected zone
      const selectedZone = zones.find((zone) => zone.zoneId === selectedZoneId);
      if (selectedZone) {
        const zoneTables = zoneGroups.get(selectedZone.zoneId);
        if (zoneTables && zoneTables.length > 0) {
          result.push({
            zone: selectedZone,
            tables: sortByName(zoneTables),
          });
        }
      }
    }

    return result;
  }, [allTables, zones, sortByName, selectedZoneId]);

  const handleZoneSelect = (zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  };

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollButtons]);

  const handleTableClick = (table: TableData) => {
    if (transfer) {
      setToTable(table);
      return;
    }
    if (isMobile) {
      setIsPlacingNewOrder(true);
    }
    return navigate(`/${businessId}/alerts/${table._id}`);
  };

  if (isLoading || isPending) return <SpinnerMemo />;

  return (
    <>
      {!isConfirming ? (
        <div className="hide-scrollbar relative mx-auto h-[100dvh] overflow-y-auto pb-8 lg:h-[80dvh]">
          <section className="sticky top-0 z-10 rounded-t-2xl bg-white px-4 pb-2 pt-4 shadow-md">
            <h2 className="mb-2 text-xl font-bold md:text-xl lg:text-2xl">{transfer ? 'Transfer Table' : 'Tables'}</h2>

            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4"
                />
              </div>
            </div>

            {availableZones.length > 0 && (
              <div className="mb-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={scrollLeft}
                    className={`absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50 lg:flex ${
                      canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>

                  <div
                    ref={scrollContainerRef}
                    className="scrollbar-hide lg:scrollbar-hide flex gap-2 overflow-x-auto px-0 lg:px-10"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                    onScroll={checkScrollButtons}
                  >
                    <Button
                      variant={selectedZoneId === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleZoneSelect(null)}
                      className={`flex-shrink-0 transition-colors ${
                        selectedZoneId === null
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All ({allTables.length})
                    </Button>

                    {availableZones.map((zone) => (
                      <Button
                        key={zone._id}
                        variant={selectedZoneId === zone.zoneId ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleZoneSelect(zone.zoneId)}
                        className={`flex-shrink-0 transition-colors ${
                          selectedZoneId === zone.zoneId
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {zone.name} ({zone.tableCount})
                      </Button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={scrollRight}
                    className={`absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50 lg:flex ${
                      canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="hide-scrollbar overflow-y-auto px-4 pb-20 pt-6">
            {zonesWithTables.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No tables found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {zonesWithTables.map(({ zone, tables }) => (
                  <div key={zone._id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="flex-1 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">{zone.name}</h3>
                      <span className="ml-2 text-sm text-gray-500">
                        {tables.length} table{tables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {tables.map((table) => (
                        <button
                          type="button"
                          onClick={() => handleTableClick(table)}
                          key={table._id}
                          className={cn(
                            `rounded-lg border p-4 text-center transition-shadow duration-300 ${
                              toTable?._id === table._id ? 'border-blue-500 bg-blue-100 shadow-lg' : 'border-gray-200 bg-white hover:shadow-md'
                            }`,
                          )}
                        >
                          <h4 className="font-semibold">{table.name}</h4>
                          <p className="mt-1 text-xs capitalize text-gray-500">{table.status?.toLowerCase() || 'empty'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className="flex h-[80dvh] flex-col items-center justify-center px-4 text-center">
          <h2 className="mb-4 text-xl font-bold text-red-600">Warning: Please Confirm the Transfer!</h2>
          <section>
            Table is transferring from <strong>{selectedTable?.name}</strong> to <strong>{toTable?.name}</strong>
          </section>
        </section>
      )}

      {showMergeModal && (
        <MergeTablesModal
          show={showMergeModal}
          onClose={handleMergeCancel}
          staffId={userDetails?._id || ''}
          tables={[...filteredTables, ...tables]}
        />
      )}

      {!transfer && isHipalzPos && canMergeTable && (
        <CommonBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: '',
              isBackButton: true,
              onClick: onClose,
              type: 'button',
              className: cn('pl-3 rounded-md', onClose ? '' : 'hidden'),
            },
            {
              text: 'Merge Tables',
              onClick: handleMergeClick,
              type: 'button',
              className: 'rounded-full',
            },
          ]}
        />
      )}

      {transfer && (
        <CommonBottomButton
          fixed={true}
          maxWidth="30rem"
          position="mid"
          buttons={[
            {
              text: 'Cancel',
              onClick: isConfirming ? () => setIsConfirming(false) : closeTransferModal,
              type: 'button',
              className: 'pl-3 rounded-md',
              isBackButton: true,
            },
            {
              text: isConfirming ? 'Confirm' : 'Transfer Table',
              onClick: isConfirming ? confirmTransfer : () => setIsConfirming(true),
              type: 'button',
              className: 'rounded-full',
              swipe: true,
              isLoading: isPending,
              disable: !toTable,
            },
          ]}
        />
      )}
    </>
  );
};

const EmptyTableList = memo(MemoEmptyTableList);
export default EmptyTableList;
