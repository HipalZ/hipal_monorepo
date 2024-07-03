import Hand from "@/assets/login/hand.png";
import useLoginStore from "@/components/store/useLogin";
import { useRef, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";

const Otp = () => {
  const { step, setStep, phone } = useLoginStore((state) => ({
    step: state.step,
    setStep: state.setStep,
    phone: state.phone,
  }));

  const [otp, setOtp] = useState("");

  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleSubmit = () => {
    setStep(step + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    if (/^[0-9]$/.test(newValue) || newValue === "") {
      const newOtp = otp.split("");
      newOtp[index] = newValue;
      setOtp(newOtp.join(""));
      if (newValue !== "" && index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const goBack = () => {
    setStep(step - 1);
  };

  return (
    <>
      {" "}
      <img className="absolute left-0 right-0 m-auto -top-[6.5rem]" width={63} height={73} src={Hand} alt="Hipal_hand" />
      <h3 onClick={goBack} className="flex items-center font-semibold leading-8 text-[#1C4EFF]">
        <LuArrowLeft size={16} />
        &nbsp; Back
      </h3>
      <h3 className="mt-2 text-xl font-semibold leading-8">Forgot your Password</h3>
      <h3 className="flex leading-8">No worriez !</h3>
      <section className="mt-4">
        <small>
          <span className="opacity-40">OTP send to +91</span> <span className="text-[#1C4EFF]">{phone}</span>
        </small>
        <div className="flex mt-4 space-x-2">
          {inputRefs.map((ref, index) => (
            <input
              key={crypto.randomUUID()}
              ref={ref}
              type="text"
              value={otp[index] || ""}
              onChange={(e) => handleChange(e, index)}
              className="w-12 px-4 py-3 text-center border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              maxLength={1}
            />
          ))}
        </div>
      </section>
      <button type="button" className="action_btn" onClick={handleSubmit}>
        Verify
      </button>
      <center className="mt-2">
        <small className="text-[#1C4EFF]">Resend OTP</small>
      </center>
    </>
  );
};

export default Otp;
