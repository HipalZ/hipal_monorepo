import { memo, useCallback, lazy, Suspense } from "react";
import MemoizedHeader from "@/components/molecules/header";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import { cn } from "@hi/common";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import HotelActions from "@/components/hotel/Actions";
// import PaymentCards from "@/components/hotel/payments";
import {
  HotelInfoTabs,
  useHotelInfoTabs,
} from "@/components/store/hotel/useHotelDashboardPage.ts";

const AnalyticsCards = lazy(() => import("@/components/hotel/Analytics"));
const HotelCards = lazy(() => import("@/components/hotel/HotelCards"));
const Integrations = lazy(() => import("@/components/hotel/Integrations"));

const navItems = [
  { text: HotelInfoTabs.Essentials },
  { text: HotelInfoTabs.Actions },
  { text: HotelInfoTabs.Integrations },
  { text: HotelInfoTabs.Analytics },
  // { text: HotelInfoTabs.Payments },
];

const MemoHotelInfoMain = () => {
  const navigate = useNavigate();
  const businessData = useBusinessData((s) => s.businessData);

  // 🔒 Persisted tab state
  const selectedTab = useHotelInfoTabs((s) => s.selectedTab);
  const setSelectedTab = useHotelInfoTabs((s) => s.setSelectedTab);

  const changeLayout = (text: string) => {
    setSelectedTab(text as HotelInfoTabs);
  };

  const handleBack = useCallback(() => {
    navigate("/app/business");
  }, [navigate]);

  return (
    <main className="min-h-screen">
      <div className="sticky top-0 z-50 w-full">
        <header className="linear_gradient_background">
          <MemoizedHeader
            title={businessData?.name || "Welcome"}
            onBack={handleBack}
          />
        </header>

        <nav className="absolute flex w-full px-4 space-x-4 overflow-auto text-sm text-nowrap flex-nowrap hide-scrollbar mobile-only">
          {navItems.map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => changeLayout(item.text)}
              className={cn(
                "pb-3 pt-4 bg-white capitalize",
                selectedTab === item.text
                  ? "border-b-2 border-[#8162e6] transition-all text-[#8162e6] font-semibold text-lg"
                  : "",
              )}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>

      <UniversalNav
        items={navItems}
        selectedNavItem={selectedTab}
        changeNav={changeLayout}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <section className="pt-12 xl:px-0 pb-[5rem]">
          {selectedTab === HotelInfoTabs.Essentials && <HotelCards />}
          {selectedTab === HotelInfoTabs.Integrations && <Integrations />}
          {selectedTab === HotelInfoTabs.Actions && <HotelActions />}
          {selectedTab === HotelInfoTabs.Analytics && <AnalyticsCards />}
          {/* {selectedTab === HotelInfoTabs.Payments && <PaymentCards />} */}
        </section>
      </Suspense>
    </main>
  );
};

const HotelInfoMain = memo(MemoHotelInfoMain);
export default HotelInfoMain;
