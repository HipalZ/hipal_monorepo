import HipalLogo from "@/assets/hipal.png";
import Background from "@/assets/login/background.png";
import useLoginStore from "@/components/store/useLogin";
import { memo, useCallback } from "react";
import { LuMoveRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const MemoHipal = () => {
  const { setStep, step } = useLoginStore((state) => ({
    setStep: state.setStep,
    step: state.step,
  }));
  const navigate = useNavigate();

  const createAccount = useCallback(() => {
    navigate("/signup");
    setStep(2);
  }, [step]);
  return (
    <main>
      <center className="pt-6">
        <img className="hipalz_logo" src={HipalLogo} alt="Hipal Logo" />
      </center>
      <section
        className="mx-auto mt-4"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          width: "90%",
          maxWidth: "30rem",
          height: "70vh",
          borderRadius: "2rem",
          backgroundSize: "cover",
        }}
      >
        <article className="pt-12 pl-4">
          <h3 className="text-xl font-semibold leading-10">
            Grow your restaurant
          </h3>
          <p className="mb-4">Hi Pal, Let’s get started Growing our Biz !</p>
          <button
            onClick={createAccount}
            type="button"
            className="px-4 text-sm py-2 bg-[#1C4EFF] text-white rounded-3xl"
          >
            Create account
          </button>
        </article>
      </section>

      <button onClick={() => setStep(2)} type="button" className="bottom_btn">
        <div className="flex items-center justify-between px-4">
          <span>Get Started</span>
          <LuMoveRight size={24} />
        </div>
      </button>
    </main>
  );
};

const Hipal = memo(MemoHipal);

export default Hipal;
