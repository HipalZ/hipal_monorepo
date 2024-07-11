import Hipal from "../../components/templates/loginPage/hipal";
import Login from "../../components/templates/loginPage/login";
import ForgotPassword from "../../components/templates/loginPage/forgotPassword";
import useLoginStore from "@/components/store/useLogin";
import SectionWithLogo from "@/components/atom/sectionWithLogo"
import { memo } from "react";
import Otp from "@/components/templates/signupPage/otp";

const LoginForm = () => {
  const { step } = useLoginStore();

  return (
    <>
      {step === 1 && <Hipal />}
      {step === 2 && (
        <SectionWithLogo>
          <Login />
        </SectionWithLogo>
      )}
      {step === 3 && (
        <SectionWithLogo>
          <ForgotPassword />
        </SectionWithLogo>
      )}
      {
        step === 4 && (
          <SectionWithLogo>
             <Otp login />
          </SectionWithLogo>
        )
      }
    </>
  );
};
const MemoLoginForm = memo(LoginForm);
export default MemoLoginForm;
