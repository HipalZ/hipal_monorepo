import SpinnerMemo from '@/components/atoms/loadingSpinner';
import { type TableData, useZonesAndTablesStore } from '@/components/store/useZonesAndTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';
import { memo, useMemo } from 'react';
import { MdPerson, MdTableBar } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

import { useCart } from '../store/useCart';
import { useOrderStore } from '../store/useOrderData.ts';
const MemoZones = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const setSelectedBill = useOrderStore((s) => s.setSelectedBill);
  const navigate = useNavigate();

  const setIsPlacingNewOrder = useCart((s) => s.setIsPlacingNewOrder);

  const zones = useZonesAndTablesStore((s) => s.zones);
  const tables = useZonesAndTablesStore((s) => s.tables);
  const activeFilter = useZonesAndTablesStore((s) => s.activeFilter);
  const searchQuery = useZonesAndTablesStore((s) => s.searchQuery);
  const setZones = useZonesAndTablesStore((s) => s.setZones);
  const setTables = useZonesAndTablesStore((s) => s.setTables);

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

  if (zonesLoading || tablesLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <SpinnerMemo />
      </div>
    );
  }

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
                      {tablesByZone[zone?.zoneId].map((table) => (
                        <motion.div
                          key={table?._id}
                          className="relative"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => goToTable(table)}
                        >
                          <Card className="overflow-hidden border border-gray-200 transition-shadow duration-300 hover:shadow-md">
                            <CardContent className="p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <MdTableBar className="text-lg text-blue-600" />
                                  <h4 className="text-base font-semibold text-gray-900">{table?.name}</h4>
                                </div>
                                <Badge className={`${getStatusColor(table?.status)} absolute -right-1 -top-2 px-1.5 py-0.5 text-xs`}>
                                  {table?.status}
                                </Badge>
                              </div>

                              {/* 👇 Show hiCode only if ACTIVE */}
                              {table?.status?.toUpperCase() === 'ACTIVE' && table?.hiCode && (
                                <div className="mb-2 text-sm font-medium text-purple-600">Code: {table.hiCode}</div>
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
    </ScrollArea>
  );
};

const Zones = memo(MemoZones);
export default Zones;
