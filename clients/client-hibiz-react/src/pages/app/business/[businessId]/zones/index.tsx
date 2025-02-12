import MemoizedHeader from "@/components/molecules/header"
import { memo, useCallback, useState, lazy, Suspense } from "react"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import useBusinessData from "@/components/store/useBusinessData"
import { cn } from "@/components/utils/helper"
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav"
import LoadingSpinner from "@/components/atom/loadingSpinner"
// import ZonesMain from "@/components/templates/ZonesAndTables"
// import TablesMain from "@/components/templates/ZonesAndTables/TablesMain"


const ZonesMain = lazy(() => import("@/components/templates/ZonesAndTables"))
const TablesMain = lazy(() => import("@/components/templates/ZonesAndTables/TablesMain"))


const navItems = [{ text: "Zones" }, { text: "Tables" }];

const MemoZonesAndTables = () => {
    const businessData = useBusinessData((s) => s.businessData);
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<"zones" | "tables">("zones");

    const changeLayout = (text: string) => {
        setSelectedTab(text.toLowerCase() as "zones" | "tables");
    };

    const handleBack = useCallback(() => {
        navigate(`/app/business/${businessData?._id}`);
    }, [businessData, navigate]);
    return (
        <main className="min-h-screen bg-gray-50">
            <header className="linear_gradient_background">
                <MemoizedHeader
                    title="Zones And Tables"
                    leftIcon={<FaArrowLeft />}
                    onBack={handleBack}
                />
            </header>
            <nav className="absolute w-full px-4 space-x-4 text-sm mobile-only">
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
            {
                selectedTab === "zones" &&
                <Suspense fallback={<LoadingSpinner />}>

                    <ZonesMain />
                </Suspense>
            }
            {
                selectedTab === "tables" &&

                <Suspense fallback={<LoadingSpinner />}>
                    <TablesMain />
                </Suspense>
            }
        </main>
    )
}

const ZonesAndTables = memo(MemoZonesAndTables)
export default ZonesAndTables 
