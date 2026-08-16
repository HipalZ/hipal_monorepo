import CommonBottomButton from '@/components/atoms/bottomButton';
import SpinnerMemo from '@/components/atoms/loadingSpinner';
import PopUp from '@/components/atoms/popUp';
import HotelReviews from '@/components/hotel/HotelReview';
import { useHotelStore } from '@/components/store/useHotelStore';
import { NavItemsHotelEnum } from '@/components/types/hotelData';
import { lazy, memo, Suspense } from 'react';

const ViewCart = lazy(() => import('@/components/hotel/ViewCart'));
const AlertHotel = lazy(() => import('@/components/hotel/alertHotel'));
const HistoryHotel = lazy(() => import('@/components/hotel/historyHotel'));
const NavItemsHotel = lazy(() => import('@/components/atoms/navItemsHotel'));
const NavbarHotel = lazy(() => import('@/components/hotel/navbarHotel'));
const AvailableRoomHotel = lazy(() => import('@/components/hotel/availableRoomHotel'));
const BookedRoomHotel = lazy(() => import('@/components/hotel/bookedRoomHotel'));
const RoomsHotel = lazy(() => import('@/components/hotel/roomsHotel'));

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
      {selectedNavItem === NavItemsHotelEnum.History && (
        <Suspense fallback={<SpinnerMemo />}>
          <HistoryHotel />
        </Suspense>
      )}
      {selectedNavItem === NavItemsHotelEnum.Reviews && <HotelReviews />}
      <div className="fixed bottom-0 z-50 flex h-[4.5rem] w-full items-center justify-around bg-white shadow-2xl lg:hidden">
        <nav className="mx-4 flex w-full rounded-full bg-gray-50 p-2">
          <Suspense fallback={<SpinnerMemo />}>
            <NavItemsHotel />
          </Suspense>
        </nav>
      </div>
      {openRoomModal && (
        <PopUp width="w-[30rem] md:w-[40rem]" onClose={() => setOpenRoomModal(false)} show={openRoomModal} rightTopBack hide>
          <section className="h-[100vh] overflow-y-scroll bg-gray-50 lg:h-[90dvh]">
            <Suspense fallback={<SpinnerMemo />}>{roomData?.roomStatus === 'AVAILABLE' ? <AvailableRoomHotel /> : <BookedRoomHotel />}</Suspense>
          </section>
        </PopUp>
      )}
      {openCartModal && (
        <PopUp width="w-[30rem] " onClose={() => setOpenCartModal(false)} show={openCartModal} hide>
          <section className="h-[90vh] overflow-y-scroll bg-gray-50">
            <Suspense fallback={<SpinnerMemo />}>
              <ViewCart />
              <CommonBottomButton
                maxWidth="30rem"
                position="mid"
                shadow
                buttons={[
                  {
                    text: 'Back',
                    onClick: handleBack,
                    className: 'w-full rounded-md',
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
