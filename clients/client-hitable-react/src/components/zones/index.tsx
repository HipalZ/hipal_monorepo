import { type FC, memo, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee } from 'lucide-react';
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import {
  type TableData,
  useZonesAndTablesStore,
  type Zone,
} from "@/components/store/useZonesAndTable";
import { apiRpc } from "@hi/common";
import { MdTableBar, MdPerson } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useCart } from "../store/useCart";
const MemoZones: FC = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const navigate = useNavigate();
  const { setIsPlacingNewOrder } = useCart();

  const {
    zones,
    tables,
    activeFilter,
    searchQuery,
    setZones,
    setTables,
  } = useZonesAndTablesStore();

  const fetchZones = async (businessId: string): Promise<Zone[]> => {
    const response = await apiRpc.zones_and_tables.zones[":businessId"].$get({
      param: { businessId },
    });
    const json = await response.json();
    setZones(json.data || []);
    return json.data || [];
  };

  const fetchTables = async (businessId: string): Promise<TableData[]> => {
    const response = await apiRpc.table.all[":businessId"].$get({
      param: { businessId },
    });
    const json = await response.json();
    setTables(json.data || []);
    return json.data || [];
  };

  const { isLoading: zonesLoading } = useQuery({
    queryKey: ["zones", businessId],
    queryFn: () => fetchZones(businessId || ""),
    enabled: !!businessId,
    // staleTime: 1000 * 60 * 5,
  });

  const { isLoading: tablesLoading } = useQuery({
    queryKey: ["tables", businessId],
    queryFn: () => fetchTables(businessId || ""),
    enabled: !!businessId,
    // staleTime: 1000 * 15,
  });

  const filteredTables = useMemo(() => {
    let filtered = tables;

    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (table) => table?.status.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((table) =>
        table.name.toLowerCase().includes(query),
      );
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
      <div className="flex items-center justify-center h-screen">
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
    setIsPlacingNewOrder(true)
    navigate(`/${businessId}/alerts/${table._id}`);
  }


  return (
    <ScrollArea className="h-screen bg-gray-100">
      <div className="w-full px-4 pt-4 pb-20 mx-auto md:px-6 lg:px-8 xl:px-12">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 lg:text-3xl">Zones & Tables</h1>

        <div className="space-y-8 pb-[7rem]">
          {zones?.map((zone) => (
            <div key={zone._id} className="overflow-hidden bg-white rounded-lg">
              <h2 className="px-4 py-3 text-xl font-semibold text-black">
                {zone?.name}
              </h2>
              <div className="p-4">
                <AnimatePresence>
                  {tablesByZone[zone?.zoneId] &&
                    tablesByZone[zone?.zoneId].length > 0 ? (
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
                          <Card className="overflow-hidden transition-shadow duration-300 border border-gray-200 hover:shadow-md">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <MdTableBar className="text-lg text-blue-600" />
                                  <h4 className="text-base font-semibold text-gray-900">{table?.name}</h4>
                                </div>
                                <Badge className={`${getStatusColor(table?.status)} px-1.5 py-0.5 text-xs absolute -top-2 -right-1`}>
                                  {table?.status}
                                </Badge>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-1">
                                  <MdPerson className="text-gray-600" />
                                  <span className="font-medium text-gray-700">
                                    {table?.userIds?.length || 0}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-base">
                                  <IndianRupee size={16} className="text-gray-600" />
                                  <span className="font-semibold text-gray-900">
                                    {table?.currentTableAmount?.toFixed(2)}
                                  </span>
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

