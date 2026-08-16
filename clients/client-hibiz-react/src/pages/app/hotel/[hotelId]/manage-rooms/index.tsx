import LoadingSpinner from '@/components/atom/loadingSpinner';
import FloorMain from '@/components/hotel/FloorAndRooms/FloorMain';
import { RoomStaffLink } from '@/components/hotel/FloorAndRooms/room-staff-linking/roomStaffLink';
import NewRoomCreation from '@/components/hotel/FloorAndRooms/RoomMain';
import RoomTypeMain from '@/components/hotel/FloorAndRooms/RoomtypeMain';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import UniversalNav from '@/components/templates/menu/sideNavbaar/universelSidenav';
import { useGetAllHotelRooms } from '@/hooks/hotel/useRoomHook';
import { useGetAllRoomTypes } from '@/hooks/hotel/useRoomTypeHook';
import { useGetAllHotelFloors } from '@/hooks/useFloorHook';
import { useGetAllHotelStaff } from '@/hooks/useHotelStaff';

import { cn } from '@hi/common';
import { memo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const navItems = [
  { text: 'floors' },
  { text: 'Room Types' },
  { text: 'Rooms' },
  {
    text: 'Assign Rooms',
  },
];

const MemoManageRoomsHotel = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { floorsLoading } = useGetAllHotelFloors(businessId as string);
  const { roomLoading } = useGetAllHotelRooms(businessId as string);
  const { roomTypesLoading } = useGetAllRoomTypes(businessId as string);
  useGetAllHotelStaff(businessId as string);
  const [selectedTab, setSelectedTab] = useState<'floors' | 'room types' | 'rooms' | 'assign rooms'>('floors');
  const changeLayout = (text: string) => {
    setSelectedTab(text.toLowerCase() as 'floors' | 'rooms');
  };

  if (floorsLoading || roomLoading || roomTypesLoading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen bg-[#F6F4F1] p-2 pb-28">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Manage Rooms" leftIcon={<FaArrowLeft />} />
      </header>
      <nav className="mobile-only sticky top-[4.5rem] z-50 w-full space-x-4 px-4 text-sm">
        {navItems.map((item) => (
          <button
            className={cn(
              'bg-white pb-3 pt-4',
              selectedTab?.toLowerCase() === item.text.toLowerCase()
                ? 'border-b-2 border-[#8162e6] text-lg font-semibold text-[#8162e6] transition-all'
                : '',
            )}
            key={item.text}
            type="button"
            onClick={() => changeLayout(item.text)}
          >
            {item.text}
          </button>
        ))}
      </nav>
      <UniversalNav items={navItems} selectedNavItem={selectedTab} changeNav={changeLayout} />
      {selectedTab === 'floors' && <FloorMain />}
      {selectedTab === 'rooms' && <NewRoomCreation />}
      {selectedTab === 'room types' && <RoomTypeMain />}
      {selectedTab === 'assign rooms' && <RoomStaffLink />}
    </main>
  );
};

const ManageRoomsHotel = memo(MemoManageRoomsHotel);
export default ManageRoomsHotel;
