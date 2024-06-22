import { HiOutlineRefresh } from "react-icons/hi";
import dummyLogo from '@/assets/img/dummyLogo.png'
import { memo } from "react";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import ProfileHeader from "../profileHeader";
import { useLiteStore } from "@/components/store/useLiteStore";

const HeaderAlerts = memo(() => {
    const { selectedBiz } = useHiClientZ();
    const { selectedNavItem } = useLiteStore();
    return (
        <header className="sticky top-0 h-[5rem] w-full flex items-center justify-between px-6 py-4 bg-white !z-10">
            <div className="flex space-x-3 items-center">
                <figure>
                    <img className="border border-1 border-black rounded-full" src={selectedBiz?.businessId?.logo || dummyLogo} alt="logo" width={47} height={47} />
                </figure>
                <div>
                    <h6 className="text-base font-semibold">{selectedBiz?.businessId?.businessName}</h6>
                    <p title="Defence colony, Secunderabad" className="text-sm truncate lg:w-full w-[85%]">{selectedBiz?.businessId?.address}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                {selectedNavItem === "online" || selectedNavItem === "on floor" ? <HiOutlineRefresh size={24} /> : null}
                <ProfileHeader position={false} />
            </div>
        </header>
    )
});

export default HeaderAlerts