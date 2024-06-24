import axios from '@/axios';
import { useLogin } from '@/components/store/useLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import HiTableLogo from '../assets/svg/HiTableLogo.svg';
import welcome from '../assets/svg/welcomeLogo.svg';

function HiTable() {
  const { phoneNumber, setPhoneNumber } = useLogin();

  const userDetail = useLogin((s) => s.userDetails);
  const router = useRouter();
  const businessId = userDetail.customRole?.[0]?.businessId;

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  useEffect(() => {
    if (businessId === undefined) {
      router.push('/');
    }
    if (businessId !== undefined && businessId !== '64b630b09f464445c1fbd169') {
      router.push(`/r/${businessId}/zone`);
    }
  }, []);

  const setUserDetails = useLogin((s) => s.setUserDetails);

  const result = async () => {
    try {
      const config = {
        method: 'POST',
        url: '/v1/users/chef/Login?withBusinessId=false',
        data: {
          phone: phoneNumber,
        },
      };

      const response = await axios(config);

      if (response.status === 200) {
        const { _id, ...otherData } = response.data;
        setUserDetails({ id: _id, ...otherData });
        toast.success(`Hi ${response?.data?.name}`);
        router.push(`${singleRoute[PAGE_TYPES.LOGIN](`${response?.data?.customRole?.[0].businessId}`)}`);
      }
    } catch (err) {
      console.log(err);
      toast.error('User not registered as staff!');
    }
  };
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
            type="text"
            id="floating_outlined"
            className="text-base-content bg-base-100 dark:text-base-100 focus:border-primary peer mb-0 ml-0 mr-0 block w-full rounded-lg border border-gray-800 pb-4 pl-4 pr-4 pt-2 text-base focus:outline-none dark:border-gray-600"
            placeholder=" "
            maxLength={10}
            minLength={10}
            required
          />
          <label
            htmlFor="floating_outlined"
            className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
          >
            Phone number
          </label>
        </div>
      </div>

      <div className="absolute bottom-4 flex w-full items-center justify-center px-6">
        <button
          onClick={result}
          type="button"
          className="text-base-100 on_active_bounce bg-primary w-full rounded-full py-3 text-xl md:w-1/2 lg:w-1/4"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default HiTable;
