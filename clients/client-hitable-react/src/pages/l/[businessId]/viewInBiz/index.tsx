import logo from '@/assets/img/Hilogo.png'
import dummyLogo from '@/assets/img/dummyLogo.png'
import HiClientZAnimation from '@/components/atoms/hiClientzAnimation';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewInBiz = () => {
  const {selectedBiz, captainData} = useHiClientZ();
  const businessId = selectedBiz?.businessId?._id
  const navigate = useNavigate();
  const navigateToBiz = () => {
    startTransition(()=>{
      navigate(`/l/${businessId}/alerts`)
    })
  }
  return (
    <>
    {/* <HiClientZAnimation/> */}
    <main className="h-screen flex flex-col relative">
      <article className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center my-10">
        <img src={logo} alt="a" width={32} height={20} />
      &nbsp;
      <h1 className="text-3xl font-semibold" style={{ color: '#250149' }}>
          <span style={{ color: '#f2634c' }}>Hi</span>ClientZ
      </h1>
      </article>
      <article className="max-w-[10rem] left-1/2 top-1/2 absolute transform -translate-x-1/2 
      -translate-y-1/2 flex flex-col items-center m-auto min-w-[10rem]">
        <span className="text-[2rem] wave-hand">👋</span>
        <h1 className="text-3xl font-semibold">{captainData?.name}</h1>
        &nbsp;
        <img className="border border-1 border-black rounded-full" src={dummyLogo} alt="logo" width={125} height={125} />
        <h6 className="text-xl mt-4 mb-2 font-semibold">{selectedBiz?.businessId?.businessName}</h6>
        <p className="w-full text-center">{selectedBiz?.businessId?.address}</p>
      </article>
      <div className="flex justify-center mb-5">
        <button
          onClick={navigateToBiz}
          className="on_active_bounce fixed bottom-6 z-50 bg-black rounded-full w-[20.5rem] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
        >
          Enter
				</button>
      </div>
    </main>
    </>
  )
};

export default ViewInBiz;