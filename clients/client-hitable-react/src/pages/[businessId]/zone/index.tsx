import { type FC, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaQrcode,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

import SpinnerMemo from "@/components/atoms/loadingSpinner";
import HeaderAlertsMemo from "@/components/liteAlerts/headerAlerts";
import {
  type Table,
  useZonesAndTablesStore,
  type Zone,
} from "@/components/store/useZonesAndTable";
import { apiRpc } from "@hi/common";
import { ZonesAndTables } from "@/components/zonesAndTables";
import { MdTableBar } from "react-icons/md";

const Zones: FC = () => {
  const params = useParams();
  const businessId = params.businessId as string;
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    zones,
    tables,
    activeFilter,
    setIsFilterOpen,
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

  const fetchTables = async (businessId: string): Promise<Table[]> => {
    const response = await apiRpc.zones_and_tables.tables[":businessId"].$get({
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
      const isActive = activeFilter === "active";
      filtered = filtered.filter(
        (table) => (table.active === "1") === isActive,
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
    const map: Record<string, Table[]> = {};
    for (const table of filteredTables) {
      const zoneId = table.zoneId;
      if (!map[zoneId]) {
        map[zoneId] = [];
      }
      map[zoneId].push(table);
    }
    return map;
  }, [filteredTables]);

  const { mutate: fetchHiCode, isPending: isHiCodeLoading } = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await apiRpc.pos.fetch_hicode_by_table.$get({
        query: {
          businessId: businessId,
          tableName: tableId,
        },
      });
      const json = await response.json();
      return json.data;
    },
    onSuccess: (data) => {
      if (selectedTable) {
        setSelectedTable({ ...selectedTable, hiCode: data.hiCode });
        setIsModalOpen(true);
      }
    },
  });

  if (zonesLoading || tablesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <SpinnerMemo />
      </div>
    );
  }

  return (
    <>
      <HeaderAlertsMemo hide />
      <div className="w-full px-4 pt-4 pb-20 mx-auto bg-gray-50 md:px-6 lg:px-6 xl:px-12 lg:pb-8">
        <h1 className="mb-6 text-2xl font-bold">Zones & Tables</h1>

        <div className="grid grid-cols-2 gap-4 hide-scrollbar sm:grid-cols-3 pb-[5rem] md:grid-cols-4 lg:grid-cols-5">
          {zones.map((zone) => (
            <div key={zone._id} className="mb-8 col-span-full">
              <h2 className="mb-4 text-lg font-semibold opacity-60">
                {zone?.name}
              </h2>
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]">
                {tablesByZone[zone?.zoneId] &&
                tablesByZone[zone?.zoneId].length > 0 ? (
                  tablesByZone[zone?.zoneId].map((table) => (
                    <motion.div
                      key={table._id}
                      className="p-4 transition-shadow max-w-[10rem] aspect-square duration-300 bg-white border rounded-lg shadow-sm hover:shadow-md relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <MdTableBar className="text-xl " />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            table.active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {table.active === "1" ? (
                            <>
                              <FaCheckCircle className="inline mr-1" /> Active
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="inline mr-1" /> Inactive
                            </>
                          )}
                        </span>
                      </div>
                      <h4 className="text-lg font-medium">{table?.name}</h4>
                      {table.active === "1" && (
                        <button
                          onClick={() => {
                            setSelectedTable(table);
                            fetchHiCode(table.name);
                          }}
                          type="button"
                          className="absolute flex items-center px-4 py-1 text-xs text-white bg-black rounded-full bottom-2"
                        >
                          <FaQrcode className="mr-1" /> View HiCode
                        </button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-full">
                    No tables found.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <motion.button
          className="fixed p-4 text-white bg-black rounded-full shadow-lg bottom-4 right-4 lg:hidden"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFilterOpen(true)}
        >
          <FaFilter />
        </motion.button>

        <ZonesAndTables />

        <AnimatePresence>
          {isModalOpen && selectedTable && (
            <Dialog
              as={motion.div}
              static
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              className="relative z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-sm p-6 bg-white rounded">
                  <DialogTitle className="mb-2 text-lg font-medium">
                    {selectedTable.name}
                  </DialogTitle>
                  {isHiCodeLoading ? (
                    <div className="flex justify-center">
                      <SpinnerMemo />
                    </div>
                  ) : selectedTable.hiCode ? (
                    <p className="mb-4 text-2xl font-bold text-center">
                      {selectedTable.hiCode}
                    </p>
                  ) : (
                    <p className="text-center text-red-500">
                      No HiCode available
                    </p>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </DialogPanel>
              </div>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Zones;
