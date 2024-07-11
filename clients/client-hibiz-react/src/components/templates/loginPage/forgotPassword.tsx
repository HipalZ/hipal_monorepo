import Hand from "@/assets/login/hand.png";
import useLoginStore from "@/components/store/useLogin";
import { cn } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { memo, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { LuArrowLeft } from "react-icons/lu";
import { PiSealWarningBold } from "react-icons/pi";

const ForgotPassword = () => {
  const { setStep, phone, step, setPhone } = useLoginStore((state) => ({
    setStep: state.setStep,
    phone: state.phone,
    step: state.step,
    setPhone: state.setPhone,
  }));
  const [validPhone, setValidPhone] = useState(true);
  const validPhoneNumber = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    const isPhoneValid = validPhoneNumber();

    setValidPhone(isPhoneValid);

    if (!isPhoneValid) return toast.error("Please Enter Valid Number");

    const res = await apiRpc.users.resendOtp.$post({
      json: {
        phone: phone,
      },
    });
    if (res.status === 200 || res.status === 201) {
      setStep(step + 1);
    }
  };

  const goBack = useCallback(() => {
    setStep(step - 1);
  }, [step]);

  return (
    <>
      {" "}
      <img
        className="absolute left-0 right-0 m-auto -top-[6.5rem]"
        width={63}
        height={73}
        src={Hand}
        alt="Hipal_hand"
      />
      <button
        type="button"
        onClick={goBack}
        className="flex items-center font-semibold leading-8 text-[#1C4EFF]"
      >
        <LuArrowLeft size={16} />
        &nbsp; Back
      </button>
      <h3 className="mt-2 text-xl font-semibold leading-8">
        Forgot your Password
      </h3>
      <h3 className="flex leading-8">No worriez !</h3>
 
        <section className="mt-6 space-y-6">
          <div>
            {!validPhone && (
              <small className="flex items-center text-[#F2634C]">
                <PiSealWarningBold />
                &nbsp; Enter a valid number
              </small>
            )}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(
                "w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent",
                validPhone
                  ? "border-black focus:ring-black"
                  : "border-red-500 focus:ring-red-500",
              )}
              placeholder="Enter phone number"
              maxLength={10}
              required
            />
          </div>
        </section>
      <button type="button" className="action_btn" onClick={handleSubmit}>
        Send Otp
      </button>
    </>
  );
};
const MemoForgotPassword = memo(ForgotPassword);
export default MemoForgotPassword;
