import { type FC, memo, useCallback, useMemo } from "react";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MemoZones: FC = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const navigate = useNavigate();

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
    enabled: Boolean(businessId),
    staleTime: 1000 * 60 * 5,
  });

  const { isLoading: tablesLoading } = useQuery({
    queryKey: ["tables", businessId],
    queryFn: () => fetchTables(businessId || ""),
    enabled: Boolean(businessId),
    staleTime: 1000 * 15,
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
    navigate(`/${businessId}/${table._id}`);
  }

  return (
    <ScrollArea className="h-screen bg-gray-100">
      <div className="w-full px-4 pt-4 pb-20 mx-auto md:px-6 lg:px-8 xl:px-12">
        <h1 className="mb-6 text-xl font-bold text-gray-900 lg:text-2xl">Zones & Tables</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pb-[7rem]">
          {zones.map((zone) => (
            <Card key={zone._id} className="overflow-hidden shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800">
                <CardTitle className="text-2xl font-bold text-white">
                  {zone?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <AnimatePresence>
                  {tablesByZone[zone?.zoneId] &&
                    tablesByZone[zone?.zoneId].length > 0 ? (
                    <motion.div
                      className="grid grid-cols-2 gap-2"
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
                          <Card className="overflow-hidden transition-shadow duration-300 border-2 border-gray-200 shadow-md hover:shadow-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3 ">
                                <div className="flex items-center space-x-2">
                                  <MdTableBar className="text-2xl text-blue-600" />
                                  <h4 className="text-lg font-semibold text-gray-900">{table?.name}</h4>
                                </div>
                                <Badge className={`${getStatusColor(table?.status)} px-2 py-1 absolute -right-1 -top-1`}>
                                  {table?.status}
                                </Badge>
                              </div>
                              <Separator className="my-3" />
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="flex flex-col items-center space-x-2 md:flex-row">
                                  <MdPerson className="text-lg text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {table?.totalUserIds?.length || 0} Users
                                  </span>
                                </div>
                                <div className="flex flex-col items-center space-x-1 md:flex-row">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

const Zones = memo(MemoZones);
export default Zones;

