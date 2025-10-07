import MemoizedHeader from "@/components/molecules/header";
import { memo, useCallback, lazy, Suspense } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import { cn } from "@/components/utils/helper";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useGetAllStaff } from "@/hooks/useStaff";
import { useGetAllTables, useGetAllZones } from "@/hooks/useZone";
import useZoneStore from "@/components/store/useZone";

const ZonesMain = lazy(() => import("@/components/templates/ZonesAndTables"));
const TablesMain = lazy(
  () => import("@/components/templates/ZonesAndTables/TablesMain"),
);
const QrCreation = lazy(
  () => import("@/components/templates/ZonesAndTables/QrCreation"),
);
const CheckIn = lazy(
  () => import("@/components/templates/ZonesAndTables/checkin/index.tsx"),
);

const navItems = [
  { text: "Qrs" },
  {
    text: "Check In",
  },
];

const MemoZonesAndTables = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const { selectedTab, setSelectedTab } = useZoneStore((s) => ({
    selectedTab: s.selectedTab,
    setSelectedTab: s.setSelectedTab,
  }));

  const { isLoadingStaff } = useGetAllStaff(businessData?._id as string);
  const { isLoading: gettingZones } = useGetAllZones(
    businessData?._id as string,
  );
  const { isLoading } = useGetAllTables(businessData?._id as string);
  const changeLayout = useCallback((text: string) => {
    setSelectedTab(text.toLowerCase() as "qrs" | "check in");
  }, []);

  if (gettingZones || isLoading || isLoadingStaff) return <LoadingSpinner />;

  return (
    <main className="min-h-screen">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Qrs" />
      </header>
      <nav className="sticky top-[4.5rem] z-50 w-full px-4 space-x-4 text-sm mobile-only">
        {navItems.map((item) => (
          <button
            className={cn(
              "pb-3 pt-4 bg-white ",
              selectedTab?.toLowerCase() === item.text.toLowerCase()
                ? "border-b-2 border-[#8162e6] transition-all text-[#8162e6] font-semibold text-lg"
                : "",
            )}
            key={item.text}
            type="button"
            onClick={() => changeLayout(item.text)}
          >
            {item.text}
          </button>
        ))}
      </nav>
      <UniversalNav
        items={navItems}
        selectedNavItem={selectedTab}
        changeNav={changeLayout}
      />
      <Suspense fallback={<LoadingSpinner />}>
        {selectedTab === "zones" && <ZonesMain />}
        {selectedTab === "tables" && <TablesMain />}
        {selectedTab === "qrs" && <QrCreation />}
        {selectedTab === "check in" && <CheckIn />}
      </Suspense>
    </main>
  );
};

const ZonesAndTables = memo(MemoZonesAndTables);
export default ZonesAndTables;
