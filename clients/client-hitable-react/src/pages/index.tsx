import liteLoginIcon1 from '@/assets/img/liteLoginIcon1.png'
import liteLoginIcon2 from '@/assets/img/liteLoginIcon2.png'
import liteLoginIcon3 from '@/assets/img/liteLoginIcon3.png'
import liteLoginIcon4 from '@/assets/img/liteLoginIcon4.png'
import liteLoginIcon5 from '@/assets/img/liteLoginIcon5.png'
import liteLoginIcon6 from '@/assets/img/liteLoginIcon6.png'
import liteLoginIcon7 from '@/assets/img/liteLoginIcon7.png'
import '@/pages/l/[businessId]/login/login.css'
import { memo } from 'react'

const Login = memo(() => {

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
      <div className="text-2xl">Welcome to HipalZ</div>
      &nbsp;
      <center className="text-base">Approach us for your business url</center>
    </center>
  )
});

export default Login