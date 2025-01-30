import liteLoginIcon1 from "@/assets/img/liteLoginIcon1.png";
import liteLoginIcon2 from "@/assets/img/liteLoginIcon2.png";
import liteLoginIcon3 from "@/assets/img/liteLoginIcon3.png";
import liteLoginIcon4 from "@/assets/img/liteLoginIcon4.png";
import liteLoginIcon5 from "@/assets/img/liteLoginIcon5.png";
import liteLoginIcon6 from "@/assets/img/liteLoginIcon6.png";
import liteLoginIcon7 from "@/assets/img/liteLoginIcon7.png";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { memo, useState } from "react";
import toast from "react-hot-toast";
import { useErrorHandling } from "@/components/utils/helpers";
import { FiDownload } from "react-icons/fi";
import { useUpdateNotifications } from "@/utils/apiService";

//test//
const LoginMemo = () => {
  const { errorText } = useErrorHandling();
  const setAccessToken = useUserToken((s) => s.setAccessToken);
  const setRefreshToken = useUserToken((s) => s.setRefreshToken);
  const { updateNotificationsApi } = useUpdateNotifications();
  const [password, setPassword] = useState<string>("");

  const { setLoading } = useLiteStore();

  // store
  const { setCaptainData, phoneNumber, setPhoneNumber } = useHiClientZ((s) => ({
    setCaptainData: s.setCaptainData,
    phoneNumber: s.phoneNumber,
    setPhoneNumber: s.setPhoneNumber,
  }));

  //methods
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await apiRpc.users[":id"].stafflogin.$post({
        json: {
          phone: phoneNumber,
          password: password,
        },
      });
      if (res.status === 401) {
        return errorText();
      }
      const response = await res.json();
      if (res.status === 200) {
        setCaptainData(response.data.user);
        setRefreshToken(response.data.refreshToken);
        setAccessToken(response.data.accessToken);
        await updateNotificationsApi(true);
        toast.success(`Hi ${response.data.user.name}! Welcome to HiClientZ`);
        setLoading(false);
        window.location.href = "/businesses";
      } else {
        toast.error("Invalid login");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Failed to login. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <center>
      <a
        className="fixed w-full max-w-[30rem] top-0 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 text-white bg-[#4C4DDC]"
        href="https://assets.hipalz.com/app-debug%20(6).apk"
      >
        <FiDownload className="mr-2 text-white" size={20} />{" "}
        <span>Update App</span>
      </a>
      <section className="relative max-w-[30rem]">
        <div className="mobileGrad border-1 mx-[4rem] mt-[4rem] flex h-[28rem] justify-center">
          <div className="flex flex-col items-center">
            <h1 className="mt-[2rem] text-3xl font-bold">HiClientZ</h1>
          </div>
        </div>
        <div className="absolute flex justify-between mx-8 top-1/2">
          <section>
            <img
              src={liteLoginIcon1}
              alt="liteLoginIcon1"
              width={55}
              height={55}
              loading="lazy"
              className="liteLoginIcon1"
            />
          </section>
          <section className="-mt-5">
            <img
              src={liteLoginIcon2}
              alt="liteLoginIcon2"
              width={38}
              height={38}
              loading="lazy"
              className="liteLoginIcon2"
            />
          </section>
          <section className="w-10 mt-5">
            <img
              src={liteLoginIcon3}
              alt="liteLoginIcon3"
              width={43}
              height={43}
              loading="lazy"
              className="liteLoginIcon3"
            />
          </section>
          <section className="mx-4">
            <img
              src={liteLoginIcon4}
              alt="liteLoginIcon4"
              width={98}
              height={98}
              loading="lazy"
              className="liteLoginIcon4"
            />
          </section>
          <section className="-mt-10">
            <img
              src={liteLoginIcon5}
              alt="liteLoginIcon5"
              width={57}
              height={57}
              loading="lazy"
              className="liteLoginIcon5"
            />
          </section>
          <section className="mt-10">
            <img
              src={liteLoginIcon6}
              alt="liteLoginIcon6"
              width={43}
              height={43}
              loading="lazy"
              className="liteLoginIcon6"
            />
          </section>
          <section>
            <img
              src={liteLoginIcon7}
              alt="liteLoginIcon7"
              width={45}
              height={45}
              loading="lazy"
              className="liteLoginIcon7"
            />
          </section>
        </div>
      </section>
      <section className="relative mb-[5.89rem] ml-0 mr-0 mt-[2.5rem] max-w-[30rem] space-y-6 px-[2rem]">
        <div className="relative">
          <input
            onChange={handlePhoneNumberChange}
            type="text"
            value={phoneNumber}
            maxLength={10}
            minLength={10}
            id="floating_outlined3"
            className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black dark:text-base-100 focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_outlined3"
            className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-base text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
          >
            Your Phone Number
          </label>
        </div>
        <div className="relative">
          <input
            onChange={handlePasswordChange}
            hidden
            type="password"
            id="floating_outlined4"
            className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black dark:text-base-100 focus:border-primary peer rounded-xl focus:outline-none dark:border-gray-600"
            placeholder=" "
            maxLength={4}
            minLength={4}
            required
          />
          <label
            htmlFor="floating_outlined4"
            className="bg-base-100 peer-focus:text-primary peer-focus:dark:text-primary absolute left-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform px-2 text-base text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 dark:bg-gray-900 dark:text-gray-400"
          >
            Your Password
          </label>
        </div>
      </section>
      <article className="flex justify-center mb-5">
        <button
          type="button"
          onClick={handleLogin}
          className="on_active_bounce fixed bottom-6 z-50 w-[92%] md:w-full max-w-[25rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem] text-white"
        >
          Get Started
        </button>
      </article>
    </center>
  );
};

const Login = memo(LoginMemo);
export default Login;
