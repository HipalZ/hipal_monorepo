import { useState, useEffect } from "react";
import hipalLogo from "@/assets/img/liteLoginIcon4.png";
import logo from "@/assets/img/Hilogo.png";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { memo, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import HiAnimation from "@/components/atoms/hiClientzAnimation";

const ViewInBizMemo = () => {
  const { selectedBiz, captainData } = useHiClientZ((s) => ({
    selectedBiz: s.selectedBiz,
    captainData: s.captainData,
  }));
  console.log("selectedBiz", selectedBiz);
  const businessId = selectedBiz?.businessId?._id;
  const navigate = useNavigate();
  const [showMainComponent, setShowMainComponent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainComponent(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const navigateToBiz = () => {
    startTransition(() => {
      navigate(`/${businessId}/alerts`);
    });
  };

  return (
    <main className="relative flex flex-col h-screen">
      <article className="absolute flex justify-center my-10 transform -translate-x-1/2 -translate-y-1/2 left-1/2">
        <img src={logo} alt="a" width={32} height={20} />
        &nbsp;
        <h1 className="text-3xl font-semibold" style={{ color: "#250149" }}>
          <span style={{ color: "#f2634c" }}>Hi</span>ClientZ
        </h1>
      </article>
      {!showMainComponent ? (
        <HiAnimation />
      ) : (
        <article
          className="absolute left-1/2 top-1/2 m-auto flex min-w-[10rem] 
      max-w-[10rem] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center"
        >
          <span className="wave-hand text-[2rem]">👋</span>
          <h1 className="text-3xl font-semibold">{captainData?.name}</h1>
          &nbsp;
          <img
            className="border border-black rounded-full border-1"
            src={selectedBiz?.businessId?.logo || hipalLogo}
            alt="logo"
            width={125}
            height={125}
          />
          <h6 className="mt-4 mb-2 text-xl font-semibold">
            {selectedBiz?.businessId?.businessName}
          </h6>
          <p className="w-[18rem] text-center">
            {selectedBiz?.businessId?.address}
          </p>
        </article>
      )}
      {showMainComponent && (
        <div className="flex justify-center mb-5">
          <button
            type="button"
            onClick={navigateToBiz}
            className="on_active_bounce text-white fixed bottom-6 z-50 w-[20.5rem] rounded-full bg-black py-[0.75rem] text-[18px] leading-[1.15rem]"
          >
            Enter
          </button>
        </div>
      )}
    </main>
  );
};

const ViewInBiz = memo(ViewInBizMemo);
export default ViewInBiz;
