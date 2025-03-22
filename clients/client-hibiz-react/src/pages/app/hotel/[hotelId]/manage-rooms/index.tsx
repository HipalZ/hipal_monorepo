import LoadingSpinner from "@/components/atom/loadingSpinner";
import FloorMain from "@/components/hotel/FloorAndRooms/FloorMain";
import NewRoomCreation from "@/components/hotel/FloorAndRooms/RoomMain";
import RoomTypeMain from "@/components/hotel/FloorAndRooms/RoomtypeMain";
import MemoizedHeader from "@/components/molecules/header"
import useBusinessData from "@/components/store/useBusinessData";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav";
import { useGetAllHotelRooms } from "@/hooks/hotel/useRoomHook";
import { useGetAllRoomTypes } from "@/hooks/hotel/useRoomTypeHook";
import { useGetAllHotelFloors } from "@/hooks/useFloorHook";
import { cn } from "@hi/common";
import { memo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa"

const navItems = [{ text: "floors" }, { text: "Room Types" }, { text: "Rooms" },];

const MemoManageRoomsHotel = () => {
    const businessId = useBusinessData((s) => s.businessData?._id)
    const { floorsLoading } = useGetAllHotelFloors(businessId as string)
    const { roomLoading } = useGetAllHotelRooms(businessId as string)
    const { roomTypesLoading } = useGetAllRoomTypes(businessId as string)
    const [selectedTab, setSelectedTab] = useState<"floors" | "room types" | "rooms">("floors");
    const changeLayout = (text: string) => {
        setSelectedTab(text.toLowerCase() as "floors" | "rooms");
    };


    if (floorsLoading || roomLoading || roomTypesLoading) return <LoadingSpinner />

    return (
        <main>
            <header className=" linear_gradient_background">
                <MemoizedHeader
                    title="Manage Rooms"
                    leftIcon={<FaArrowLeft />}
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
            {
                selectedTab === "floors" && (
                    <FloorMain />
                )
            }
            {selectedTab === "rooms" &&
                (
                    <NewRoomCreation />
                )
            }
            {
                selectedTab === "room types" && (
                    <RoomTypeMain />
                )
            }

        </main>
    )
}

const ManageRoomsHotel = memo(MemoManageRoomsHotel)
export default ManageRoomsHotel
