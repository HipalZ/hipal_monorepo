import { memo, Suspense, lazy } from "react";
import { NavItemsHotelEnum } from "@/components/types/hotelData";
import { useHotelStore } from "@/components/store/useHotelStore";
import SpinnerMemo from "@/components/atoms/loadingSpinner";
import PopUp from "@/components/atoms/popUp";
import CommonBottomButton from "@/components/atoms/bottomButton";
import HotelReviews from "@/components/hotel/HotelReview";

const data = [
  {
    _id: "68b996ef8c91cf69f0576d20",
    userId: {
      _id: "665ee910b437be96f17c6f68",
      name: "Stae captain",
      phone: "2222222222",
    },
    reviewRating: 3,
    improvementAreas: [],
    staffs: ["665ee910b437be96f17c6f68"],
    date: 1756993263154,
    isRead: false,
    readAt: 1756992903228,
    readBy: null,
    roomId: {
      _id: "67ff3875456972385d102eda",
      name: "premium-1",
    },
    alertId: {
      serviceIds: [
        {
          _id: "6802393fd7cb2c1ae67c77a7",
          name: "Match Box",
        },
      ],
      acceptedBy: {
        _id: "665ee910b437be96f17c6f68",
        name: "Stae captain",
        phone: "2222222222",
      },
      deliveredBy: {
        _id: "665ee910b437be96f17c6f68",
        name: "Stae captain",
        phone: "2222222222",
      },
    },
    note: "",
  },
  {
    _id: "68b996d68c91cf69f0576c72",
    userId: {
      _id: "665ee910b437be96f17c6f68",
      name: "Stae captain",
      phone: "2222222222",
    },
    reviewRating: 5,
    improvementAreas: [],
    staffs: ["665ee910b437be96f17c6f68"],
    date: 1756993238073,
    isRead: false,
    readAt: 1756992903228,
    readBy: null,
    roomId: {
      _id: "67ff3875456972385d102eda",
      name: "premium-1",
    },
    alertId: {
      serviceIds: [
        {
          _id: "6802393fd7cb2c1ae67c77a5",
          name: "Toilet Roll",
        },
      ],
      acceptedBy: {
        _id: "665ee910b437be96f17c6f68",
        name: "Stae captain",
        phone: "2222222222",
      },
      deliveredBy: {
        _id: "665ee910b437be96f17c6f68",
        name: "Stae captain",
        phone: "2222222222",
      },
    },
    note: "",
  },
];

const ViewCart = lazy(() => import("@/components/hotel/ViewCart"));
const EscalationAlerts = lazy(
  () => import("@/components/hotel/EscalationAlerts"),
);
const AlertHotel = lazy(() => import("@/components/hotel/alertHotel"));
const HistoryHotel = lazy(() => import("@/components/hotel/historyHotel"));
const NavItemsHotel = lazy(() => import("@/components/atoms/navItemsHotel"));
const NavbarHotel = lazy(() => import("@/components/hotel/navbarHotel"));
const AvailableRoomHotel = lazy(
  () => import("@/components/hotel/availableRoomHotel"),
);
const BookedRoomHotel = lazy(
  () => import("@/components/hotel/bookedRoomHotel"),
);
const RoomsHotel = lazy(() => import("@/components/hotel/roomsHotel"));

const MemoHotel = () => {
  const selectedNavItem = useHotelStore((state) => state.selectedNavItem);
  const openRoomModal = useHotelStore((state) => state.openRoomModal);
  const setOpenRoomModal = useHotelStore((state) => state.setOpenRoomModal);
  const roomData = useHotelStore((state) => state.roomData);
  const openCartModal = useHotelStore((state) => state.openCartModal);
  const setOpenCartModal = useHotelStore((state) => state.setOpenCartModal);

  const handleBack = () => {
    setOpenCartModal(false);
  };
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
      {selectedNavItem === NavItemsHotelEnum.Escalation && (
        <Suspense fallback={<SpinnerMemo />}>
          <EscalationAlerts />
        </Suspense>
      )}
      {selectedNavItem === NavItemsHotelEnum.History && (
        <Suspense fallback={<SpinnerMemo />}>
          <HistoryHotel />
        </Suspense>
      )}
      {selectedNavItem === NavItemsHotelEnum.Reviews && (
        <HotelReviews reviews={data} />
      )}
      <div className="fixed bottom-0 h-[4.5rem] lg:hidden w-full shadow-2xl flex justify-around items-center bg-white z-50">
        <nav className="flex w-full p-2 mx-4 rounded-full bg-gray-50">
          <Suspense fallback={<SpinnerMemo />}>
            <NavItemsHotel />
          </Suspense>
        </nav>
      </div>
      {openRoomModal && (
        <PopUp
          width="w-[30rem]"
          onClose={() => setOpenRoomModal(false)}
          show={openRoomModal}
          hide
        >
          <section className="overflow-y-scroll h-[90vh] bg-gray-50">
            <Suspense fallback={<SpinnerMemo />}>
              {roomData?.roomStatus === "AVAILABLE" ? (
                <AvailableRoomHotel />
              ) : (
                <BookedRoomHotel />
              )}
            </Suspense>
          </section>
        </PopUp>
      )}
      {openCartModal && (
        <PopUp
          width="w-[30rem]"
          onClose={() => setOpenCartModal(false)}
          show={openCartModal}
          hide
        >
          <section className="overflow-y-scroll h-[90vh] bg-gray-50">
            <Suspense fallback={<SpinnerMemo />}>
              <ViewCart />
              <CommonBottomButton
                maxWidth="30rem"
                position="mid"
                shadow
                buttons={[
                  {
                    text: "Back",
                    onClick: handleBack,
                    className: "w-full rounded-md",
                  },
                ]}
              />
            </Suspense>
          </section>
        </PopUp>
      )}
    </>
  );
};

const Hotel = memo(MemoHotel);
export default Hotel;
