import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { useGetBillWithTableName } from '@/components/hooks/useBill';
import { useKotPrintingStatus } from '@/components/hooks/useCheckKotStatus';
import { useReprintKot } from '@/components/hooks/usePrint';
import { useCart } from '@/components/store/useCart';
import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { useTableFilterStore } from '@/components/store/useTableFilterStore';
import { type TableData, useZonesAndTablesStore } from '@/components/store/useZonesAndTable';
import type { IBillData } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FailedKotListModal } from '@/components/zones/FailedKotListModal';
import { cn } from '@/lib/utils';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Filter, IndianRupee, Printer, Search, X } from 'lucide-react';
import { type FC, memo, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BiRupee } from 'react-icons/bi';
import { MdPerson, MdTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

// Natural Sort Algorithm
const naturalSort = (a: string, b: string) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

const MemoZones = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const setSelectedTable = useOrderStore((s) => s.setSelectedTable);
  const navigate = useNavigate();
  const [isFailedKotModalOpen, setIsFailedKotModalOpen] = useState(false);
  const setIsPlacingNewOrder = useCart((s) => s.setIsPlacingNewOrder);
  const { mutateAsync: reprint } = useReprintKot();
  const zones = useZonesAndTablesStore((s) => s.zones);
  const tables = useZonesAndTablesStore((s) => s.tables);
  const setZones = useZonesAndTablesStore((s) => s.setZones);
  const setTables = useZonesAndTablesStore((s) => s.setTables);

  // Filter Store
  const filterZones = useTableFilterStore((s) => s.filterZones);
  const setFilterZones = useTableFilterStore((s) => s.setFilterZones);
  const searchQuery = useTableFilterStore((s) => s.searchQuery);
  const setSearchQuery = useTableFilterStore((s) => s.setSearchQuery);
  const activeFilter = useTableFilterStore((s) => s.activeFilter); // e.g. 'all' | 'active' | ...

  const { failed, failedCount } = useKotPrintingStatus(businessId);
  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canPrintBill = hasPermission('print_bill');

  const { isBillPending, mutateAsync } = useGetBillWithTableName();
  const [isPrinting, setIsPrinting] = useState(false);
  const [splitPrintState, setSplitPrintState] = useState<{
    open: boolean;
    bills: IBillData[];
    table: TableData | null;
  }>({
    open: false,
    bills: [],
    table: null,
  });

  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    if (searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
  }, []);

  const toggleZoneFilter = (zoneId: string) => {
    if (filterZones.includes(zoneId)) {
      const next = filterZones.filter((id) => id !== zoneId);
      setFilterZones(next);
    } else {
      setFilterZones([...filterZones, zoneId]);
    }
  };

  const clearZoneFilter = () => setFilterZones([]); // "All Zones"

  const toggleVariantSelection = (variantId: string | undefined) => {
    if (!variantId) return;
    setSelectedVariants((prev) => (prev.includes(variantId) ? prev.filter((id) => id !== variantId) : [...prev, variantId]));
  };

  const fetchZones = async (businessId: string) => {
    const response = await apiRpc.zones_and_tables.zones[':businessId'].$get({
      param: { businessId },
    });
    const json = await response.json();
    const zonesData = json.data || [];
    setZones(zonesData);
    return zonesData;
  };

  const fetchTables = async (businessId: string) => {
    const response = await apiRpc.table.all[':businessId'].$get({
      param: { businessId },
    });
    const json = await response.json();
    const tablesData = json.data || [];
    setTables(tablesData);
    return tablesData;
  };

  const { isLoading: zonesLoading } = useQuery({
    queryKey: ['zones', businessId],
    queryFn: () => fetchZones(businessId || ''),
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  const { isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', businessId],
    queryFn: () => fetchTables(businessId || ''),
    enabled: !!businessId,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: false,
    // staleTime: 1000 * 15,
  });

  // 1. Filter Tables
  const filteredTables = useMemo(() => {
    let filtered = tables;

    // Filter by Status
    if (activeFilter !== 'all') {
      filtered = filtered.filter((table) => table?.status.toLowerCase() === activeFilter.toLowerCase());
    }

    // Filter by Search (Name or Code)
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) => {
        const nameMatch = table.name.toLowerCase().includes(query);
        const codeMatch = table.hiCode?.toLowerCase().includes(query);
        return nameMatch || codeMatch;
      });
    }

    // Filter by Selected Zones (if not empty "All Zones")
    if (filterZones.length > 0) {
      filtered = filtered.filter((table) => filterZones.includes(table.internalZoneId));
    }

    return filtered;
  }, [tables, activeFilter, searchQuery, filterZones]);

  // 2. Sort Zones Alphabetically
  const sortedZones = useMemo(() => {
    if (!zones) return [];
    return [...zones].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, {
        sensitivity: 'base',
      }),
    );
  }, [zones]);

  // 3. Group Tables by Zone & Sort Dictionary
  const tablesByZone = useMemo(() => {
    const map: Record<string, TableData[]> = {};

    // Initialize map with empty arrays for filtered tables grouping
    for (const table of filteredTables) {
      const zoneId = table.internalZoneId;
      if (!map[zoneId]) {
        map[zoneId] = [];
      }
      map[zoneId].push(table);
    }

    // Sort Tables inside each Zone (Natural Sort)
    for (const zoneId in map) {
      map[zoneId].sort((a, b) => {
        // Priority 1: Natural sort by name (T1, T2, T10)
        if (a.name && b.name) {
          const nameSort = naturalSort(a.name, b.name);
          if (nameSort !== 0) return nameSort;
        }
        // Priority 2: Fallback to Code
        if (a.hiCode && b.hiCode) {
          return naturalSort(a.hiCode, b.hiCode);
        }
        // Priority 3: Fallback to ID
        return (a._id || '').localeCompare(b._id || '');
      });
    }

    return map;
  }, [filteredTables]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'BILL':
        return 'bg-yellow-500 text-yellow-50';
      case 'ACTIVE':
        return 'bg-green-500 text-green-50';
      case 'EMPTY':
        return 'bg-gray-500 text-gray-50';
      default:
        return 'bg-gray-500 text-gray-50';
    }
  };

  const goToTable = (table: TableData) => {
    setIsPlacingNewOrder(true);
    setSelectedBill(null);
    navigate(`/${businessId}/alerts/${table._id}`);
  };

  const reprintFromZones = async (payload: { businessId: string; tableName: string; variantId?: string }) => {
    const res = await apiRpc.pos.re_print_bill.$post({
      json: payload,
    });
    const json = await res.json();

    if (res.status === 200 || res.status === 201) {
      toast.success('Bill reprinted successfully');
    } else {
      toast.error(json.message || 'Failed to reprint bill');
    }
  };

  const printBill = async (table: TableData) => {
    try {
      setIsPrinting(true);
      setSelectedBill(null);

      const data = await mutateAsync(table.name);
      const result = data as IBillData | IBillData[];
      console.log('Fetched bill data for printing from Zones:', result);
      const bill = result as IBillData | IBillData[] | null;

      if (!bill) {
        toast.error('No bill found for this table.');
        return;
      }

      if (Array.isArray(bill)) {
        setSelectedVariants([]);
        setSplitPrintState({
          open: true,
          bills: bill,
          table,
        });
        return;
      }

      await reprintFromZones({
        businessId,
        tableName: table.name,
      });
    } catch (err) {
      console.error('Failed to fetch/print bill from Zones:', err);
      toast.error('Unable to fetch bill for printing.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleReprintKot = async (entry: { tableName: string; _id: string }) => {
    await reprint(entry._id);
  };

  if (zonesLoading || tablesLoading) {
    return <SpinnerMemo />;
  }

  return (
    <>
      <ScrollArea className="h-screen bg-gray-100">
        <div className="mx-auto w-full px-4 pb-20 pt-4 md:px-6 lg:px-8 xl:px-12">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Zones & Tables</h1>

            {/* ⚠ Failed KOT banner button – only appears if failedCount > 0 */}
            {failedCount > 0 && (
              <Button
                variant="destructive"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md"
                onClick={() => setIsFailedKotModalOpen(true)}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {failedCount} failed KOT
                  {failedCount > 1 ? 's' : ''} – click here to review & reprint
                </span>
              </Button>
            )}
          </div>

          {/* --- Search and Filter Bar --- */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tables by name or code..."
                className="pl-9"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localSearch && (
                <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Zone Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filterZones.length === 0 ? 'All Zones' : `${filterZones.length} Zone${filterZones.length > 1 ? 's' : ''} Selected`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-semibold">Filter Zones</span>
                    {filterZones.length > 0 && (
                      <button onClick={clearZoneFilter} type="button" className="text-primary text-xs font-medium hover:underline">
                        Clear All
                      </button>
                    )}
                  </div>
                  <Separator />
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2 p-1">
                      {/* All Zones Option */}
                      <div
                        className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100"
                        role="button"
                        tabIndex={0}
                        onClick={() => clearZoneFilter()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            clearZoneFilter();
                          }
                        }}
                      >
                        <Checkbox checked={filterZones.length === 0} onCheckedChange={() => clearZoneFilter()} />
                        <Label className="cursor-pointer text-sm font-normal">All Zones</Label>
                      </div>
                      <Separator className="my-1 opacity-50" />
                      {/* Individual Zones */}
                      {sortedZones.map((zone) => (
                        <div
                          key={zone._id}
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100"
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleZoneFilter(zone._id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              toggleZoneFilter(zone._id);
                            }
                          }}
                        >
                          <Checkbox checked={filterZones.includes(zone._id)} onCheckedChange={() => toggleZoneFilter(zone._id)} />
                          <Label className="cursor-pointer text-sm font-normal">{zone.name}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-8 pb-[7rem]">
            {filteredTables.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center text-center text-gray-500">
                <MdTableBar className="mb-4 h-16 w-16 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">No tables found</h3>
                <p>Try adjusting your search or filters.</p>
                {(localSearch || filterZones.length > 0) && (
                  <Button
                    variant="link"
                    className="mt-2"
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      clearZoneFilter();
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              sortedZones.map((zone) => {
                const zoneTables = tablesByZone[zone._id] || [];
                if (zoneTables.length === 0) return null;

                return (
                  <div key={zone._id} className="overflow-hidden rounded-lg bg-white">
                    <h2 className="px-4 py-3 text-xl font-semibold text-black">{zone?.name}</h2>
                    <div className="p-4">
                      <AnimatePresence>
                        {zoneTables.length > 0 ? (
                          <motion.div
                            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {zoneTables.map((table) => (
                              <motion.div
                                key={table?._id}
                                className={cn('relative', table.isMerge && 'col-span-2')}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => goToTable(table)}
                              >
                                <Card
                                  className={cn(
                                    'overflow-hidden border transition-shadow duration-300 hover:shadow-md',
                                    table.isMerge
                                      ? 'border-purple-200 bg-gradient-to-r from-white via-white to-purple-50 dark:from-purple-950 dark:via-slate-900 dark:to-purple-950'
                                      : 'border-gray-200 bg-white dark:bg-slate-900',
                                    table.isBillGenerated && 'border-yellow-300 bg-yellow-200',
                                  )}
                                >
                                  <CardContent className="p-3">
                                    <Badge className={`${getStatusColor(table?.status)} absolute -right-1 -top-2 px-1.5 py-0.5 text-xs`}>
                                      {table?.status}
                                    </Badge>
                                    <div className="flex items-center space-x-2">
                                      <MdTableBar className="text-lg text-blue-600" />
                                      <h4 className="text-base font-semibold text-gray-900">{table?.name}</h4>
                                    </div>

                                    {table?.status?.toUpperCase() === 'ACTIVE' && table?.hiCode && (
                                      <div className="mb-2 text-sm font-semibold text-purple-700 opacity-80">Code: {table.hiCode}</div>
                                    )}

                                    {table.isMerge && table.mergeTableIds?.length > 0 && (
                                      <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-primary text-xs font-semibold">Merged with:</span>
                                        {table.mergeTableIds.map((m, i) => (
                                          <div key={m._id} className="flex items-center">
                                            <Badge
                                              variant="secondary"
                                              className="rounded-full bg-purple-50 text-xs text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                                            >
                                              <MdTableBar className="pr-1 text-lg text-purple-600" />
                                              {m.name}
                                            </Badge>
                                            {i !== table.mergeTableIds.length - 1 && (
                                              <Separator orientation="vertical" className="mx-1 h-4 w-px bg-purple-300/50 dark:bg-purple-700/50" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <Separator className="my-2" />

                                    <div className="mt-2 flex items-center justify-between">
                                      <div className="flex items-center space-x-1">
                                        <MdPerson className="text-gray-600" />
                                        <span className="font-medium text-gray-700">{table?.userIds?.length || 0}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-base">
                                        <IndianRupee size={16} className="text-gray-600" />
                                        <span className="font-semibold text-gray-900">{table?.currentTableAmount?.toFixed(2)}</span>
                                      </div>
                                    </div>

                                    {table.currentTableAmount > 0 && canPrintBill && (
                                      <Button
                                        disabled={isPrinting || isBillPending}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTable(table);
                                          printBill(table);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="absolute right-2 top-6 hidden px-2 lg:block"
                                      >
                                        <Printer className="!h-6 !w-6 text-2xl text-yellow-900" />
                                      </Button>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <p className="py-4 text-center text-gray-500">No tables found in this zone.</p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {splitPrintState.open && splitPrintState.table && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[22rem] rounded-lg bg-white p-4 shadow-xl">
              <h2 className="mb-2 text-lg font-bold">Split Bill – {splitPrintState.table.name}</h2>
              <p className="mb-3 text-sm text-gray-600">
                This table has {splitPrintState.bills.length} split bills. You can tap to select, then print selected or all.
              </p>

              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
                {splitPrintState.bills.map((bill) => {
                  const id = bill.variantId || '';
                  const isSelected = selectedVariants.includes(id);

                  return (
                    <Button
                      key={id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleVariantSelection(id)}
                      className={cn('h-[5rem] w-full flex-col rounded-2xl')}
                    >
                      <div>Bill {bill.variantName || id}</div>
                      <div className="flex items-center font-semibold">
                        <BiRupee />
                        {bill.total?.toFixed(2)}
                      </div>
                    </Button>
                  );
                })}
              </div>

              <Button
                className="mt-4 w-full rounded-md bg-blue-600 text-white"
                disabled={selectedVariants.length === 0 || isPrinting}
                onClick={async () => {
                  try {
                    if (selectedVariants.length === 0) return;
                    setIsPrinting(true);
                    for (const variantId of selectedVariants) {
                      await reprintFromZones({
                        businessId,
                        tableName: splitPrintState.table!.name,
                        variantId,
                      });
                    }
                  } finally {
                    setIsPrinting(false);
                    setSplitPrintState({ open: false, bills: [], table: null });
                    setSelectedVariants([]);
                  }
                }}
              >
                Print Selected Bills ({selectedVariants.length})
              </Button>

              <Button
                disabled={isPrinting}
                className="mt-2 w-full rounded-md bg-purple-600 text-white"
                onClick={async () => {
                  try {
                    setIsPrinting(true);
                    for (const bill of splitPrintState.bills) {
                      if (!bill.variantId) continue;
                      await reprintFromZones({
                        businessId,
                        tableName: splitPrintState.table!.name,
                        variantId: bill.variantId,
                      });
                    }
                  } finally {
                    setIsPrinting(false);
                    setSplitPrintState({ open: false, bills: [], table: null });
                    setSelectedVariants([]);
                  }
                }}
              >
                Print All Bills
              </Button>

              <Button
                variant="outline"
                className="mt-2 w-full rounded-md"
                onClick={() => {
                  setSplitPrintState({ open: false, bills: [], table: null });
                  setSelectedVariants([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
      <FailedKotListModal
        show={isFailedKotModalOpen}
        onClose={() => setIsFailedKotModalOpen(false)}
        failed={failed}
        failedCount={failedCount}
        onReprintKot={handleReprintKot}
      />
    </>
  );
};

const Zones = memo(MemoZones);
export default Zones;
