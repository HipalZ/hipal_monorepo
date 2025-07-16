import { memo, useCallback,useEffect, useMemo, useState, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpinnerMemo from "../atoms/loadingSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../store/useCart";
import CommonBottomButton from "../atoms/bottomButton";
import {
  useZonesAndTablesStore,
  type TableData,
} from "../store/useZonesAndTable";
import { useTableData, useTableTransfer } from "../hooks/useTableData";
import { useOrderStore } from "../store/useOrderData";

interface EmptyTableListProps {
  transfer?: boolean;
}

const MemoEmptyTableList = ({ transfer }: EmptyTableListProps) => {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { setIsPlacingNewOrder } = useCart();
  const { selectedTable, selectedItems } = useOrderStore();
  const { isLoading, filteredTables, searchTerm, setSearchTerm } =
    useTableData();
  const zones = useZonesAndTablesStore((s) => s.zones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null); // null means "All"
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    toTable,
    setToTable,
    isConfirming,
    setIsConfirming,
    isPending,
    closeTransferModal,
    confirmTransfer,
  } = useTableTransfer(businessId || "");

  const tables = useZonesAndTablesStore((s) => s.tables);

  const sortByName = useCallback(
    (arr: TableData[]) =>
      [...arr].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      ),
    [],
  );

  const allTables = useMemo(() => {
    if (!transfer) {
      return sortByName(filteredTables);
    }
    if (selectedItems.length > 0) {
      const merged = [
        ...new Map(
          [...tables, ...filteredTables].map((table) => [table._id, table]),
        ).values(),
      ];
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
  console.log("zonesWithTables", zonesWithTables);

  const handleZoneSelect = (zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  };

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollButtons]);

  const handleTableClick = (table: TableData) => {
    if (transfer) {
      setToTable(table);
      return;
    }
    setIsPlacingNewOrder(true);
    return navigate(`/${businessId}/alerts/${table._id}`);
  };

  if (isLoading || isPending) return <SpinnerMemo />;

  return (
    <>
      {!isConfirming ? (
        <div className="relative pb-8 mx-auto h-[100dvh] lg:h-[80dvh] overflow-y-auto hide-scrollbar">
          <section className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-white shadow-md rounded-t-2xl">
            <h2 className="mb-2 text-xl font-bold md:text-xl lg:text-2xl">
              {transfer ? "Transfer Table" : "Tables"}
            </h2>

            <div className="mb-3">
              <div className="relative">
                <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  type="search"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4"
                />
              </div>
            </div>

            {/* Zone Selection Buttons */}
            {availableZones.length > 0 && (
              <div className="mb-3">
                <div className="relative">
                  {/* Left scroll button - hidden on mobile */}
                  <button
                    type="button"
                    onClick={scrollLeft}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all ${
                      canScrollLeft
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                    disabled={!canScrollLeft}
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Scrollable container */}
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide lg:scrollbar-hide px-0 lg:px-10"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                    onScroll={checkScrollButtons}
                  >
                    {/* All Button */}
                    <Button
                      variant={selectedZoneId === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleZoneSelect(null)}
                      className={`flex-shrink-0 transition-colors ${
                        selectedZoneId === null
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                      }`}
                    >
                      All ({allTables.length})
                    </Button>

                    {/* Zone Buttons */}
                    {availableZones.map((zone) => (
                      <Button
                        key={zone._id}
                        variant={
                          selectedZoneId === zone.zoneId ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleZoneSelect(zone.zoneId)}
                        className={`flex-shrink-0 transition-colors ${
                          selectedZoneId === zone.zoneId
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                        }`}
                      >
                        {zone.name} ({zone.tableCount})
                      </Button>
                    ))}
                  </div>

                  {/* Right scroll button - hidden on mobile */}
                  <button
                    type="button"
                    onClick={scrollRight}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-all ${
                      canScrollRight
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                    disabled={!canScrollRight}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="px-4 pt-6 pb-20 overflow-y-auto hide-scrollbar">
            {zonesWithTables.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No tables found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {zonesWithTables.map(({ zone, tables }) => (
                  <div key={zone._id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 flex-1">
                        {zone.name}
                      </h3>
                      <span className="text-sm text-gray-500 ml-2">
                        {tables.length} table{tables.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                      {tables.map((table) => (
                        <button
                          type="button"
                          onClick={() => handleTableClick(table)}
                          key={table._id}
                          className={`p-4 text-center transition-shadow duration-300 rounded-lg border ${
                            toTable?._id === table._id
                              ? "bg-blue-100 border-blue-500 shadow-lg"
                              : "bg-white border-gray-200 hover:shadow-md"
                          }`}
                        >
                          <h4 className="font-semibold">{table.name}</h4>
                          <p className="text-xs text-gray-500 mt-1 capitalize">
                            {table.status?.toLowerCase() || "empty"}
                          </p>
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
        <section className="flex flex-col items-center justify-center h-[80dvh] text-center px-4">
          <h2 className="mb-4 text-xl font-bold text-red-600">
            Warning: Please Confirm the Transfer!
          </h2>
          <section>
            Table is transferring from <strong>{selectedTable?.name}</strong> to{" "}
            <strong>{toTable?.name}</strong>
          </section>
        </section>
      )}

      {transfer && (
        <CommonBottomButton
          fixed
          maxWidth="48rem"
          buttons={[
            {
              text: "Cancel",
              onClick: isConfirming
                ? () => setIsConfirming(false)
                : closeTransferModal,
              type: "button",
              className: "pl-3 rounded-md",
              isBackButton: true,
            },
            {
              text: isConfirming ? "Confirm" : "Transfer Table",
              onClick: isConfirming
                ? confirmTransfer
                : () => setIsConfirming(true),
              type: "button",
              className: "rounded-full",
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
