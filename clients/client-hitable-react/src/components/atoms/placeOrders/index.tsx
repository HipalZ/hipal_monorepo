import { Info, Search, X } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { useDebounce } from "@/components/hooks/useDebounce";
import { useGetAllOrders } from "@/components/hooks/useOrder.ts";
import { useTempItemStore } from "@/components/store/useTempItemStore";

import type { OrderData } from "@/components/types/hiClientzData";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import FloatingTableActions from "@/components/atoms/placeOrders/FloatingButton";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import TempItemModal from "@/components/desktop/TempItem";
import EnhancedOrderCard from "@/components/atoms/placeOrders/orderCard";

const MemoPlaceOrders = () => {
  const { isLoading, data } = useGetAllOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const openItem = useTempItemStore((s) => s.openItem);
  const setOpenItem = useTempItemStore((s) => s.setOpenItem);

  const filteredOrders = useMemo(() => {
    const currentOrders = data || [];

    if (debouncedSearchTerm.length < 3) {
      return currentOrders;
    }

    const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();

    return currentOrders.filter((order: OrderData) =>
      order.cart.some((item) =>
        item.dish.name.toLowerCase().includes(lowerCaseSearchTerm),
      ),
    );
  }, [data, debouncedSearchTerm]);

  const handleSearchToggle = () => {
    setIsSearchActive((prev) => !prev);
    if (isSearchActive) {
      setSearchTerm(""); // clear when closing
    }
  };

  if (isLoading) {
    return <SpinnerMemo />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <p className="text-lg text-gray-500">No orders found for this table.</p>
        {!isSearchActive && <FloatingTableActions />}
      </div>
    );
  }

  return (
    <>
      <ScrollArea
        className={`min-h-[calc(100vh-8rem)] py-[5rem] ${
          isSearchActive ? "pb-40" : "pb-20"
        }`}
      >
        <div className="space-y-4 px-4">
          {filteredOrders.length === 0 && debouncedSearchTerm.length >= 3 ? (
            <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center text-gray-500">
              <Info className="mb-4 h-12 w-12" />
              <p className="text-lg font-medium">No matching orders found.</p>
              <p className="text-sm">Adjust your search and try again.</p>
            </div>
          ) : (
            filteredOrders.map((order: OrderData) => (
              <EnhancedOrderCard key={order._id} order={order} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Fixed container for search input and action buttons */}
      <div className="fixed bottom-14 left-0 right-0 z-30">
        <div className="mx-auto max-w-md px-4 pb-4">
          {/* Search Input - only when active */}
          {isSearchActive && (
            <div className="relative bg-white">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by item name (min 3 chars)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-md border py-2 pl-10 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={handleSearchToggle}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!isSearchActive && (
            <div className="flex items-center justify-between">
              {/* Search Toggle Button */}
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full shadow-lg ${
                  isSearchActive
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={handleSearchToggle}
                aria-label={isSearchActive ? "Close search" : "Open search"}
              >
                {isSearchActive ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Search className="h-6 w-6" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isSearchActive && <FloatingTableActions />}

      {openItem && (
        <TempItemModal show={openItem} onClose={() => setOpenItem(false)} />
      )}
    </>
  );
};

const PlaceOrders = memo(MemoPlaceOrders);
export default PlaceOrders;
