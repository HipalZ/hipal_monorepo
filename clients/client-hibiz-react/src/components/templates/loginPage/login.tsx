import { memo, startTransition, useCallback, useState } from "react";
import Hand from "@/assets/login/hand.png";
import { PiSealWarningBold } from "react-icons/pi";
import useLoginStore from "@/components/store/useLogin";
import { useNavigate } from "react-router-dom";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { cn } from "@/components/utils/helper";
import toast from "react-hot-toast";
import { useUserToken } from "@hi/common/src/useUserToken";
import { apiRpc } from "@hi/common";
import type { ILoginProps } from "@/components/types/businessData";

const Login: React.FC = () => {
  const { phone, setPhone, step, setStep } = useLoginStore((state) => ({
    phone: state.phone,
    setPhone: state.setPhone,
    step: state.step,
    setStep: state.setStep,
  }));
  const { setUser } = useOwnerLogin((state) => ({
    setUser: state.setUser,
  }));
  const setAccessToken = useUserToken.getState().setAccessToken;
  const setRefreshToken = useUserToken.getState().setRefreshToken;

  const [password, setPassword] = useState("");
  const [validPhone, setValidPhone] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  const navigate = useNavigate();

  const validPhoneNumber = useCallback(() => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }, [phone]);

  const handleSubmit = async () => {
    const isPhoneValid = validPhoneNumber();

    if (!isPhoneValid) {
      setValidPhone(isPhoneValid);
      return;
    }
    if (password === "") {
      setValidPassword(false);
      return;
    }

    const response = await apiRpc.users.ownerSignIn.$post({
      query: {
        verifyOtp: "false",
      },
      json: {
        phone: phone,
        password: password,
      },
    });
    const user = (await response.json()) as unknown as {
      data: ILoginProps;
      message: string;
    };

    if (
      response.status === 409 ||
      response.status === 400 ||
      response.status === 401
    ) {
      toast.error(user?.message || "Check credentials");
      return;
    }
    if (response.status === 200) {
      console.log("user", user);
      setAccessToken(user.data.accessToken);
      setRefreshToken(user.data.refreshToken);
      setUser(user.data.user);
      toast.success("Login Successfully");

      window.location.href = "/app/business";
    }
  };

  const sendOtp = useCallback(() => {
    setStep(step + 1);
  }, [step]);

  const goToSignUp = useCallback(() => {
    startTransition(() => {
      navigate("/signup");
    });
  }, [navigate]);

  return (
    <>
      <img
        className="absolute left-0 right-0 m-auto -top-[6.5rem]"
        width={63}
        height={73}
        src={Hand}
        alt="Hipal_hand"
      />
      <h5>
        New User?{" "}
        <button
          type="button"
          onClick={goToSignUp}
          className="text-[#1C4EFF] text-sm font-semibold cursor-pointer"
        >
          Create Account
        </button>
      </h5>
      <h3 className="mt-4 text-xl font-semibold leading-8">
        Hi Pal, Let’s get started
      </h3>
      <p>Grow your restaurant! 🍽️</p>
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
        <div>
          {!validPassword && (
            <small className="flex items-center text-[#F2634C]">
              <PiSealWarningBold />
              &nbsp; Incorrect Password
            </small>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent",
              validPassword
                ? "border-black focus:ring-black"
                : "border-red-500 focus:ring-red-500",
            )}
            placeholder="Password"
            required
          />
        </div>
      </section>
      <button type="button" className="action_btn" onClick={handleSubmit}>
        Enter In
      </button>
      <center className="mt-4">
        Forgot Password?{" "}
        <button onClick={sendOtp} type="button" className="text-[#1C4EFF]">
          Set OTP
        </button>
      </center>
    </>
  );
};

const MemoizedLogin = memo(Login);

export default MemoizedLogin;
