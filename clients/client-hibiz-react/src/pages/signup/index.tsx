import Hipal from "../../components/templates/signupPage/hipal";
import SignUpPage from "../../components/templates/signupPage/signUp";
import Otp from "../../components/templates/signupPage/otp";
import useLoginStore from "@/components/store/useLogin";
import Password from "../../components/templates/signupPage/password";
import Congratulation from "../../components/templates/signupPage/congratulation";
import SectionWithLogo from "@/components/atom/sectionWithLogo";
import { memo } from "react";

const SignUp = () => {
  const step = useLoginStore((s) => s.step);

  return (
    <>
      {step === 1 && <Hipal />}

      {step === 2 && (
        <SectionWithLogo>
          <SignUpPage />
        </SectionWithLogo>
      )}

      {step === 3 && (
        <SectionWithLogo>
          <Otp />
        </SectionWithLogo>
      )}

      {step === 4 && (
        <SectionWithLogo>
          <Password />
        </SectionWithLogo>
      )}

      {step === 5 && (
        <SectionWithLogo>
          <Congratulation />
        </SectionWithLogo>
      )}
    </>
  );
};

const MemoSignUp = memo(SignUp);

export default MemoSignUp;
