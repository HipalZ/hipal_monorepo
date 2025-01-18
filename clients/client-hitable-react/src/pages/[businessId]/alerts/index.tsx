import { memo, useCallback, useState } from "react";

import HeaderAlerts from "@/components/liteAlerts/headerAlerts";
import { useLiteStore } from "@/components/store/useLiteStore";
import SalesLite from "@/components/atoms/salesLite";
import OnlineAlerts from "@/components/liteAlerts/onlineAlerts";
import OfflineAlerts from "@/components/liteAlerts/offlineAlerts";
import History from "@/components/liteAlerts/history";
import BillPopUpMemo from "@/components/atoms/billPopUp";
import CartItems from "@/components/atoms/cartItem";
import NavItems from "@/components/atoms/navItems";
import Zones from "@/components/zones";
import BottomPopUp from "@/components/atoms/universalPopup";
import ZoneFilters from "@/components/zones/zoneFilters";
import { useZonesAndTablesStore } from "@/components/store/useZonesAndTable";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useScreenSize } from "@/hooks/useScreenSize";
import EmptyTableList from "@/components/tables";
import { useFilters } from "@/components/store/useFilters";
import CallCaptanMainComp from "@/components/liteAlerts/callWaiter";

// Button variants for smooth color transitions

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
      <HeaderAlerts />
      <section>
        {selectedNavItem === "payments" && (
          <>
            {payFilter === "ALL" && (
              <>
                <OnlineAlerts />
                <CallCaptanMainComp />
              </>
            )}
            {payFilter === "ONLINE" && <OnlineAlerts />}
            {
              payFilter === "CALL_CAPTAIN" && <CallCaptanMainComp />
            }
          </>
        )}
        {selectedNavItem === "Tables" && <Zones />}
        {selectedNavItem === "history" && <History />}
        {selectedNavItem === "sales" && <SalesLite />}
        {selectedNavItem === "cart" && <CartItems />}
        <BillPopUpMemo />
        {isFilterOpen && (
          <BottomPopUp
            onClose={() => setIsFilterOpen(false)}
            show={isFilterOpen}
            height="80dvh"
          >
            <ZoneFilters />
          </BottomPopUp>
        )}
        {openTable && (
          <BottomPopUp
            onClose={toggleEmptyTableModal}
            show={openTable}
            bottomCross
            hide
          >
            <EmptyTableList />
          </BottomPopUp>
        )}
        <div className="fixed bottom-0 h-[4.5rem] lg:hidden bg-white w-full shadow-2xl flex justify-around items-center">
          <nav className="flex w-full p-2 mx-4 bg-gray-100 rounded-full">
            <NavItems />
          </nav>
        </div>
        {selectedNavItem === "Tables" && (
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
        )}
      </section>
    </main>
  );
};

const Alerts = memo(AlertsMemo);
export default Alerts;
