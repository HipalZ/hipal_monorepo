import { memo, startTransition, useCallback, useState } from "react";
import Hand from "@/assets/login/hand.png";
import { PiSealWarningBold } from "react-icons/pi";
import useLoginStore from "@/components/store/useLogin";
import { useNavigate } from "react-router-dom";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { cn } from "@/components/utils/helper";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { useUserToken } from "@/components/store/useUserToken";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";

const Login: React.FC = () => {
  const { phone, setPhone } = useLoginStore((state) => ({ phone: state.phone, setPhone: state.setPhone }));
  const { setIsLogin, setUser } = useOwnerLogin((state) => ({ setIsLogin: state.setIsLogin, setUser: state.setUser }));
  const { setAccessToken, setRefreshToken } = useUserToken((state) => ({
    setAccessToken: state.setAccessToken,
    setRefreshToken: state.setRefreshToken,
  }));

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
    try {
      const response = await apiRpc.users.Owner.Login.$post({
        json: {
          phone: phone,
          password: password,
        },
      });

      const user = await response.json();
      
      if (response.status === 200) {
        setAccessToken(user.data.accessToken);
        setRefreshToken(user.data.refreshToken);
        setUser(user.data.existingUser);
        toast.success("Login Successfully");
        setIsLogin(true);
        startTransition(() => {
          navigate(routePaths[PAGE_TYPES.BUSINESS]());
        });
      }
    } catch (err) {
      setValidPassword(false);
      toast.error("Phone or Password invalid...!");
    }
  };

  const goToSignUp = useCallback(() => {
    startTransition(() => {
      navigate("/signup");
    });
  }, [navigate]);

  return (
    <>
      <img className="absolute left-0 right-0 m-auto -top-[6.5rem]" width={63} height={73} src={Hand} alt="Hipal_hand" />
      <h5>
        New User?{" "}
        <span onClick={goToSignUp} className="text-[#1C4EFF] text-sm font-semibold cursor-pointer">
          Create Account
        </span>
      </h5>
      <h3 className="mt-4 text-xl font-semibold leading-8">Hi Pal, Let’s get started</h3>
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
              validPhone ? "border-black focus:ring-black" : "border-red-500 focus:ring-red-500",
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
              validPassword ? "border-black focus:ring-black" : "border-red-500 focus:ring-red-500",
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
        Forgot Password? <span className="text-[#1C4EFF]">Set OTP</span>
      </center>
    </>
  );
};

const MemoizedLogin = memo(Login);

export default MemoizedLogin;
