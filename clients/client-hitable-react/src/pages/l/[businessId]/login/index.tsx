import { startTransition, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from "react-router-dom";
import liteLoginIcon1 from '@/assets/img/liteLoginIcon1.png'
import liteLoginIcon2 from '@/assets/img/liteLoginIcon2.png'
import liteLoginIcon3 from '@/assets/img/liteLoginIcon3.png'
import liteLoginIcon4 from '@/assets/img/liteLoginIcon4.png'
import liteLoginIcon5 from '@/assets/img/liteLoginIcon5.png'
import liteLoginIcon6 from '@/assets/img/liteLoginIcon6.png'
import liteLoginIcon7 from '@/assets/img/liteLoginIcon7.png'
import axios from '@/components/utils/axios'
import { useHiClientZ } from '@/components/store/useHiClientzData'
import { toast } from 'react-toastify'
import './login.css'
import { useLiteStore } from '@/components/store/useLiteStore';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const {setLoading} = useLiteStore()
  // store
  const { setCaptainData, setAccessToken, setRefreshToken } = useHiClientZ()
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

  //methods
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  //apis 
  const handleLogin = async () => {
    setLoading(true)
    try {
      const config = {
        method: "POST",
        url: "/v1/users/:id/stafflogin",
        data: {
          phone: phoneNumber,
          password: password,
        },
      };
      const response = await axios(config);
      if(response.status===200){
        setCaptainData(response.data.data.user);
        setAccessToken(response.data.data.accessToken);
        setRefreshToken(response.data.data.refreshToken);
        toast.success(`Hi ${response.data.data.user.name}! Welcome to HiClientZ`)
        startTransition(() => {
          navigate(`/l/${businessId}/businesses`)
        })
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <center>
      <section className="relative max-w-[30rem]">
        <div className="mobileGrad h-[28rem] mx-[4rem] mt-[4rem] flex justify-center border-1">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl mt-[2rem] font-bold">HiClientZ</h1>
          </div>
        </div>
        <div className="absolute top-1/2 flex justify-between mx-8">
          <section>
            <img src={liteLoginIcon1} alt="liteLoginIcon1" width={55} height={55} loading="lazy" className="liteLoginIcon1" />
          </section>
          <section className="-mt-5">
            <img src={liteLoginIcon2} alt="liteLoginIcon2" width={38} height={38} loading="lazy" className="liteLoginIcon2" />
          </section>
          <section className="mt-5 w-10">
            <img src={liteLoginIcon3} alt="liteLoginIcon3" width={43} height={43} loading="lazy" className="liteLoginIcon3" />
          </section>
          <section className="mx-4">
            <img src={liteLoginIcon4} alt="liteLoginIcon4" width={98} height={98} loading="lazy" className="liteLoginIcon4" />
          </section>
          <section className="-mt-10">
            <img src={liteLoginIcon5} alt="liteLoginIcon5" width={57} height={57} loading="lazy" className="liteLoginIcon5" />
          </section>
          <section className="mt-10">
            <img src={liteLoginIcon6} alt="liteLoginIcon6" width={43} height={43} loading="lazy" className="liteLoginIcon6" />
          </section>
          <section>
            <img src={liteLoginIcon7} alt="liteLoginIcon7" width={45} height={45} loading="lazy" className="liteLoginIcon7" />
          </section>
        </div>
      </section>
      <section className="relative max-w-[30rem] px-[2rem] mt-[2.5rem] mb-[5.89rem] ml-0 mr-0 space-y-6">
        <div className="relative">
          <input
            onChange={handlePhoneNumberChange}
            type="text"
            value={phoneNumber}
            maxLength={10}
            minLength={10}
            id="floating_outlined3"
            className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black rounded-xl dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
            placeholder=" "
            required
          />
          <label
            htmlFor="floating_outlined3"
            className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            Your Phone Number
					</label>
        </div>
        <div className="relative">
          <input
            onChange={handlePasswordChange}
            type="password"
            id="floating_outlined4"
            className="block w-full pt-3 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-black rounded-xl dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
            placeholder=" "
            maxLength={4}
            minLength={4}
            required
          />
          <label
            htmlFor="floating_outlined4"
            className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            Your Password
					</label>
        </div>
      </section>
      <article className="flex justify-center mb-5">
        <button
          onClick={handleLogin}
          className="on_active_bounce fixed bottom-6 z-50 bg-black rounded-full w-[20.5rem] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
        >
          Get Started
				</button>
      </article>
    </center>
  )
};

export default Login