import HipalLogo from "@/assets/hipal.png";
import Hipal from "../../components/templates/loginPage/hipal";
import Login from "../../components/templates/loginPage/login";
import ForgotPassword from "../../components/templates/loginPage/forgotPassword";
import useLoginStore from "@/components/store/useLogin";
import "./login.css";

const SectionWithLogo = ({
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
		</>
	);
};

export default LoginForm;
