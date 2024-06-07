import welcome from '@/assets/png/hikitchen.png';
import HiKitchenLogo from '@/assets/svg/hikitchenlogo.svg';
import axios from '@/axios';
import { useBusinessData } from '@/components/store/useBusinessData';
import { useUserLogin } from '@/components/store/useUserLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import React, { startTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const { phoneNumber, password, setIsLogin, setPassword, setPhoneNumber, setUser } = useUserLogin();
  const { businessData, setBusinessData } = useBusinessData();
  const navigate = useNavigate();

  const { businessId } = useParams<{ businessId: string }>();

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    result();
  };

  const result = async () => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/chef/Login?withBusinessId=true',
        data: {
          phone: phoneNumber,
          password: password,
          businessId: businessId,
        },
      };

      const user = await axios(config);
      const isData = user?.data && Object.keys(user.data).length > 0;
      if (isData) {
        setUser(user.data);
      }
      if (user.status === 200) {
        toast.success('Login Successfully');
        setIsLogin(true);
        startTransition(() => {
          navigate(`${singleRoute[PAGE_TYPES.KITCHENS](`${businessId}`)}`);
        });
      } else {
        toast.error('Phone or Password invalid...!');
      }
    } catch (err) {
      toast.error('Phone or Password invalid...!');
    }
  };

  async function getBusinessData() {
    try {
      const res = await axios(`/v1/businesses/get/Single/${businessId}`);
      const data = await res.data;
      setBusinessData(data);
      return data;
    } catch (error) {
      toast.error('Please Login Again...!');
    }
  }

  const { isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: getBusinessData,
    enabled: !!businessId,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-auto grid min-h-screen place-items-center bg-[#f5f5f5]">
      <div className="mt-4 flex flex-col items-center">
        <div className="mx-[3.375rem] flex justify-center pt-0 lg:pt-[2rem]">
          <img className="lg:w-[15rem]" src={HiKitchenLogo} alt="Hi Table Logo" loading="lazy" />
        </div>
        <div className="relative mx-[3.375rem] flex justify-center lg:w-full">
          <div>
            <img className="lg:h-[30rem] lg:w-[30rem]" src={welcome} alt="Hi Table Logo" loading="lazy" />
          </div>
          <div className="absolute -bottom-[3.5rem] h-[6rem] w-[6rem] rounded-full lg:-bottom-8 lg:h-[8rem] lg:w-[8rem]">
            <img height={100} width={100} className="h-20 w-20 rounded-full" src={businessData?.logo} alt="Business Logo" />
          </div>
        </div>
      </div>
      <div className="mb-[12rem] flex flex-col items-start lg:mb-[4rem]">
        <form onSubmit={handleSubmit}>
          <div className="relative mb-[5rem] ml-0 mr-0 mt-[2.5rem] w-full space-y-4 px-[3.125rem] md:px-[15rem] lg:px-[25rem]">
            <div className="relative w-full">
              <input
                onChange={handlePhoneNumberChange}
                type="tel"
                value={phoneNumber}
                id="floating_outlined3"
                className="peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#50A466] focus:outline-none dark:border-gray-600 dark:text-white"
                placeholder=" "
                maxLength={10}
                minLength={4}
                required
              />
              <label
                htmlFor="floating_outlined3"
                className="peer:bg-[#f5f5f5] absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-[#f5f5f5] px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:bg-[#f5f5f5] peer-focus:px-2 peer-focus:text-[#50A466]  dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-[#50A466]"
              >
                Phone number
              </label>
            </div>
            <div className="relative">
              <input
                onChange={handlePasswordChange}
                type="password"
                id="floating_outlined4"
                className="peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#50A466] focus:outline-none dark:border-gray-600 dark:text-white"
                placeholder=" "
                maxLength={4}
                minLength={4}
                required
              />
              <label
                htmlFor="floating_outlined4"
                className="absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-[#f5f5f5] px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:bg-[#f5f5f5] peer-focus:px-2 peer-focus:text-[#50A466] dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-[#50A466]"
              >
                Password
              </label>
            </div>
          </div>
          <div className="mb-5 flex items-center justify-center">
            <button
              type="submit"
              className="on_active_bounce w-[20.5rem] rounded-full border bg-[#50A466] py-[0.75rem] text-[18px] font-[600] leading-[1.15rem] text-white"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
