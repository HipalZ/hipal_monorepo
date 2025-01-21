import { memo } from 'react'
import Hi_Coin from "@/assets/hi-coin.svg";
import CoinsAnimation from "@/components/atoms/coinAnimation";
import NumberAnimation from "@/components/atoms/coinsScroll";
import Sunlight from "@/assets/Ellipse 1-min.png";
import Image from 'next/image';
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from '@/components/store/useLogin';


const MemoSignUpBonus = ({ goNext }: {
  goNext: () => void
}) => {
  const coinZ = useLogin((s) => s.userCoinZ)
  return (
    <section
      id="my_modal_1"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <section className="absolute inset-0 flex items-center justify-center">
        <center className="absolute w-[900px] animate-glow">
          <Image
            className="animate-spin"
            width={1080}
            height={1080}
            src={Sunlight}
            alt="Sunlight"
          />
        </center>
      </section>
      <section className="absolute inset-0 flex items-center justify-center">
        <section className="absolute rotate-[-30deg] left-6 top-[12vh]">
          <Image
            className="zoomIn"
            width={76}
            height={76}
            src={Hi_Coin}
            alt="Hi Coin"
          />
        </section>
        <section className="absolute rotate-45 right-6 top-[20vh] z-20">
          <Image
            className="zoomIn"
            width={76}
            height={76}
            src={Hi_Coin}
            alt="Hi Coin"
          />
        </section>
      </section>

      <section
        id="shine-card"
        className="relative mt-[5rem] p-6 bg-[#F8D76E] rounded-2xl shadow-lg mx-auto w-[80%] max-w-[26rem] z-10 zoomIn overflow-hidden"
      >
        <div className="shine-effect" />
        <center>
          <CoinsAnimation />
        </center>
        <center className="text-xl font-bold uppercase text-[#8D0F16] mt-6">
          Congratulations!!
        </center>
        <center className="text-lg font-medium uppercase text-[#8D0F16] mt-2">
          you got
        </center>
        <div className="loyalty_card_gradient" />
        <div className="loyalty_card_gradient2" />
        {coinZ > 0 && <NumberAnimation number={coinZ} />}
        <center className="text-xl font-medium uppercase text-[#8D0F16]">
          CoinZ
        </center>
        <button
          type="button"
          className="relative z-20 w-full px-4 py-2 mt-6 text-white bg-[#015845] transition-all duration-300 rounded-full shadow-lg"
          onClick={goNext}
        >
          Explore
        </button>
      </section>
    </section>
  )
}

const SignUpBonus = memo(MemoSignUpBonus)

export default SignUpBonus