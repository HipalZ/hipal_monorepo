import HikitchenLogo from '@/assets/svg/hikitchenlogo.svg';
import axios from '@/axios';
import { useBusinessData } from '@/components/store/useBusinessData';
import { useUserLogin } from '@/components/store/useUserLogin';
import type { IKitchen } from '@/components/types';
import { PAGE_TYPES, doubleRoute, singleRoute } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { MdMenuOpen } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

function Kitchens() {
  const navigate = useNavigate();
  const { user, isLogin, setIsLogin, setKitchenName } = useUserLogin();
  const { businessData } = useBusinessData();
  const [kitchenData, setKitchenData] = useState<IKitchen[]>([]);
  const today = new Date();
  const date = today.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const day = today.toLocaleDateString('en-US', { weekday: 'long' });
  const { businessId } = useParams<{ businessId: string }>();
  const id = useBusinessData((s) => s.businessData.id);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleKitchenClick = (kitchenName: string, itemId: string) => {
    setKitchenName(kitchenName);
    startTransition(() => {
      navigate(doubleRoute[PAGE_TYPES.KITCHEN_DETAIL](businessId || '', itemId));
    });
  };
  const getAllKitchenByChef = async () => {
    try {
      const config = {
        method: 'get',
        url: `/v1/kitchens/All/ByChef?businessId=${businessId || id}&chefId=${user?._id}`,
      };
      const res = await axios(config);
      if (res.status === 200) {
        setKitchenData(res.data);
        return res.data;
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const redirectToSettings = () => {
    startTransition(() => {
      navigate(`${singleRoute[PAGE_TYPES.SETTING](businessId || '')}`);
    });
  };

  const { isLoading } = useQuery({
    queryKey: ['kitchens', businessId, user?._id],
    queryFn: getAllKitchenByChef,
    enabled: !!businessId && !!user?._id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-6">
      <div className="ml-[1.5rem] flex justify-between pt-[2rem] md:mx-[4rem] lg:mx-[12rem] lg:justify-center">
        <img
          className="md:h-[3rem] md:w-[8rem] lg:h-[6rem] lg:w-[12rem]"
          width={90}
          height={40}
          src={HikitchenLogo}
          alt="Hi Table Logo"
          loading="lazy"
        />
        <span onClick={redirectToSettings}>
          <MdMenuOpen className="mr-[1.5rem] text-2xl lg:hidden" />
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:mx-[11rem] lg:grid-cols-2 lg:gap-6">
        <div className="mx-6 mt-6 flex flex-row rounded-2xl bg-[#50A466] py-4 md:mx-[4rem] lg:mx-4 lg:h-[12rem]">
          <div className="mx-4 flex w-[25%] flex-col items-center justify-center rounded-2xl bg-white py-4 text-center text-[#505050]">
            <div>{date}</div>
            <div className="text-[1.125rem] font-bold text-[#505050]">{day}</div>
          </div>
          <div className="flex flex-1 flex-row ">
            <div className="flex flex-1 flex-col items-center justify-center text-white">
              <div>Punch In</div>
              <div>Punch Out</div>
            </div>
            <div className="w-[0.125rem] bg-white" />
            <div className="flex flex-1 flex-col items-center justify-center text-white">
              <div>Punch In</div>
              <div>Punch Out</div>
            </div>
          </div>
        </div>

        <div className="mx-[1.5rem] mb-6 mt-[1.5rem] rounded-2xl border border-[#e1e1e1]/50 bg-white pb-[0.5rem] md:mx-[4rem] lg:mx-4">
          <div className="flex justify-between">
            <div className="ml-4 mt-4 ">
              <span className="text-[1rem] font-[400] leading-[1.125rem] text-black md:text-xl lg:text-2xl xl:text-3xl">Hello, </span>
              <span className="text-[1rem] font-semibold capitalize leading-[1.125rem] text-[#50A466] md:text-xl lg:text-2xl xl:text-3xl">
                {user?.name}
              </span>
            </div>
            <div className="mr-[1rem] mt-[0.75rem] flex h-7 w-7 justify-center rounded-full border border-[#50A466] bg-white pt-1 text-[1rem] font-semibold capitalize leading-[1.125rem] text-black md:h-10 md:w-10 md:text-xl lg:h-12 lg:w-12 lg:text-2xl xl:text-3xl">
              {user?.name?.[0]}
            </div>
          </div>
          <div className="mx-4 mt-2">
            <span className="text-[0.875rem] font-[400] leading-[1rem] text-black md:text-lg lg:text-xl xl:text-2xl">You logged into </span>
            <span className="text-[0.875rem] font-semibold capitalize leading-[1rem] text-[#50A466] md:text-lg lg:text-xl xl:text-2xl">
              {businessData?.businessName}
            </span>
          </div>
          <div>
            <div className="mx-[1rem] my-4 flex items-center rounded-xl border border-[#50A466]/80">
              <button
                type="button"
                className={`relative flex h-8 w-full rounded-full capitalize transition-colors duration-300 ease-in-out ${isLogin ? '' : ''}`}
                onClick={handleToggle}
              >
                <span
                  className={`absolute bottom-0.5 left-[0.125rem] top-0.5 h-7 w-[49.5%] transform rounded-xl transition-transform duration-300 ease-in-out ${
                    isLogin ? 'translate-x-full bg-green-500' : 'bg-[#7D857F]'
                  }`}
                />
                <div className={`absolute left-12 top-2 z-50 text-[0.875rem] font-[400] leading-[1rem] ${isLogin ? 'text-[#50A466]' : 'text-white'}`}>
                  day out
                </div>
                <div
                  className={`absolute right-14 top-2 z-50 text-[0.875rem] font-[400] leading-[1rem] ${isLogin ? 'text-white' : 'text-[#50A466]'}`}
                >
                  day in
                </div>
              </button>
            </div>
          </div>
          <span className="mx-[1rem] mt-4 text-[0.875rem] text-base font-semibold leading-[1rem] text-[#50A466]/40">Your break was at</span>
        </div>
      </div>
      <span className="ml-6 text-xl font-[500] leading-[1rem] text-[#50A466] md:ml-[4rem] lg:ml-[12rem]">Kitchens</span>

      <div className="mx-6 mt-4 grid grid-cols-2 gap-4 md:mx-[4rem] md:grid-cols-3 md:gap-8 lg:mx-[12rem] lg:grid-cols-4 lg:gap-[2rem] xl:grid-cols-5 xl:gap-[3rem]">
        {kitchenData.length > 0 ? (
          kitchenData?.map((item) => (
            <div
              key={item?._id}
              onClick={() => handleKitchenClick(item?.kitchenName, item._id)}
              className="relative min-h-[8rem] w-full rounded-xl bg-white md:min-h-[12rem]"
            >
              <div className="ml-4 mt-4">{item?.kitchenName}</div>
              <div className="absolute bottom-4 left-0 right-0 mx-4 h-[2rem] rounded-2xl bg-[#50A466]">
                <HiArrowNarrowRight className="absolute bottom-0 left-0 right-0 top-0 m-auto text-[1.25rem] text-white" />
              </div>
            </div>
          ))
        ) : (
          <p>No Kitchen Found</p>
        )}
      </div>
    </div>
  );
}

export default Kitchens;
