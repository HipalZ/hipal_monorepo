import SpinnerMemo from "@/components/atoms/loadingSpinner"
import AlertHotel from "@/components/hotel/alertHotel";
import HistoryHotel from "@/components/hotel/historyHotel";
import { useHotelStore } from "@/components/store/useHotelStore";
import { NavItemsHotelEnum } from "@/components/types/hotelData";
import { memo, Suspense, lazy } from "react";

const NavItemsHotel = lazy(() => import("@/components/atoms/navItemsHotel"));
const BottomPopUp = lazy(() => import("@/components/atoms/universalPopup"));
const NavbarHotel = lazy(() => import("@/components/hotel/navbarHotel"));
const AvailableRoomHotel = lazy(() => import("@/components/hotel/availableRoomHotel"));
const BookedRoomHotel = lazy(() => import("@/components/hotel/bookedRoomHotel"));
const RoomsHotel = lazy(() => import("@/components/hotel/roomsHotel"));

const MemoHotel = () => {
    const { selectedNavItem, openRoomModal, setOpenRoomModal, roomData } = useHotelStore()
    return (
        <>
            <NavbarHotel />
            {selectedNavItem === NavItemsHotelEnum.Rooms && (
                <Suspense fallback={<SpinnerMemo />}>
                    <RoomsHotel />
                </Suspense>
            )}
            {selectedNavItem === NavItemsHotelEnum.Alerts && (
                <Suspense fallback={<SpinnerMemo />}>
                    <AlertHotel />
                </Suspense>
            )}
            {
                selectedNavItem === NavItemsHotelEnum.History &&(
                    <Suspense fallback={<SpinnerMemo />}>
                        <HistoryHotel/>
                    </Suspense>
                )
            }
            <div className="fixed bottom-0 h-[4.5rem] lg:hidden w-full shadow-2xl flex justify-around items-center bg-white">
                <nav className="flex w-full p-2 mx-4 rounded-full bg-gray-50">
                    <Suspense fallback={<SpinnerMemo />}>
                        <NavItemsHotel />
                    </Suspense>
                </nav>
            </div>
            {openRoomModal && (
                <BottomPopUp width="w-[30rem]" onClose={() => setOpenRoomModal(false)} show={openRoomModal} hide>
                    <Suspense fallback={<SpinnerMemo />}>
                        {roomData?.roomStatus === "AVAILABLE" ? (
                            <AvailableRoomHotel />
                        ) : <BookedRoomHotel />}
                    </Suspense>
                </BottomPopUp>
            )}
        </>
    )
}

const Hotel = memo(MemoHotel)
export default Hotel