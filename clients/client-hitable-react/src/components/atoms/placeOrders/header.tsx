import { memo, useEffect } from "react";
import useBusinessData from "@/components/store/useBusinessData";
import {
  type orderModal,
  useOrderStore,
} from "@/components/store/useOrderData";
import { SlidersHorizontal, Bell } from "lucide-react";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useTableCodeStore } from "@/components/store/useHicodeStore";

interface OrdersHeaderProps {
  width?: string;
}

const MemoOrdersHeader = ({ width = "30rem" }: OrdersHeaderProps) => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const setModalType = useOrderStore((s) => s.setModalType);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);

  const onlineCount = useLiteStore((s) => s.onlineCount);
  const offlineCount = useLiteStore((s) => s.offlineCount);
  const cartCount = useLiteStore((s) => s.cartCount);

  const addOrUpdateCode = useTableCodeStore((s) => s.addOrUpdateCode);

  useEffect(() => {
    if (
      selectedTable &&
      selectedTable.status === "ACTIVE" &&
      selectedTable.hiCode &&
      selectedTable.tableId
    ) {
      addOrUpdateCode({
        tableId: String(selectedTable.tableId),
        name: String(selectedTable.name ?? ""),
        hiCode: String(selectedTable.hiCode),
      });
    }
  }, [
    selectedTable?.tableId,
    selectedTable?.hiCode,
    selectedTable?.status,
    selectedTable?.name,
    addOrUpdateCode,
  ]);

  const openOrderModalHandler = (type: orderModal) => {
    setModalType(type);
    setOpenOrderModal(true);
  };

  const univercelCounter = () => onlineCount + offlineCount + cartCount;

  return (
    <div>
      <header
        className="fixed top-0 z-10 flex items-center justify-between w-full px-4 py-3 bg-white shadow-md"
        style={{ maxWidth: width }}
      >
        {/* Logo Section */}
        <section className="flex items-center space-x-2">
          <div className="w-[46px] h-[46px] rounded-full overflow-hidden bg-gray-100">
            <img
              src={outletInfo?.logoUrl || ""}
              alt={outletInfo?.name ? `${outletInfo.name} logo` : "logo"}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="-ml-8 text-xl font-bold text-gray-800">
            {selectedTable?.name}
            {selectedTable?.hiCode ? ` (Code :- ${selectedTable.hiCode})` : ""}
          </h1>
        </section>

        <section className="flex items-center space-x-6">
          <section className="relative">
            <Bell
              onClick={() => openOrderModalHandler("alerts")}
              className="w-6 h-6 text-red-500 cursor-pointer"
            />
            {univercelCounter() > 0 && (
              <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                {univercelCounter()}
              </span>
            )}
          </section>
          <SlidersHorizontal
            onClick={() => openOrderModalHandler("options")}
            className="w-6 h-6 text-[#8E24AA] cursor-pointer"
          />
        </section>
      </header>
    </div>
  );
};

const OrdersHeader = memo(MemoOrdersHeader);
export default OrdersHeader;
