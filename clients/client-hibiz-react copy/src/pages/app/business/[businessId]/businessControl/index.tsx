import Header from "@/components/molecules/header";
import { routeToDashboard } from "@/components/utils/routes";
import { startTransition, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import BusinessControl from "./businessControl";
import ExplorePage from "./explorePage";
import MenuPage from "./menu";
import Setting from "./setting";
import Congratulation from "@/pages/signup/congratulation";
import { SectionWithLogo } from "@/pages/signup";
import "./businessControl.css";

const MainBusinessPage = () => {
	const navigate = useNavigate();
	const { businessId } = useParams<{ businessId: string }>();
	const { step, setStep } = useBusinessCtrl();

	const handleBack = useCallback(() => {
		if (step === 0) {
			startTransition(() => {
				navigate(routeToDashboard(businessId as string));
			});
		} else {
			setStep(step - 1);
		}
	}, [navigate, businessId, step, setStep]);

	const handleTitle = useCallback(() => {
		const titles = ["Business Control", "Explore Page", "Menu Page", "Themes"];
		return titles[step] || "";
	}, [step]);

	return (
		<main className="business_control_background">
			{step === 4 ? null : (
				<div className="pb-6 linear_gradient_background">
					<Header
						title={handleTitle()}
						onBack={handleBack}
						leftIcon={<FaArrowLeft />}
						centerImage={Hi}
						rightImage={Hi}
						isIconBusinessShow={false}
					/>
				</div>
			)}
			{step === 0 && <BusinessControl />}

			{step === 1 && <ExplorePage />}

			{step === 2 && <MenuPage />}

			{step === 3 && <Setting />}

			{step === 4 && (
				<SectionWithLogo>
					<Congratulation />
				</SectionWithLogo>
			)}
		</main>
	);
};

export default MainBusinessPage;
