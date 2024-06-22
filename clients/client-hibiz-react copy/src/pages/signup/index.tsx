import HipalLogo from "@/assets/hipal.png";
import Hipal from "./hipal";
import SignUpPage from "./signUp";
import Otp from "./otp";
import useLoginStore from "@/components/store/useLogin";
import Password from "./password";
import "./signUp.css";
import Congratulation from "./congratulation";

export const SectionWithLogo = ({
	children,
}: { children: React.ReactNode }): JSX.Element => {
	return (
		<section className="gradient">
			<article className="mid_section">{children}</article>
			<center className="absolute left-0 right-0 m-auto bottom-4">
				<img width={131} height={41} src={HipalLogo} alt="Hipal Logo" />
			</center>
		</section>
	);
};

const SignUp = () => {
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
				<Congratulation/>
				</SectionWithLogo>
			)}
		</>
	);
};

export default SignUp;
