import { useState, useCallback, Suspense, lazy, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { MdRestaurantMenu, MdReceipt } from "react-icons/md";
import { motion } from "framer-motion";
import { apiRpc } from "@hi/common";
import { Button } from "@/components/ui/button";
import type { TableData } from "@/components/store/useZonesAndTable";
import {
  type orderModal,
  useOrderStore,
} from "@/components/store/useOrderData";
import { useCart } from "@/components/store/useCart";
import { ScrollArea } from "@/components/ui/scroll-area";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import DeleteKotPanel from "@/components/delete/DeleteKot.tsx";
import TableHeader from "@/components/atoms/placeOrders/TableHeader.tsx";

// Lazy loaded components
const PlaceOrders = lazy(() => import("@/components/atoms/placeOrders"));
const BottomPopUp = lazy(() => import("@/components/atoms/universalPopup"));
const CommonBottomButton = lazy(
  () => import("@/components/atoms/bottomButton"),
);
const OrdersHeader = lazy(
  () => import("@/components/atoms/placeOrders/header"),
);
const TableOptions = lazy(
  () => import("@/components/atoms/placeOrders/tableOptions"),
);
const AddTableCount = lazy(
  () => import("@/components/atoms/placeOrders/addTableCount"),
);
const Category = lazy(() => import("@/components/atoms/placeOrders/category"));
const CartItem = lazy(() => import("@/components/atoms/placeOrders/cartItem"));
const Bill = lazy(() => import("@/components/atoms/placeOrders/bill"));
const AlertCount = lazy(
  () => import("@/components/atoms/placeOrders/alertCount"),
);
const CustomerInformation = lazy(
  () => import("@/components/atoms/placeOrders/customerInformation"),
);
const TransferItem = lazy(
  () => import("@/components/atoms/placeOrders/transferItem"),
);
const EmptyTableList = lazy(() => import("@/components/tables"));

const MemoTablePos = () => {
  const { tableId, businessId } = useParams();
  const navigate = useNavigate();
  const { isPlacingNewOrder } = useCart();

  const setSelectedTable = useOrderStore((s) => s.setSelectedTable);
  const setModalType = useOrderStore((s) => s.setModalType);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const openOrderModal = useOrderStore((s) => s.openOrderModal);
  const modalType = useOrderStore((s) => s.modalType);
  const setOpenOrderModal = useOrderStore((s) => s.setOpenOrderModal);
  const setPaymentSteps = useOrderStore((s) => s.setPaymentSteps);
  const transferTable = useOrderStore((s) => s.transferTable);
  const transferModal = useOrderStore((s) => s.transferModal);
  const setTransferModal = useOrderStore((s) => s.setTransferModal);
  const setTransferTable = useOrderStore((s) => s.setTransferTable);

  const closeTransferModal = () => {
    setTransferModal(false);
    setTransferTable("");
  };

  const [activeTab, setActiveTab] = useState("orders");

  const goToAlerts = useCallback(() => {
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  const openOrderModalHandler = useCallback(
    (type: orderModal) => {
      if (type === "bill") {
        setPaymentSteps(0);
      }
      setModalType(type);
      setOpenOrderModal(true);
    },
    [setModalType, setOpenOrderModal],
  );

  const closeOrderModalHandler = useCallback(() => {
    setOpenOrderModal(false);
  }, [setOpenOrderModal]);

  const fetchIndividualTable = async () => {
    const response = await apiRpc.table[":tableId"].$get({
      param: { tableId },
    });
    const res = await response.json();
    const tableData = res?.data as TableData;

    if (tableData?.status === "EMPTY" && isPlacingNewOrder) {
      openOrderModalHandler("addItem");
    }
    setSelectedTable(tableData);
    return res?.data;
  };

  useQuery({
    queryKey: ["fetchIndividualTable", tableId],
    queryFn: fetchIndividualTable,
    enabled: !!tableId,
  });

  return (
    <div className="relative w-full max-w-[30rem] mx-auto min-h-[100dvh] bg-gray-50">
      <Suspense fallback={<SpinnerMemo />}>
        <OrdersHeader />
      </Suspense>

      {/* Tabs */}
      <section className="sticky z-10 top-[4.25rem] py-2 bg-white shadow-sm">
        {selectedTable?.status !== "EMPTY" && (
          <div className="flex">
            <Button
              variant={activeTab === "orders" ? "default" : "ghost"}
              className="flex-1 border border-black rounded-none"
              onClick={() => setActiveTab("orders")}
            >
              <MdRestaurantMenu className="w-5 h-5 mr-2" />
              Orders
            </Button>
            <Button
              variant={activeTab === "bill" ? "default" : "ghost"}
              className="flex-1 border border-black rounded-none"
              onClick={() => openOrderModalHandler("bill")}
            >
              <MdReceipt className="w-5 h-5 mr-2" />
              Bill
            </Button>
          </div>
        )}
      </section>

      {/* Content Area */}
      <ScrollArea className="flex-grow min-h-[100dvh]">
        {activeTab === "orders" && (
          <Suspense fallback={<SpinnerMemo />}>
            <PlaceOrders />
          </Suspense>
        )}
      </ScrollArea>

      {/* Bottom Navigation */}
      <Suspense fallback={<SpinnerMemo />}>
        <CommonBottomButton
          position="mid"
          maxWidth="30rem"
          buttons={[
            {
              text: "",
              onClick: goToAlerts,
              isBackButton: true,
              className: "rounded-md pl-3",
            },
            {
              text: "Add items",
              onClick: () => openOrderModalHandler("addItem"),
              className: "w-1/2 ml-4 rounded-md",
            },
          ]}
        />
      </Suspense>

      {/* Pop-Up Modal */}
      {openOrderModal && (
        <Suspense fallback={<SpinnerMemo />}>
          <BottomPopUp
            height="h-[100dvh]"
            hide
            bottomCross={
              modalType !== "addItem" &&
              modalType !== "liveCart" &&
              modalType !== "bill" &&
              modalType !== "options"
            }
            show={openOrderModal}
            onClose={closeOrderModalHandler}
          >
            {modalType === "bill" ? (
              <TableHeader width="48rem" />
            ) : (
              <OrdersHeader width="48rem" />
            )}
            <ScrollArea className="lg:h-[100dvh] min-h-[100dvh]">
              {modalType === "guest" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  <AddTableCount
                    key={selectedTable?.capacity}
                    selectedTable={selectedTable}
                  />
                </motion.div>
              )}
              {modalType === "options" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4"
                >
                  <TableOptions />
                </motion.div>
              )}
              {modalType === "addItem" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Category />
                </motion.div>
              )}
              {modalType === "liveCart" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <CartItem />
                </motion.div>
              )}
              {modalType === "bill" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Bill />
                </motion.div>
              )}
              {modalType === "customer" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <CustomerInformation />
                </motion.div>
              )}
              {modalType === "alerts" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <AlertCount />
                </motion.div>
              )}
            </ScrollArea>
          </BottomPopUp>
          {transferModal && (
            <BottomPopUp
              hide
              rightTopBack
              show={transferModal}
              onClose={closeTransferModal}
            >
              <Suspense fallback={<SpinnerMemo />}>
                {transferTable === "ITEM" && <TransferItem />}
                {transferTable === "TABLE" && <EmptyTableList transfer />}

                {transferTable === "DELETE" && <DeleteKotPanel />}
              </Suspense>
            </BottomPopUp>
          )}
        </Suspense>
      )}
    </div>
  );
};

const TablePos = memo(MemoTablePos);
export default TablePos;
