import avatar from '@/assets/img/avatar.png';
import BottomPopUp from '@/components/atoms/universalPopup';
import useBusinessData from '@/components/store/useBusinessData';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { cn } from '@/components/utils/helpers';
import { useUpdateNotifications } from '@/utils/apiService';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useUserToken } from '@hi/common/src/useUserToken';
import { LaptopMinimalCheck } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import { LuBellOff, LuBellRing } from 'react-icons/lu';
import { RxDashboard } from 'react-icons/rx';
import { useLocation, useNavigate } from 'react-router-dom';
import UserPermissions from './UserPermissions';

const ProfileHeader = () => {
  const location = useLocation();
  const { setAccessToken, setRefreshToken } = useUserToken((s) => ({
    setAccessToken: s.setAccessToken,
    setRefreshToken: s.setRefreshToken,
  }));
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [showPermissons, setShowPermissions] = useState<boolean>(false);
  const position = location.pathname.includes('businesses');
  const navigate = useNavigate();
  const { notification, setNotification, setSelectedBiz } = useHiClientZ((s) => ({
    notification: s.notification,
    setNotification: s.setNotification,
    setSelectedBiz: s.setSelectedBiz,
  }));
  const { updateNotificationsApi } = useUpdateNotifications();
  const defaultClass = 'group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold';

  const redirectDashboard = useCallback(() => {
    navigate('/businesses');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setAccessToken('');
    setRefreshToken('');
    navigate('/');
    setSelectedBiz({});
    await updateNotificationsApi(false);
  }, [navigate, setAccessToken, setRefreshToken, setSelectedBiz, updateNotificationsApi]);

  const UpdateNotification = useCallback(async () => {
    const updatedNotification = !notification;
    setNotification(updatedNotification);
    await updateNotificationsApi(updatedNotification);
  }, [notification, updateNotificationsApi, setNotification]);

  const openPermissions = useCallback(() => {
    setShowPermissions(true);
  }, []);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-full justify-center rounded-full bg-gray-300 p-1 text-white">
            <img src={avatar} alt="avatar" className="rounded-full sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
          </MenuButton>
        </div>
        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="absolute right-8 top-[-10px] h-4 w-4 rotate-45 border-l-2 border-t-2 border-gray-200 bg-white" />
          <div className="px-1 py-1">
            <MenuItem>
              {({ focus }) => (
                <a href="https://t-static.blr1.digitaloceanspaces.com/app-debug.apk" className={cn(defaultClass, focus ? 'bg-gray-100' : '')}>
                  <FiDownload className="mr-2 text-blue-500" size={20} /> Download App
                </a>
              )}
            </MenuItem>
            {businessId ? (
              <MenuItem>
                {({ focus }) => (
                  <button type="button" onClick={UpdateNotification} className={cn(defaultClass, focus ? 'bg-gray-100' : '')}>
                    {notification ? <LuBellRing className="mr-2 text-green-500" size={20} /> : <LuBellOff className="mr-2 text-red-500" size={20} />}{' '}
                    Alerts {notification ? 'On' : 'Off'}
                  </button>
                )}
              </MenuItem>
            ) : null}
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  disabled={position}
                  onClick={redirectDashboard}
                  className={cn(defaultClass, focus ? 'bg-gray-100' : '', position ? 'opacity-50' : '')}
                >
                  <RxDashboard className="mr-2 text-[#6f2eff]" size={20} /> Dashboard
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={openPermissions} className={cn(defaultClass, focus ? 'bg-gray-100' : '')}>
                  <LaptopMinimalCheck className="mr-2 text-black" size={20} />
                  Permissions
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button type="button" onClick={handleLogout} className={cn(defaultClass, focus ? 'bg-gray-100' : '')}>
                  <AiOutlineLogout className="mr-2 text-red-500" size={20} /> Logout
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
      {showPermissons && (
        <BottomPopUp rightTopBack hide show={showPermissons} onClose={() => setShowPermissions(false)}>
          <UserPermissions />
        </BottomPopUp>
      )}
    </>
  );
};

const MemoProfileHeader = memo(ProfileHeader);
export default MemoProfileHeader;
