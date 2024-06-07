import welcome from '@/assets/png/hikitchen.png';
import HiKitchenLogo from '@/assets/svg/hikitchenlogo.svg';
import axios from '@/axios';
import { useUserLogin } from '@/components/store/useUserLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import type React from 'react';
import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function LandingPage() {
  const { phoneNumber, setBusinessId, setPhoneNumber, setUser } = useUserLogin();

  const navigate = useNavigate();
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    result();
  };

  const result = async () => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/chef/Login?withBusinessId=false',
        data: {
          phone: phoneNumber,
        },
      };

      const user = await axios(config);
      setUser(user.data);
      if (user.status === 200) {
        toast.success(`Hi ${user?.data?.name}`);
        setBusinessId(user?.data?.customRole?.[0].businessId);
        startTransition(() => {
          navigate(`${singleRoute[PAGE_TYPES.LOGIN](`${user?.data?.customRole?.[0].businessId}`)}`);
        });
      } else {
        toast.error('Phone or Password invalid...!');
      }
    } catch (error) {
      toast.error('Phone or Password invalid...!');
    }
  };

  return (
    <div className="my-auto grid min-h-screen place-items-center bg-[#f5f5f5]">
      <div className="mt-4 flex flex-col items-center">
        <div className="mx-[3.375rem] flex justify-center pt-0 lg:pt-[2rem]">
          <img className="lg:w-[15rem]" src={HiKitchenLogo} alt="Hi Table Logo" loading="lazy" />
        </div>
        <div className="mx-[3.375rem] flex justify-center lg:w-full">
          <img className="lg:h-[30rem] lg:w-[30rem]" src={welcome} alt="Hi Table Logo" />
        </div>
      </div>
      <div className="mb-[12rem] flex flex-col items-start lg:mb-[4rem]">
        <div className="w-full text-center">
          <span className="text-[1rem] font-[400] leading-[1.125rem] text-[#002D4B] lg:text-[1.5rem]">Let’s get started</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-[5.89rem] ml-0 mr-0 mt-[2.5rem] w-full space-y-4 px-[3.125rem] md:px-[15rem] lg:px-[25rem]">
            <div className="relative w-full">
              <input
                onChange={handlePhoneNumberChange}
                type="text"
                id="floating_outlined3"
                className="peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 bg-transparent pb-3 pl-4 pr-[7rem] pt-2 text-base text-gray-900 focus:border-[#50A466] focus:outline-none dark:border-gray-600 dark:text-white"
                placeholder=" "
                maxLength={10}
                minLength={10}
                required
              />
              <label
                htmlFor="floating_outlined3"
                className="absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:bg-[#f5f5f5] peer-focus:px-2 peer-focus:text-[#50A466] dark:bg-gray-900 dark:text-gray-400 peer-focus:dark:text-[#50A466]"
              >
                Phone number
              </label>
            </div>
          </div>
          <div className="mb-5 flex justify-center">
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

export default LandingPage;
