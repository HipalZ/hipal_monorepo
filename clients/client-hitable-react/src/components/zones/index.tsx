import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { useGetBill } from '@/components/hooks/useBill';
import { useCart } from '@/components/store/useCart';
import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { type TableData, useZonesAndTablesStore } from '@/components/store/useZonesAndTable';
import type { IBillData } from '@/components/types/hiClientzData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { IndianRupee, Printer } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BiRupee } from 'react-icons/bi';
import { MdPerson, MdTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const MemoZones = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const setSelectedTable = useOrderStore((s) => s.setSelectedTable);
  const navigate = useNavigate();

  const setIsPlacingNewOrder = useCart((s) => s.setIsPlacingNewOrder);

  const zones = useZonesAndTablesStore((s) => s.zones);
  const tables = useZonesAndTablesStore((s) => s.tables);
  const activeFilter = useZonesAndTablesStore((s) => s.activeFilter);
  const searchQuery = useZonesAndTablesStore((s) => s.searchQuery);
  const setZones = useZonesAndTablesStore((s) => s.setZones);
  const setTables = useZonesAndTablesStore((s) => s.setTables);

  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canPrintBill = hasPermission('print_bill');

  const { isLoading: billLoading, data: billData, getBillCall } = useGetBill();

  // 🔹 Local state for split-bill print popup
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

  // 🔹 Track which variants are selected (for "Print Selected Bills")
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);

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
  });

  const filteredTables = useMemo(() => {
    let filtered = tables;

    if (activeFilter !== 'all') {
      filtered = filtered.filter((table) => table?.status.toLowerCase() === activeFilter.toLowerCase());
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) => table.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [tables, activeFilter, searchQuery]);

  const tablesByZone = useMemo(() => {
    const map: Record<string, TableData[]> = {};
    for (const table of filteredTables) {
      const zoneId = table.zoneId;
      if (!map[zoneId]) {
        map[zoneId] = [];
      }
      map[zoneId].push(table);
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
      setSelectedTable(table);
      setSelectedBill(null);

      const data = await getBillCall();
      const result = (data as any)?.data;
      const bill = (result ?? billData) as IBillData | IBillData[] | null;

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

  if (zonesLoading || tablesLoading || billLoading || isPrinting) {
    return <SpinnerMemo />;
  }

  return (
    <ScrollArea className="h-screen bg-gray-100">
      <div className="mx-auto w-full px-4 pb-20 pt-4 md:px-6 lg:px-8 xl:px-12">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 lg:text-3xl">Zones & Tables</h1>

        <div className="space-y-8 pb-[7rem]">
          {zones?.map((zone) => (
            <div key={zone._id} className="overflow-hidden rounded-lg bg-white">
              <h2 className="px-4 py-3 text-xl font-semibold text-black">{zone?.name}</h2>
              <div className="p-4">
                <AnimatePresence>
                  {tablesByZone[zone?.zoneId] && tablesByZone[zone?.zoneId].length > 0 ? (
                    <motion.div
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {tablesByZone[zone?.zoneId]?.map((table) => (
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
                                  onClick={(e) => {
                                    e.stopPropagation();
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
          ))}
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
              disabled={selectedVariants.length === 0}
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
  );
};

const Zones = memo(MemoZones);
export default Zones;
