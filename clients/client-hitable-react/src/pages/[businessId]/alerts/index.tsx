import { memo, useCallback, useState, Suspense, lazy } from "react";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useZonesAndTablesStore } from "@/components/store/useZonesAndTable";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useFilters } from "@/components/store/useFilters";
import SpinnerMemo from "@/components/atoms/loadingSpinner";

// Lazy loaded components
const HeaderAlerts = lazy(() => import("@/components/liteAlerts/headerAlerts"));
const SalesLite = lazy(() => import("@/components/atoms/salesLite"));
const OnlineAlerts = lazy(() => import("@/components/liteAlerts/onlineAlerts"));
const History = lazy(() => import("@/components/liteAlerts/history"));
const BillPopUpMemo = lazy(() => import("@/components/atoms/billPopUp"));
const CartItems = lazy(() => import("@/components/atoms/cartItem"));
const NavItems = lazy(() => import("@/components/atoms/navItems"));
const Zones = lazy(() => import("@/components/zones"));
const BottomPopUp = lazy(() => import("@/components/atoms/universalPopup"));
const ZoneFilters = lazy(() => import("@/components/zones/zoneFilters"));
const CommonBottomButton = lazy(() => import("@/components/atoms/bottomButton"));
const EmptyTableList = lazy(() => import("@/components/tables"));
const CallCaptanMainComp = lazy(() => import("@/components/liteAlerts/callWaiter"));

const AlertsMemo = () => {
  const { selectedNavItem } = useLiteStore();
  const { setIsFilterOpen, isFilterOpen } = useZonesAndTablesStore();
  const [openTable, setOpenTable] = useState<boolean>(false);
  const { payFilter } = useFilters();
  const screenSize = useScreenSize();

  const toggleEmptyTableModal = useCallback(() => {
    setOpenTable(!openTable);
  }, [setOpenTable, openTable]);

  return (
    <main className="relative min-h-screen bg-gray-100 pb-[5rem]">
      <Suspense fallback={<SpinnerMemo />}>
        <HeaderAlerts />
      </Suspense>
      <section>
        {selectedNavItem === "payments" && (
          <>
            {payFilter === "ALL" && (
              <Suspense fallback={<SpinnerMemo />}>
                <OnlineAlerts />
                <CallCaptanMainComp />
              </Suspense>
            )}
            {payFilter === "ONLINE" && (
              <Suspense fallback={<SpinnerMemo />}>
                <OnlineAlerts />
              </Suspense>
            )}
            {payFilter === "CALL_CAPTAIN" && (
              <Suspense fallback={<SpinnerMemo />}>
                <CallCaptanMainComp />
              </Suspense>
            )}
          </>
        )}
        {selectedNavItem === "Tables" && (
          <Suspense fallback={<SpinnerMemo />}>
            <Zones />
          </Suspense>
        )}
        {selectedNavItem === "history" && (
          <Suspense fallback={<SpinnerMemo />}>
            <History />
          </Suspense>
        )}
        {selectedNavItem === "sales" && (
          <Suspense fallback={<SpinnerMemo />}>
            <SalesLite />
          </Suspense>
        )}
        {selectedNavItem === "cart" && (
          <Suspense fallback={<SpinnerMemo />}>
            <CartItems />
          </Suspense>
        )}
        <Suspense fallback={<SpinnerMemo />}>
          <BillPopUpMemo />
        </Suspense>
        {isFilterOpen && (
          <Suspense fallback={<SpinnerMemo />}>
            <BottomPopUp
              onClose={() => setIsFilterOpen(false)}
              show={isFilterOpen}
              height="80dvh"
            >
              <ZoneFilters />
            </BottomPopUp>
          </Suspense>
        )}
        {openTable && (
          <Suspense fallback={<SpinnerMemo />}>
            <BottomPopUp
              onClose={toggleEmptyTableModal}
              show={openTable}
              bottomCross
              hide
            >
              <EmptyTableList />
            </BottomPopUp>
          </Suspense>
        )}
        <div className="fixed bottom-0 h-[4.5rem] lg:hidden bg-white w-full shadow-2xl flex justify-around items-center">
          <nav className="flex w-full p-2 mx-4 bg-gray-100 rounded-full">
            <Suspense fallback={<SpinnerMemo />}>
              <NavItems />
            </Suspense>
          </nav>
        </div>
        {selectedNavItem === "Tables" && (
          <Suspense fallback={<SpinnerMemo />}>
            <CommonBottomButton
              fixed
              backgroundColor="transperant"
              offset={
                screenSize === "xs" || screenSize === "md" ? "4.5rem" : "0rem"
              }
              position={
                screenSize === "xs" || screenSize === "md" ? "right" : "mid"
              }
              maxWidth="max-w-[30rem]"
              buttons={[
                {
                  text: "Start Table",
                  onClick: toggleEmptyTableModal,
                  type: "button",
                  className: "px-8 w-full max-w-[28rem]",
                },
              ]}
            />
          </Suspense>
        )}
      </section>
    </main>
  );
};

const Alerts = memo(AlertsMemo);
export default Alerts;
