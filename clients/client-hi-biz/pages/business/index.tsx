import HipeopleLogo from '@/assets/svg/hiBizlogo.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useLoyalityData } from '@/components/store/useLoyality';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import type { IBusinessData } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import { PAGE_TYPES, routePaths, routePathsWithId } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { toast } from 'react-toastify';

function Business() {
  const setBusinessData = useBusinessData((s) => s.setBusinessData);
  const [businesses, setBusinesses] = useState<IBusinessData[]>([]);
  const setThemes = useBusinessData((s) => s.setThemes);
  const {
    setLoyaltyId,
    setRewardLimit,
    setExpiryDate,
    setRewardsValue,
    setMaximumClaim,
    setOrigin,
    setCardPattern,
    setCardColor,
    setFontColor,
    setLogo,
  } = useLoyalityData();
  const { setIsLoyaltyExists, setExistingLoyalty } = useBusinessData();
  const user = useOwnerLogin((s) => s.user);
  const router = useRouter();
  const filteredBusinesses = businesses?.filter(
    (business: IBusinessData) => business?.staff?.includes(user._id) || business._id === user?.customRole?.[0]?.businessId,
  );

  const handleRoute = async (businessId: string) => {
    try {
      const response = await axios.get(`${paths.getSingleBusiness(businessId)}`);
      const data = await response.data;
      setBusinessData(data);
      getThemes(businessId);
      getBusinessLoyalty(businessId);
      router.push(routePathsWithId[PAGE_TYPES.BUSINESS_DETAILS](businessId));
    } catch (error) {}
  };
  const getThemes = async (businessId: string) => {
    try {
      const response = await axios.get(`${paths.getTheme(businessId)}`);
      const data = await response.data;
      setThemes(data?.[0]?.themes);
    } catch (error) {}
  };

  const getBusinessLoyalty = async (businessId: string) => {
    try {
      const res = await axios.get(`${paths.getLoyalty(businessId)}`);
      const data = await res.data;
      setLoyaltyId(data?.loyaltyId);
      const isData = data && Object.keys(data)?.length > 0;
      setIsLoyaltyExists(isData);
      if (data) {
        setRewardLimit(data?.rewardLimit);
        setExpiryDate(data?.expiryDate);
        setRewardsValue(data?.rewardsValue);
        setMaximumClaim(data?.maximumClaim);
        setOrigin(data?.origin);
        setCardPattern(data?.cardPattern);
        setCardColor(data?.cardColor);
        setFontColor(data?.fontColor);
        setLogo(data?.logo);
      }
      setExistingLoyalty(data);
    } catch (error) {}
  };

  const getBusiness = async () => {
    try {
      if (user.role === 'RESTAURANT_MANAGER') {
        const response = await axios.get(`${paths.getSingleBusiness(user?.customRole?.[0]?.businessId)}`);
        setBusinesses([response.data]);
        return;
      }
      const response = await axios.get(`/v1/businesses?id=${user._id}`);
      if (response.data === undefined || response.data.length === 0) {
        localStorage.removeItem('ownerLogin');
        toast.error('connection refused please login');
        return router.push('/login');
      }
      setBusinesses(response.data);
      return [response.data];
    } catch (error) {
      console.log(error);
    }
  };

  function addBusiness() {
    router.push(routePaths[PAGE_TYPES.ADD_BUSINESS]());
  }

  const {
    isLoading: isLoad,
    error,
    data: allBizData,
  } = useQuery({
    queryKey: ['getBiz', user._id],
    queryFn: getBusiness,
    enabled: !!user._id,
  });

  return (
    <>
      <div className="relative min-h-screen bg-[#f5f5f5]  px-0 md:px-[20vw] lg:px-[10vw]">
        <div className="sticky top-0 z-10 w-full bg-[#f5f5f5] px-0 pb-4">
          <Header
            leftIcon={<BsChevronLeft />}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
            isIconBusinessShow={user.role !== 'RESTAURANT_MANAGER'}
          />
        </div>
        <div className=" m-auto flex flex-col items-center justify-center pt-[1rem] text-white">
          <div className="h-[4rem] w-[4rem] rounded-full bg-[#2B354D] pt-4 text-center text-xl capitalize">{user.name.charAt(0)}</div>
          <span className="pt-4 text-2xl text-[#2B354D]">{user.name}</span>
          <span className="text-base font-medium text-[#2B354D]">{user.role}</span>
        </div>
        <div className="mx-6 mt-4 flex items-center justify-between border-y-2 px-6 py-4 text-center">
          <div className="text flex flex-col">
            <span className="text-3xl text-[#2B354D]">{filteredBusinesses?.length}</span>
            <span className="text-xs text-[#2B354D]">Business</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl text-[#2B354D]">{filteredBusinesses?.filter((business) => business.status).length}</span>
            <span className="text-xs text-[#2B354D]">Active</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl text-[#EB5757]">{filteredBusinesses?.filter((business) => !business.status).length}</span>
            <span className="text-xs text-[#EB5757]">Due</span>
          </div>
        </div>
        <div className="mx-6 mt-4 text-xl text-[#2B354D]">Business</div>

        <div className="mx-6 mt-4 grid grid-cols-2 gap-4 pb-[5rem] font-normal text-[#2B354D]">
          {filteredBusinesses?.map((ele: any) => (
            <div
              onClick={() => handleRoute(ele._id)}
              key={ele._id}
              className={`${ele?.status ? 'pointer-events-auto' : 'pointer-events-none opacity-75'} on_active_bounce rounded-xl border bg-white p-4`}
            >
              <div className="pb-6">{ele?.logo && <Image src={ele?.logo} width={50} height={50} alt="" />}</div>
              <div className="mb-2 flex items-center pt-4 text-xs">
                <span className={`me-3 h-2 w-2 rounded-full ${ele?.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p>{ele?.status ? 'Active' : 'In Active'}</p>
              </div>
              <div className="text-xl capitalize">{ele?.businessName}</div>
            </div>
          ))}
        </div>
        {user.role !== 'RESTAURANT_MANAGER' && (
          <div className="fixed bottom-5 right-0 px-6">
            <button
              type="button"
              onClick={addBusiness}
              className="on_active_bounce on_active_bounce ml-auto mt-6 rounded-lg border border-[#2B354D] bg-white px-4 py-2 text-[#2B354D]"
            >
              + Add Business
            </button>
          </div>
        )}
      </div>
      {isLoad && <LoadingSpinner />}
    </>
  );
}

export default memo(Business);
