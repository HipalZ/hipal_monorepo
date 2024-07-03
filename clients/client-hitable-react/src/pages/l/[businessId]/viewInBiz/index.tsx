import dummyLogo from '@/assets/img/dummyLogo.png';
import logo from '@/assets/img/Hilogo.png';
// import HiClientZAnimation from '@/components/atoms/hiClientzAnimation';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewInBiz = () => {
  const { selectedBiz, captainData } = useHiClientZ();
  const businessId = selectedBiz?.businessId?._id;
  const navigate = useNavigate();
  const navigateToBiz = () => {
    startTransition(() => {
      navigate(`/l/${businessId}/alerts`);
    });
  };

  return (
    <>
      {/* <HiClientZAnimation/> */}
      <main className="relative flex h-screen flex-col">
        <article className="absolute left-1/2 my-10 flex -translate-x-1/2 -translate-y-1/2 transform justify-center">
          <img src={logo} alt="a" width={32} height={20} />
          &nbsp;
          <h1 className="text-3xl font-semibold" style={{ color: '#250149' }}>
            <span style={{ color: '#f2634c' }}>Hi</span>ClientZ
          </h1>
        </article>
        <article
          className="absolute left-1/2 top-1/2 m-auto flex min-w-[10rem] 
      max-w-[10rem] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center"
        >
          <span className="wave-hand text-[2rem]">👋</span>
          <h1 className="text-3xl font-semibold">{captainData?.name}</h1>
          &nbsp;
          <img className="border-1 rounded-full border border-black" src={selectedBiz?.businessId?.logo} alt="logo" width={125} height={125} />
          <h6 className="mb-2 mt-4 text-xl font-semibold">{selectedBiz?.businessId?.businessName}</h6>
          <p className="w-[18rem] text-center">{selectedBiz?.businessId?.address}</p>
        </article>
        <div className="mb-5 flex justify-center">
          <button
            onClick={navigateToBiz}
            className="on_active_bounce text-base-100 fixed bottom-6 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem]"
          >
            Enter
          </button>
        </div>
      </main>
    </>
  );
};

export default ViewInBiz;
