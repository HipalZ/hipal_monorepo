import axios from '@/axios';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import Loader from '@/components/atoms/loader';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useLogin } from '@/components/store/useLogin';
import { useUserToken } from '@/components/store/useUserToken';
import { useZoneStore } from '@/components/store/useZone';
import { IZoneData } from '@/components/types/hiTableData';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { updateTheme } from '@/components/utils/themes';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { MdMenuOpen } from 'react-icons/md';
import HiPalLogo from '../../../assets/svg/hipalLogoNew.svg';

function Zones({ setCurrentView }) {
  const setZone = useZoneStore((state) => state.setZone);
  const { accessToken, refreshToken } = useUserToken();
  const { setSelectedZone } = useLogin();
  const businessData = useBusinessStore((s) => s.businessData);
  const router = useRouter();
  const { userDetails, setIsLogin, isLogin, setZoneName } = useLogin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const retryCount = useRef(0);
  const handleCloseModal = () => setIsModalOpen(false);
  const { businessId } = router.query as {
    businessId: string;
  };
  useEffect(() => {
    if (businessId === undefined) {
      router.push('/');
    }
  }, [businessId]);
  const handleToggle = async () => {
    if (!isLogin) {
      setIsLogin(true);
    } else {
      handleOpenModal();
    }
  };

  const logOut = async () => {
    setIsLogin(false);
    handleCloseModal();
  };

  const handleOnClick = (zone: any) => {
    setSelectedZone(zone);
    setZoneName(zone?.zoneName);

    if (zone?.zoneType === 'Dine In') {
      router.push(routePaths[PAGE_TYPES.TABLES](businessId, zone?._id));
    } else {
      setZone(zone);
      router.push(routePaths[PAGE_TYPES.TAKE_AWAY](businessId, zone?._id));
      updateTheme(zone?.zoneName);
    }
  };

  const isTakeawayZone = (zoneType) => {
    const normalizedType = zoneType?.toLowerCase().replace(/[-\s]/g, '');
    return normalizedType === 'takeaway';
  };
  const result = async () => {
    try {
      const response = await axios.get(`/v1/zones/getAllZoneByWaiter?businessId=${businessId}&waiterId=${userDetails?.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-refresh-with': refreshToken,
        },
      });

      const zones = response.data.data;

      const takeawayZones = Array.isArray(zones) ? zones.filter((ele) => isTakeawayZone(ele.zoneType)) : [];
      const otherZones = Array.isArray(zones) ? zones.filter((ele) => !isTakeawayZone(ele.zoneType)) : [];

      const orderedZones = [...otherZones, ...takeawayZones];

      updateTheme('normal');

      return orderedZones;
    } catch (error) {
      if ((error as AxiosError)?.response?.status === 401) {
        router.push(`/r/${businessId}/login`);
      }
    }
  };

  const {
    isLoading: zoneLoading,
    error,
    data: zones,
    refetch,
  } = useQuery({
    queryKey: ['zones', businessId],
    queryFn: result,
    enabled: !!businessId && !!isLogin && !!userDetails?.id,
  });

  if (zoneLoading) {
    return <Loader />;
  }

  const handleRetryClick = () => {
    retryCount.current += 1;
    if (retryCount.current >= 5) {
      router.push(`/r/${businessId}/login`);
    } else {
      refetch();
    }
  };
  if (error) {
    <div className="flex h-screen items-center justify-center">
      <Link href={`/r/${businessId}/login`}>
        <button className="btn" type="button">
          Home
        </button>
      </Link>
      <button onClick={handleRetryClick} className="btn" type="button">
        Retry
      </button>
    </div>;
  }

  return (
    <div className="bg-secondary relative min-h-screen pb-[5rem]">
      <div className="bg-secondary sticky top-0 z-20">
        <div className="ml-[1.5rem] flex justify-between pt-[2rem]">
          <Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />

          <MdMenuOpen onClick={() => setCurrentView('setting')} className="mr-[1.5rem] text-2xl" />
        </div>
        <div className="bg-base-100 border-base-300 mx-[1.5rem] mb-6 mt-[1.5rem] rounded-2xl border pb-[0.5rem]">
          <div className="flex justify-between">
            <div className="ml-4 mt-4">
              <span className="text-base-content font-[400]">Hello, </span>
              <span className="text-base-content font-semibold capitalize">{userDetails?.name}</span>
            </div>
          </div>
          <div className="mx-4 mt-2">
            <span className="text-base-content text-[0.875rem] font-[400] leading-[1rem]">You logged into </span>
            <span className="text-base-content text-[0.875rem] font-semibold capitalize leading-[1rem]">{businessData?.businessName}</span>
          </div>
          {isModalOpen && (
            <DayOutPopup show={isModalOpen} onClose={handleCloseModal}>
              <div className="ml-4 mt-6 pt-4 font-semibold">Are you sure, you want to Day-Out?</div>
              <div className="mx-12 mt-6 flex justify-between pb-9">
                <span onKeyDown={handleCloseModal} onClick={handleCloseModal} className="text-sm">
                  Cancel
                </span>
                <button type="button" onClick={logOut} className="text-base-100 bg-primary -mr-6 rounded-3xl px-6 py-2 text-sm">
                  Day Out
                </button>
              </div>
            </DayOutPopup>
          )}
          <div>
            <div className="border-primary/50 mx-[1rem] my-2 flex  items-center rounded-xl border">
              <button
                type="button"
                className={`relative flex h-8 w-full rounded-full capitalize transition-colors duration-300 ease-in-out ${isLogin ? '' : ''}`}
                onClick={handleToggle}
              >
                <span
                  className={`absolute bottom-0.5 left-[0.125rem] top-0.5 h-7 w-[49.5%] transform rounded-xl transition-transform duration-300 ease-in-out ${
                    isLogin ? 'translate-x-full bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <div
                  className={`absolute left-12 top-2 z-50 text-[0.875rem] font-[400] leading-[1rem] ${isLogin ? 'text-primary' : 'text-base-100'}`}
                >
                  day out
                </div>
                <div
                  className={`absolute right-14 top-2 z-50 text-[0.875rem]  font-[400] leading-[1rem] ${isLogin ? 'text-base-100' : 'text-primary'}`}
                >
                  day in
                </div>
              </button>
            </div>
          </div>
        </div>
        <span className="text-base-content ml-6 text-sm font-[500]">Zones</span>
      </div>
      <div className="grid-col-1 mx-6 mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {zones?.map((ele: IZoneData) => (
          <div
            key={ele._id}
            onClick={() => handleOnClick(ele)}
            className={`border-base-300 flex items-center justify-between rounded-xl border py-6 ${isLogin ? 'bg-base-100' : 'bg-gray-200'}`}
          >
            <div className={`w-[70%] truncate pl-6 ${isLogin ? 'font-[500]' : 'font-[500] text-gray-400'}`}>
              <span>{ele?.zoneName === 'zomato' ? 'Pick Up' : ele?.zoneName}</span>
              <span className="ml-2 text-xs opacity-60">{ele?.zoneType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Zones;
