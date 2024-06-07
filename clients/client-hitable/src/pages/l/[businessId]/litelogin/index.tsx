import type React from "react";
import HiTableLite from "@/assets/img/hitableLite.png"
import { isEmpty } from "lodash-es";
import Image from "next/image";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/axios";
import { useRouter } from "next/router";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { toast } from "react-toastify";
import { paths } from "@/components/utils/paths";
import { useLoyaltyDatas } from "@/components/store/useLoyaltyDatas";
import { memo } from "react";

function HiTable() {
  const {
    phoneNumber,
    password,
    setPhoneNumber,
    setPassword,
  } = useLogin();

  const setLoyaltyId = useLogin((s) => s.setLoyaltyId);
  const setIsLogin = useLogin((s) => s.setIsLogin);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { setLoyaltyData } = useLoyaltyDatas();
  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPhoneNumber(event.target.value);
  };

  const handleBusinessNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      console.error("Error fetching business data:", error);
    }
  };
  const result = async () => {
    try {
      const config = {
        method: "POST",
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
      toast.success("Login successful...");
      router.push(`${singleRoute[PAGE_TYPES.LOYALTY](`${businessId}`)}`);
    } catch (err: any) {
      if (err?.response && err?.response?.status === 400) {
        toast.error("Phone or Password invalid...!");
      } else {
        console.log(err);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-[30rem]">
        <div className="flex justify-center mt-[2rem] mx-[3.375rem]">
          <Image
            className="w-full h-[15rem]"
            src={HiTableLite}
            alt="Hi Table Logo"
            priority
          />
        </div>
        <div className="text-center mt-[1rem]">
          <span className="font-semibold text-base-content text-[1rem] leading-[1.125rem]">
            Let’s get started
          </span>
        </div>
        <form onSubmit={handleSubmit} className="px-10">
          <div className="relative w-full mt-[1rem] mb-[5.89rem] ml-0 mr-0 space-y-6">
            <div className="relative">
              <input
                onChange={handlePhoneNumberChange}
                type="tel"
                id="floating_outlined3"
                className="block w-full pt-2 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-gray-800 rounded-2xl dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                placeholder=" "
                maxLength={10}
                minLength={10}
                required
              />
              <label
                htmlFor="floating_outlined3"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Phone number
              </label>
            </div>
            <div className="relative">
              <input
                onChange={handleBusinessNameChange}
                type="password"
                id="floating_outlined"
                className="block w-full pt-2 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-gray-800 rounded-2xl dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="floating_outlined"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Password
              </label>
            </div>
          </div>
          <div className="flex justify-center mb-5">
            <button type="submit" className=" w-full on_active_bounce capitalize py-2 rounded-full text-white bg-primary rounded-full">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(HiTable);
