import HiTableLogo from '@/assets/svg/HiTableLogo.svg';
import welcome from '@/assets/svg/welcomeLogo.svg';
import axios from '@/axios';
import { useBusinessStore } from '@/components/store/useBusinessData';
import { useLogin } from '@/components/store/useLogin';
import { useLoyaltyStore } from '@/components/store/useLoyaltyData';
import { useUserToken } from '@/components/store/useUserToken';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type React from 'react';
import { toast } from 'react-toastify';

function HiTable() {
  const { setAccessToken, setRefreshToken } = useUserToken();
  const { phoneNumber, password, setPhoneNumber, setPassword, setIsLogin } = useLogin();

  const setBusinessData = useBusinessStore((s) => s.setBusinessData);
  const setLoyaltyData = useLoyaltyStore((s) => s.setLoyaltyData);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const setUserDetails = useLogin((s) => s.setUserDetails);

  const result = async () => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/waiterLogin',
        data: {
          phone: phoneNumber,
          password: password,
        },
      };

      const response = await axios(config);

      if (response.status === 201) {
        const { _id, ...otherData } = response.data.existingUser;
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        console.log(response.data.accessToken);
        console.log(response.data.refreshToken);
        console.log(response.data.existingUser);
        setUserDetails({ id: _id, ...otherData });
        setIsLogin(true);
        router.push(`${singleRoute[PAGE_TYPES.ZONE](`${businessId}`)}`);
      }
    } catch (err) {
      return toast.error('Phone or Password invalid...!');
    }
  };

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`/v1/businesses/get/Single/${businessId}`);
      setBusinessData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };
  const getLoyaltySetting = async (businessId: string) => {
    try {
      const response = await axios.get(`/v1/businesses/${businessId}/loyalty`);
      const data = response.data;
      setLoyaltyData(data);
      return data;
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['businessData', businessId],
    queryFn: fetchBusinessData,
    enabled: !!businessId,
  });

  const {
    data: loyaltyData,
    isLoading: loyaltyIsLoading,
    error: loyaltyError,
  } = useQuery({
    queryKey: ['loyaltySetting', businessId],
    queryFn: () => getLoyaltySetting(businessId),
    enabled: !!businessId,
  });

  return (
    <div>
      <div className="mt-[2rem] flex justify-center">
        <Image width={104} height={31} src={HiTableLogo} alt="Hi Table Logo" />
      </div>
      <div className="mx-[3.375rem] mt-[1rem] flex justify-center">
        <Image width={283} height={223} src={welcome} alt="Hi Table Logo" />
      </div>
      <div className="mt-[2.5rem] text-center">
        <span className="text-base-content text-[1rem] font-[400] leading-[1.125rem]">Let’s get started</span>
      </div>

      <div className="relative mb-[5.89rem] ml-0 mr-0 mt-[2.5rem] w-full space-y-4 px-[3.125rem]">
        <div className="relative">
          <input
            onChange={handlePhoneNumberChange}
            type="tel"
            value={phoneNumber}
            id="floating_outlined3"
            className="dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-4 pt-2 text-base text-gray-900 focus:outline-none dark:border-gray-600"
            placeholder=" "
            maxLength={10}
            minLength={10}
            required
          />
          <label
            htmlFor="floating_outlined3"
            className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
          >
            Phone number
          </label>
        </div>
        <div className="relative">
          <input
            onChange={handlePasswordChange}
            type="password"
            id="floating_outlined4"
            className="dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-4 pt-2 text-base text-gray-900 focus:outline-none dark:border-gray-600"
            placeholder=" "
            maxLength={4}
            minLength={4}
            required
          />
          <label
            htmlFor="floating_outlined4"
            className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
          >
            Password
          </label>
        </div>
      </div>

      <div className="mb-5 flex justify-center">
        <button
          onClick={result}
          type="button"
          className="on_active_bounce bg-primary text-base-100 fixed bottom-6 z-50 w-[20.5rem] rounded-full py-[0.75rem] text-[18px] font-[600] leading-[1.15rem]"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default HiTable;
