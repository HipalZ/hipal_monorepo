import HiTableLite from '@/assets/img/hitableLite.png';
import axios from '@/axios';
import { useLogin } from '@/components/store/useLogin';
import { useLoyaltyDatas } from '@/components/store/useLoyaltyDatas';
import { paths } from '@/components/utils/paths';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { isEmpty } from 'lodash-es';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type React from 'react';
import { memo } from 'react';
import { toast } from 'react-toastify';

function HiTable() {
  const { phoneNumber, password, setPhoneNumber, setPassword } = useLogin();

  const setLoyaltyId = useLogin((s) => s.setLoyaltyId);
  const setIsLogin = useLogin((s) => s.setIsLogin);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { setLoyaltyData } = useLoyaltyDatas();
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleBusinessNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    result();
  };

  const setUserDetails = useLogin((s) => s.setUserDetails);
  const fetchLoyaltyData = async () => {
    try {
      const response = await axios(paths.getLoyaltySettings(businessId));
      setLoyaltyId(response?.data?.loyaltyId);
      setLoyaltyData(response?.data);
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };
  const result = async () => {
    try {
      const config = {
        method: 'POST',
        url: paths.postWaiterLogin(),

        data: {
          phone: phoneNumber,
          password: password,
        },
      };

      const user = await axios(config);
      const res = user.data;
      await fetchLoyaltyData();
      if (!isEmpty(res)) {
        setUserDetails(res);
        setIsLogin(true);
      }
      toast.success('Login successful...');
      router.push(`${singleRoute[PAGE_TYPES.LOYALTY](`${businessId}`)}`);
    } catch (err: any) {
      if (err?.response && err?.response?.status === 400) {
        toast.error('Phone or Password invalid...!');
      } else {
        console.log(err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-[30rem]">
        <div className="mx-[3.375rem] mt-[2rem] flex justify-center">
          <Image className="h-[15rem] w-full" src={HiTableLite} alt="Hi Table Logo" priority />
        </div>
        <div className="mt-[1rem] text-center">
          <span className="text-base-content text-[1rem] font-semibold leading-[1.125rem]">Let’s get started</span>
        </div>
        <form onSubmit={handleSubmit} className="px-10">
          <div className="relative mb-[5.89rem] ml-0 mr-0 mt-[1rem] w-full space-y-6">
            <div className="relative">
              <input
                onChange={handlePhoneNumberChange}
                type="tel"
                id="floating_outlined3"
                className="dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-2xl border border-gray-800 bg-transparent pb-3 pl-4 pr-4 pt-2 text-base text-gray-900 focus:outline-none dark:border-gray-600"
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
                onChange={handleBusinessNameChange}
                type="password"
                id="floating_outlined"
                className="dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-2xl border border-gray-800 bg-transparent pb-3 pl-4 pr-4 pt-2 text-base text-gray-900 focus:outline-none dark:border-gray-600"
                placeholder=" "
                required
              />
              <label
                htmlFor="floating_outlined"
                className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
              >
                Password
              </label>
            </div>
          </div>
          <div className="mb-5 flex justify-center">
            <button type="submit" className=" on_active_bounce bg-primary w-full rounded-full rounded-full py-2 capitalize text-white">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(HiTable);
