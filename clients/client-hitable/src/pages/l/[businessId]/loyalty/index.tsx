import HiPalLogo from '@/assets/svg/hipalLogoNew.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atoms/loadingSpinner';
import Logout from '@/components/atoms/logout';
import FooterLite from '@/components/molecules/footerLite';
import { useLogin } from '@/components/store/useLogin';
import { useUsersHistory, type IUserHistory } from '@/components/store/useUsersHistory';
import { paths } from '@/components/utils/paths';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash-es';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { HiSearch } from 'react-icons/hi';

const Loyalty = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [usersHistory, setUsersHistory] = useState<IUserHistory[]>([]);
  const [singleUser, setSingleUser] = useState<IUserHistory[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const setUsersHistoryZ = useUsersHistory((s) => s.setUsersHistory);
  const usersHistoryZ = useUsersHistory((s) => s.usersHistory);
  const { setSingleUserHistory } = useUsersHistory();
  const loyaltyId = useLogin((s) => s.loyaltyId);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };

  useEffect(() => {
    setUsersHistory(usersHistoryZ);
  }, []);

  const handleSearchChange = async (e: any) => {
    const value = e.target.value.replace(/\D/g, '');
    setSearchQuery(value);
    if (value.length === 10 && loyaltyId !== undefined) {
      setIsSearchActive(true);
      setIsLoading(true);
      getUserData(value, businessId, loyaltyId);
    } else {
      setIsSearchActive(false);
    }
  };

  const getUserData = async (value: string, businessId: string, loyaltyId: string) => {
    try {
      const userHistory = await axios(`/v1/users/${businessId}/RewardHistory?loyaltyId=${loyaltyId}&findUser=${value}`);
      setIsLoading(false);
      if (userHistory.data) {
        setSingleUser([userHistory.data]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getHistoryApi = async (loyaltyId: string) => {
    const fieldMasks = '[ "userName", "rewards", "status", "time", "loyaltyId", "id", "userPhone" ]';
    try {
      const userHistory = await axios(paths.getUsersHistory(pageNumber, businessId, loyaltyId, fieldMasks));
      setIsLoading(false);
      if (!isEqual(usersHistoryZ, userHistory.data)) {
        setUsersHistoryZ(userHistory.data);
        setUsersHistory(userHistory.data);
        setIsLoading(false);
      }
      return userHistory.data;
    } catch (err) {
      console.log(err);
    }
  };

  const {
    isLoading: isLoadingHistory,
    error,
    data,
  } = useQuery({
    queryKey: ['usersHistory', pageNumber, businessId, loyaltyId],
    queryFn: () => getHistoryApi(loyaltyId || ''),
    enabled: !!loyaltyId && !!businessId && !!pageNumber,
  });

  const handleUserData = async (e: any, user) => {
    if (searchQuery?.length > 0 && searchQuery?.length < 10) return;
    setIsLoading(true);
    try {
      if (!loyaltyId) return;
      const fieldMasks = '[ "userName", "rewards", "status", "time", "loyaltyId", "id","waiterName","userPhone","waiterName","day","total" ]';

      const response = await axios(paths.getSingleUserHistory(Number(searchQuery || user?.userPhone), loyaltyId, fieldMasks));
      setIsLoading(false);
      if (response.data) {
        setSingleUserHistory(response?.data);
        router.push(singleRoute[PAGE_TYPES.TRANSACTIONS](businessId));
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleClick = (newPage: number) => {
    setPageNumber(newPage);
  };

  if (isLoadingHistory) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-secondary/50 relative min-h-screen pb-20">
      <div className="bg-secondary sticky top-0 z-20">
        <div className="mb-4 ml-[1.5rem] flex justify-between pt-[2rem]">
          <Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
          <div className="mx-6 flex items-center">
            <Logout />
          </div>
        </div>
        <div className="relative mx-6">
          <HiSearch
            size={16}
            className="text-primary/80 dark:text-primary pointer-events-none absolute inset-y-0 left-2 top-[0.625rem] flex items-center"
          />
          <input
            type="text"
            maxLength={10}
            pattern="\d{10}"
            placeholder="Search by number"
            onChange={handleSearchChange}
            className="border-primary w-full rounded-lg border py-2 pl-8 pr-2 text-sm text-[#8E92A1]"
          />
        </div>
      </div>
      {isSearchActive ? (
        singleUser.length > 0 ? (
          singleUser?.map((user, index) => {
            return (
              <div
                onKeyDown={(e) => handleUserData(e, user)}
                key={index.toString()}
                onClick={(e) => handleUserData(e, user)}
                className="bg-base-100 mx-[1.5rem] mt-[1rem] rounded-2xl border border-[#e1e1e1]/50 pb-[0.5rem]"
              >
                <div className="flex justify-between">
                  <div className="ml-3 mt-4 flex w-full items-center justify-between">
                    <div className="flex">
                      <span className="mx-1">
                        <CgProfile size={20} />
                      </span>
                      <span className="text-base-content ml-1 text-[1rem] font-semibold capitalize leading-[1.125rem]">
                        {user?.userName || user?.userPhone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mx-4 my-2">
                  <span>{user?.userPhone}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="fixed left-1/2 top-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">Data Not Found</div>
        )
      ) : usersHistory?.length > 0 ? (
        usersHistory?.map((user, index) => {
          return (
            <div
              key={index.toString()}
              onKeyDown={(e) => handleUserData(e, user)}
              onClick={(e) => handleUserData(e, user)}
              className="bg-base-100 mx-[1.5rem] mt-[1rem] rounded-2xl border border-[#e1e1e1]/50 pb-[0.5rem]"
            >
              <div className="flex justify-between">
                <div className="ml-3 mt-4 flex w-full items-center justify-between">
                  <div className="align-center flex">
                    <span className="mx-1">
                      <CgProfile size={20} />
                    </span>
                    <span className="text-base-content ml-1 text-[1rem] font-semibold capitalize leading-[1.125rem]">
                      {user?.userName || user?.userPhone}
                    </span>
                  </div>
                  <div className="mr-4">
                    <span className="text-sm text-[#999]">{user?.time}</span>
                  </div>
                </div>
              </div>
              <div className="mx-4">
                {user?.status === 'plus' ? (
                  <span className="text-[0.875rem] font-[400] leading-[1rem] text-[#00BA34]">Got {user?.rewards} coins</span>
                ) : (
                  <span className="text-[0.875rem] font-[400] leading-[1rem] text-[#fc4848]">Claim {user?.rewards} coins</span>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="fixed left-1/2 top-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">Loading or No Data</div>
      )}
      {!isSearchActive && (
        <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
          <button
            type="button"
            onClick={() => handleClick(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
          <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">{pageNumber}</p>
          {usersHistory && usersHistory.length > 0 ? (
            <button
              type="button"
              onClick={() => handleClick(pageNumber + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
            >
              <BiChevronsRight />
            </button>
          ) : null}
        </div>
      )}
      <FooterLite />
    </div>
  );
};

export default memo(Loyalty);
