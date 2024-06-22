import Header from "@/components/molecules/header";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { routeToDashboard } from "@/components/utils/routes";
import { startTransition, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";
import { FaArrowLeft } from "react-icons/fa";
import BusinessType from "./businessType";
import OutletType from "./outletTypeForm";
import AddName from "./addName";
import Congratulation from "@/pages/signup/congratulation";
import { SectionWithLogo } from "@/pages/signup";
import "./add.css"


const AddBusinessForm = () => {
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
	console.log(step);
	const handleTitle = useCallback(() => {
		const titles = ["Business Type", "Outlet Type", "outlet Name"];
		return titles[step] || "";
	}, [step]);
	const subHeading = useCallback(() => {
		const titles = [
			"What is your business type",
			"Choose the outlet type ",
			"Choose the outlet name ",
		];
		return titles[step] || "";
	}, [step]);
	return (
		<main>

			{
				step !== 3 && (
					<>

						<div className="pb-6 linear_gradient_background">
							<Header
								title={handleTitle()}
								onBack={handleBack}
								leftIcon={<FaArrowLeft />}
								centerImage={Hi}
								rightImage={Hi}
								isIconBusinessShow={false}
							/></div>

						<header className="flex items-center justify-between p-4 ">
							<h3 className="text-xl font-semibold">{subHeading()}</h3>
							<h3 className="text-xl font-semibold">{step + 1} / 3</h3>
						</header></>
				)
			}

			{step === 0 && <BusinessType />}

			{step === 1 && <OutletType />}

			{step === 2 && <AddName />}

			{
				step === 3 && <SectionWithLogo>
					<Congratulation />
				</SectionWithLogo>
			}
		</main>
	);
};

export default AddBusinessForm;
