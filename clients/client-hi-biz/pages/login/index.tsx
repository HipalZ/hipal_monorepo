import HiKitchenLogo from '@/assets/svg/hiBizlogo.svg';
import Sir from '@/assets/svg/sir2.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { memo, useState } from 'react';
import { toast } from 'react-toastify';
function Login() {
  const { phoneNumber, password, setIsLogin, setPassword, setPhoneNumber, setUser } = useOwnerLogin();

  const router = useRouter();

  const { businessId } = router.query as { businessId: string };
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const result = async () => {
    setIsLoading(true);
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/Owner/Login',
        data: {
          phone: phoneNumber,
          password: password,
          businessId: businessId,
        },
      };

      const user = await axios(config);
      const isData = user?.data && Object.keys(user?.data)?.length > 0;
      if (isData) {
        setUser(user.data);
      }
      if (user.status === 200) {
        toast.success('Login Successfully');
        setIsLogin(true);
        router.push(routePaths[PAGE_TYPES.BUSINESS]());
      } else {
        toast.error('Phone or Password invalid...!');
      }
    } catch (err: any) {
      toast.error('Phone or Password invalid...!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen flex-col justify-between bg-[#f6e8dd] px-0 md:items-center md:px-[20vw] lg:items-center lg:px-[40vw]">
        <div className="flex flex-col items-center justify-center pt-4 ">
          <div className="mt-4">
            <Image src={HiKitchenLogo} alt="Hi Table Logo" />
          </div>
          <div className="mt-6 rounded-t-[3rem] bg-[#f6e8dd] py-2 text-center">
            <Image className="h-[40vh] w-[85vw]" src={Sir} alt="Hi Logo" />
          </div>
        </div>
        <div className="mx-6 flex flex-col text-start text-3xl font-medium text-[#2B354D]">
          <span className="mt-6">Hey,</span>
          <span className="">Welcome Back!</span>
        </div>
        <div className="flex flex-col items-center justify-center px-6 pb-12 lg:px-0">
          <div className="relative mb-[5.89rem] ml-0 mr-0 mt-6 w-full space-y-4 px-0">
            <div className="relative w-full">
              <input
                onChange={handlePhoneNumberChange}
                type="tel"
                value={phoneNumber}
                id="floating_outlined3"
                className="peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-4 pt-2 text-base text-gray-900 focus:border-[#EF522F] focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white"
                placeholder=" "
                maxLength={10}
                minLength={10}
                required
              />
              <label
                htmlFor="floating_outlined3"
                className="absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-[#f6e8dd] px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-[#EF522F] dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-[#EF522F]"
              >
                Phone number
              </label>
            </div>
            <div className="relative w-full">
              <input
                onChange={handlePasswordChange}
                type="tel"
                value={password}
                id="floating_outlined"
                className="peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#EF522F] focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white"
                placeholder=" "
                maxLength={4}
                minLength={4}
                required
              />
              <label
                htmlFor="floating_outlined"
                className="absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-[#f6e8dd] px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-[#EF522F] dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-[#EF522F]"
              >
                Password
              </label>
            </div>
          </div>
        </div>
        <div onClick={result} className="fixed bottom-4 flex w-full items-center justify-between px-6 outline-none md:px-[20vw] lg:px-[40vw]">
          <button
            type="button"
            className={`${isLoading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-full bg-[#EF522F] py-2 capitalize text-white`}
          >
            {`${isLoading ? 'Loading...' : 'Login'}`}
          </button>
        </div>
      </div>
      {isLoading && <LoadingSpinner />}
    </>
  );
}

export default memo(Login);
