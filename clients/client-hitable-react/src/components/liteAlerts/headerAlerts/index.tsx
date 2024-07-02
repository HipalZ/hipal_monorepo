import hipalLogo from '@/assets/img/liteLoginIcon4.png';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useLiteStore } from '@/components/store/useLiteStore';
import { memo } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import ProfileHeader from '../profileHeader';
import './index.css';

const HeaderAlerts = memo(() => {
  const { selectedBiz } = useHiClientZ();
  const { selectedNavItem, refetchOfflineAlerts, refetchOnlineAlerts, loading } = useLiteStore();
  const refetchData = () => {
    if (selectedNavItem === 'online') {
      refetchOnlineAlerts();
    } else if (selectedNavItem === 'on floor') {
      refetchOfflineAlerts();
    }
  };
  return (
    <header className="sticky top-0 !z-10 flex h-[5rem] w-full items-center justify-between bg-white px-6 py-4">
      <div className="flex items-center space-x-3">
        <figure className="w-[3rem]">
          <img
            className="border-1 rounded-full border border-black"
            src={selectedBiz?.businessId?.logo || hipalLogo}
            alt="logo"
            width={47}
            height={47}
          />
        </figure>
        <div>
          <h6 className="text-base font-semibold">{selectedBiz?.businessId?.businessName}</h6>
          <p title={selectedBiz?.businessId?.address} className="w-48 truncate text-sm">
            {selectedBiz?.businessId?.address}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {(selectedNavItem === 'online' || selectedNavItem === 'on floor') && (
          <HiOutlineRefresh onClick={refetchData} size={24} className={`cursor-pointer ${loading ? 'animate-spin' : ''}`} />
        )}
        <ProfileHeader position={false} />
      </div>
    </header>
  );
});

export default HeaderAlerts;
