import Hand from "@/assets/login/hand.png";
import useLoginStore from "@/components/store/useLogin";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import { startTransition, useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const Otp = ({ login }: { login?: boolean }) => {
  const { step, setStep, phone, name } = useLoginStore((state) => ({
    step: state.step,
    setStep: state.setStep,
    phone: state.phone,
    name: state.name,
  }));
  const navigate = useNavigate();
  const { setIsLogin, setUser } = useOwnerLogin((state) => ({
    setIsLogin: state.setIsLogin,
    setUser: state.setUser,
  }));
  const setAccessToken = useUserToken.getState().setAccessToken;
  const setRefreshToken = useUserToken.getState().setRefreshToken;

  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const handleSubmit = useCallback(async () => {
    const endpoint = login
      ? apiRpc.users.ownerSignIn
      : apiRpc.users.ownerSignUp;

    const res = await endpoint.$post({
      json: {
        name: name,
        phone: phone,
        otp: otp.join(""),
      },
      query: {
        verifyOtp: "true",
      },
    });

    const response = await res.json();
    if (res.status === 409 || res.status === 400 || res.status === 401) {
      toast.error("Please try again");
      return;
    }

    if (res.status === 200) {
      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      toast.success("Login Successfully");
      setIsLogin(true);

      if (login) {
        startTransition(() => {
          navigate("/app/business");
        });
        return;
      }

      setStep(step + 1);
    }
  }, [step, name, phone, otp]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const newValue = e.target.value;
    if (/^[0-9]$/.test(newValue) || newValue === "") {
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);

      if (newValue !== "" && index < inputRefs.length - 1) {
        inputRefs[index + 1].current?.focus();
      }
      if (newOtp.length === 4) {
        console.log("hey", newOtp.length);
      }
    }
  };

  const resendOtp = async () => {
    const res = await apiRpc.users.resendOtp.$post({
      json: {
        phone: phone,
      },
    });
    if (res.status === 200 || res.status === 201) {
      toast.success("otp send successfully");
    }
  };

  const goBack = useCallback(() => {
    setStep(step - 1);
  }, [step]);

  return (
    <>
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
      <section className="mt-4">
        <small>
          <span className="opacity-40">OTP sent to +91</span>{" "}
          <span className="text-[#1C4EFF]">{phone}</span>
        </small>
        <div className="flex mt-4 space-x-2">
          {inputRefs.map((ref, index) => (
            <input
              key={index}
              ref={ref}
              type="text"
              value={otp[index]}
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
      <center className="mt-4 -mb-2">
        <button onClick={resendOtp} type="button" className="text-[#1C4EFF]">
          Resend OTP
        </button>
      </center>
    </>
  );
};

export default Otp;
