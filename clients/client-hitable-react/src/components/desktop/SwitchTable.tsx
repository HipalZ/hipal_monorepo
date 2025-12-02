import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/universalPopup';
import { useZonesAndTablesStore, type TableData } from '@/components/store/useZonesAndTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@hi/common';
import { ChevronLeft, ChevronRight, IndianRupee, Search } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MdPerson, MdTableBar } from 'react-icons/md';

interface Props {
  show: boolean;
  onClose: () => void;
  tables: TableData[];
  currentTable?: TableData | null;
  onSwitch: (table: TableData) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'BILL':
      return 'bg-yellow-500 text-yellow-50';
    case 'ACTIVE':
      return 'bg-purple-500 text-purple-50';
    default:
      return 'bg-gray-500 text-gray-50';
  }
};

const SwitchTablesModal = ({ show, onClose, currentTable, tables, onSwitch }: Props) => {
  const zones = useZonesAndTablesStore((s) => s.zones);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTables = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return tables.filter((t) => t.name.toLowerCase().includes(query));
  }, [tables, searchTerm]);

  // group tables by zone
  const tablesByZone = useMemo(() => {
    const map = new Map<string, TableData[]>();
    for (const t of filteredTables) {
      if (!map.has(t.zoneId)) map.set(t.zoneId, []);
      map.get(t.zoneId)?.push(t);
    }
    return map;
  }, [filteredTables]);

  const availableZones = useMemo(
    () =>
      zones
        .filter((z) => tablesByZone.has(z.zoneId))
        .map((z) => ({
          ...z,
          tableCount: tablesByZone.get(z.zoneId)?.length ?? 0,
        })),
    [zones, tablesByZone],
  );

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  useEffect(() => {
    checkScrollButtons();
    const resize = () => checkScrollButtons();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [checkScrollButtons]);

  return (
    <BottomPopUp show={show} onClose={onClose} hide rightTopBack width="w-full lg:w-[95dvw]" height="h-[100dvh] lg:h-[90dvh]">
      <div className="flex h-full flex-col space-y-4 p-4">
        {/* Header */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 text-lg font-semibold">Switch Table</h3>
          <p className="text-muted-foreground text-sm">
            You are currently on <span className="font-semibold">{currentTable?.name}</span>. Select another table to switch.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search tables..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Zone Tabs */}
        {availableZones.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={scrollLeft}
              className={`absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 lg:flex ${
                canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>

            <div ref={scrollContainerRef} className="scrollbar-hide flex gap-2 overflow-x-auto px-0 lg:px-10" onScroll={checkScrollButtons}>
              <Button
                variant={selectedZoneId === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedZoneId(null)}
                className={`flex-shrink-0 ${selectedZoneId === null ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                All ({filteredTables.length})
              </Button>

              {availableZones.map((zone) => (
                <Button
                  key={zone._id}
                  variant={selectedZoneId === zone.zoneId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedZoneId(zone.zoneId)}
                  className={`flex-shrink-0 ${selectedZoneId === zone.zoneId ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {zone.name} ({zone.tableCount})
                </Button>
              ))}
            </div>

            <button
              type="button"
              onClick={scrollRight}
              className={`absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm hover:bg-gray-50 lg:flex ${
                canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Table Grid */}
        <ScrollArea className="flex-1 rounded-lg border">
          <div className="space-y-8 p-4 pb-[10rem]">
            {zones
              .filter((z) => selectedZoneId === null || z.zoneId === selectedZoneId)
              .map((zone) => {
                const zoneTables = tablesByZone.get(zone.zoneId) || [];
                if (zoneTables.length === 0) return null;

                return (
                  <div key={zone._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{zone.name}</h4>
                      <span className="text-sm text-gray-500">{zoneTables.length} tables</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                      {zoneTables.map((table) => (
                        <button
                          type="button"
                          key={table._id}
                          onClick={() => setSelectedTable(table._id)}
                          disabled={table._id === currentTable?._id}
                          className={cn(
                            'relative rounded-lg border p-3 text-left transition-all hover:shadow-md',
                            selectedTable === table._id && 'ring-primary bg-accent ring-2',
                            table._id === currentTable?._id && 'cursor-not-allowed opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <MdTableBar className="text-primary h-5 w-5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{table.name}</p>
                                <Badge className={cn(getStatusColor(table.status), 'absolute right-0 top-0 px-1.5 py-0 text-xs')}>
                                  {table.status}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* 🔽 Merge Info */}
                          {table.isMerge && table.mergeTableIds?.length > 0 && (
                            <>
                              <Separator className="my-2" />
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-muted-foreground text-[11px] font-medium">Merged:</span>
                                {table.mergeTableIds.map((m, i) => (
                                  <div key={m._id} className="flex items-center">
                                    <Badge
                                      variant="secondary"
                                      className="rounded-full bg-purple-50 text-xs text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                    >
                                      {m.name}
                                    </Badge>
                                    {i !== table.mergeTableIds.length - 1 && (
                                      <Separator orientation="vertical" className="mx-1 h-4 w-px bg-purple-300/50 dark:bg-purple-700/50" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <Separator className="my-2" />

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <MdPerson className="text-muted-foreground h-4 w-4" />
                              <span>{table.userIds?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="text-muted-foreground h-4 w-4" />
                              <span>{table.currentTableAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>

        {/* Footer Buttons */}
        <CommonBottomButton
          fixed={true}
          position="mid"
          maxWidth="30rem"
          buttons={[
            {
              text: '',
              onClick: onClose,
              isBackButton: true,
              className: 'rounded-md pl-3',
            },
            {
              text: 'Switch',
              onClick: () => {
                const target = tables.find((t) => t._id === selectedTable);
                if (target) onSwitch(target);
              },
              color: '#7c3aed',
              textColor: '#ffffff',
              disable: !selectedTable,
            },
          ]}
        />
      </div>
    </BottomPopUp>
  );
};

export default memo(SwitchTablesModal);
