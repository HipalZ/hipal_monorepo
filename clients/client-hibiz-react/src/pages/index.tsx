import SectionWithLogo from "@/components/atom/sectionWithLogo";
import useLoginStore from "@/components/store/useLogin";
import Congratulation from "@/components/templates/signupPage/congratulation";
import Hipal from "@/components/templates/signupPage/hipal";
import Otp from "@/components/templates/signupPage/otp";
import Password from "@/components/templates/signupPage/password";
import SignUpPage from "@/components/templates/signupPage/signUp";

// Lazy load the components

const Home: React.FC = () => {
  const { step } = useLoginStore();

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

export default Home;
