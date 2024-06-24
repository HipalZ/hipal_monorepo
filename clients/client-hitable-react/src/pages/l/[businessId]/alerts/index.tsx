import { CiGlobe } from "react-icons/ci";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { memo } from "react";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineHistory } from "react-icons/md";
import HeaderAlerts from "@/components/templates/liteAlerts/headerAlerts";
import { IconType } from "react-icons";
import { useLiteStore } from "@/components/store/useLiteStore";
import SalesLite from "@/components/atoms/salesLite";
import OnlineAlerts from "@/components/templates/liteAlerts/onlineAlerts";
import OfflineAlerts from "@/components/templates/liteAlerts/offlineAlerts";
import History from "@/components/templates/liteAlerts/history";
import { NavItemTypes } from "@/components/types/hiClientzData";
import BillPopUp from "@/components/atoms/billPopUp";


// Button variants for smooth color transitions
const navItems: Array<{ type: NavItemTypes; icon: IconType }> = [
    { type: 'online', icon: CiGlobe },
    { type: 'on floor', icon: GiTakeMyMoney },
    { type: 'history', icon: MdOutlineHistory },
    { type: 'sales', icon: RiMoneyRupeeCircleLine },
];

const Alerts = memo(() => {
    const { selectedNavItem, setSelectedNavItem, onlineCount, offlineCount } = useLiteStore();
    const handleNavItemClick = (type: NavItemTypes) => {
        setSelectedNavItem(type);
    };
    const navClass = "text-[#6F2EFF] bg-[#6F2EFF]/10 px-3 rounded-full py-1 flex items-center text-xl";
    const defaultClass = "text-gray-500 rounded-full flex items-center text-xl";

    const handleCount = (type: string) => {
        if (type === 'online' && onlineCount > 0) {
            return onlineCount;
        } else if (type === 'on floor' && offlineCount > 0) {
            return offlineCount;
        }
        return null;
    }
    return (
        <main className="bg-gray-200 min-h-screen relative">
            <HeaderAlerts />
            <section>
                {selectedNavItem === 'online' && <OnlineAlerts />}
                {selectedNavItem === 'on floor' && <OfflineAlerts />}
                {selectedNavItem === 'history' && <History />}
                {selectedNavItem === 'sales' && <SalesLite />}
                <BillPopUp />
                <div className="fixed bottom-0 h-[4.5rem] bg-white w-full shadow-2xl flex justify-around items-center">
                    {navItems.map(({ type, icon: Icon }) => (
                        <button
                            key={type}
                            onClick={() => handleNavItemClick(type)}
                            className={selectedNavItem === type ? navClass : defaultClass}
                            style={{
                                transition: 'background-color 0.2s ease, color 0.2s ease',
                                backgroundColor: selectedNavItem === type ? '#f3eeff' : 'transparent',
                                color: selectedNavItem === type ? '#6F2EFF' : '#777777',
                                position: 'relative',
                            }}
                        >
                            <Icon size={24} color={selectedNavItem === type ? '#6F2EFF' : '#777777'} />
                            {handleCount(type) !== null && (
                                <span className="bg-red-500 text-white rounded-full px-2 text-base absolute bottom-5 -right-4">
                                    {handleCount(type)}
                                </span>
                            )}
                            <h1 style={{ opacity: selectedNavItem === type ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                                &nbsp;{selectedNavItem === type ? type : null}
                            </h1>
                        </button>
                    ))}
                </div>
            </section>
        </main>
    )
});

export default Alerts;