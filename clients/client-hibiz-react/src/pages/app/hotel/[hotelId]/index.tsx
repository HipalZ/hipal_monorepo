import { memo, useCallback, useState,lazy,Suspense } from "react"
import { FaArrowLeft } from "react-icons/fa"
import MemoizedHeader from "@/components/molecules/header"
import { useNavigate } from "react-router-dom"
import useBusinessData from "@/components/store/useBusinessData"
import { cn } from "@hi/common"
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import HotelActions from "@/components/hotel/Actions"

const HotelCards = lazy(() => import("@/components/hotel/HotelCards"))

const navItems = [
    {
        text: "Essentials",
    },
    {
        text: "Actions"
    }
]


const MemoHotelInfoMain = () => {

    const navigate = useNavigate();
    const businessData = useBusinessData((s) => s.businessData);
    const [selectedTab, setSelectedTab] = useState<"essentials" | "integrations" | "actions">("essentials");

    const changeLayout = (text: string) => {
        setSelectedTab(text.toLowerCase() as "essentials" | "integrations" | "actions");
    };

    const handleBack = useCallback(() => {
        navigate("/app/business");
    }, [navigate]);

    return (
        <main className="min-h-screen ">
            <header className=" linear_gradient_background">
                <MemoizedHeader
                    title={businessData?.name || "Welcome"}
                    leftIcon={<FaArrowLeft />}
                    onBack={handleBack}
                />
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
                {
                    selectedTab === "essentials" &&
                    <HotelCards />
                }
                {
                    selectedTab === "integrations" &&
                    <div>Integrations</div>
                }
                {
                    selectedTab === "actions" &&
                    <HotelActions />
                }
            </Suspense>
           
        </main>
    )
}

const HotelInfoMain = memo(MemoHotelInfoMain)
export default HotelInfoMain

