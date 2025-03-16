import { HiOutlineRefresh } from "react-icons/hi";
import hipalLogo from "@/assets/img/liteLoginIcon4.png";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import MemoProfileHeader from "@/components/liteAlerts/profileHeader";
import { useHotelStore } from "@/components/store/useHotelStore";
import { NavItemsHotelEnum } from "@/components/types/hotelData";
import NavItemsHotel from "../atoms/navItemsHotel";
import { memo } from "react";

const MemoNavbarHotel = ({
    hide,
    hideBack,
}: { hide?: boolean; hideBack?: boolean }) => {
    const { selectedBiz } = useHiClientZ((s) => ({
        selectedBiz: s.selectedBiz,
    }));
    const outletInfo = useBusinessData((s) => s.outletInfo);
    const {
        selectedNavItem,
    } = useHotelStore((s) => ({
        selectedNavItem: s.selectedNavItem,
    }));

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between w-full h-16 px-6 py-4 bg-white shadow-md md:h-20">
            <div className="flex items-center space-x-3">
                {!hideBack && outletInfo?.isPosEnabled && (
                    <Link to="/navigate">
                        <button type="button" className="-ml-2">
                            <IoArrowBack />
                        </button>
                    </Link>
                )}

                <figure className="w-12 h-12 overflow-hidden border border-black rounded-full">
                    <img
                        className="object-cover w-full h-full"
                        src={selectedBiz?.businessId?.logo || hipalLogo}
                        alt="logo"
                    />
                </figure>
                <h6 className="text-base font-semibold">
                    {selectedBiz?.businessId?.businessName}
                </h6>
            </div>

            {!hide && (
                <section className="nav">
                    <article className="flex">
                        <NavItemsHotel />
                    </article>
                </section>
            )}

            <div className="flex items-center space-x-3">
                <MemoProfileHeader />
            </div>
        </header>
    );
};

const NavbarHotel = memo(MemoNavbarHotel);
export default NavbarHotel
