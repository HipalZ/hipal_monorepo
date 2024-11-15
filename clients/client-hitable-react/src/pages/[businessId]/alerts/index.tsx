import { memo } from "react";

import HeaderAlerts from "@/components/liteAlerts/headerAlerts";
import { useLiteStore } from "@/components/store/useLiteStore";
import SalesLite from "@/components/atoms/salesLite";
import OnlineAlerts from "@/components/liteAlerts/onlineAlerts";
import OfflineAlerts from "@/components/liteAlerts/offlineAlerts";
import History from "@/components/liteAlerts/history";
import BillPopUpMemo from "@/components/atoms/billPopUp";
import CartItems from "@/components/atoms/cartItem";
import NavItems from "@/components/atoms/navItems";

// Button variants for smooth color transitions

const AlertsMemo = () => {
  const { selectedNavItem } = useLiteStore();

  return (
    <main className="relative min-h-screen bg-gray-200 pb-[5rem]">
      <HeaderAlerts />
      <section>
        {selectedNavItem === "online" && <OnlineAlerts />}
        {selectedNavItem === "on floor" && <OfflineAlerts />}
        {selectedNavItem === "history" && <History />}
        {selectedNavItem === "sales" && <SalesLite />}
        {selectedNavItem === "cart" && <CartItems />}
        <BillPopUpMemo />
        <div className="fixed bottom-0 h-[4.5rem] lg:hidden bg-white w-full shadow-2xl flex justify-around items-center">
          <nav className="flex p-2 bg-gray-100 rounded-full ">
            <NavItems />
          </nav>
        </div>
      </section>
    </main>
  );
};

const Alerts = memo(AlertsMemo);
export default Alerts;
