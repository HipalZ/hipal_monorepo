import React, { startTransition, useCallback, lazy, Suspense, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import useBusinessCtrl from '@/components/store/useBusinessCtrl';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Header from '@/components/molecules/header';
import { routeToDashboard } from '@/components/utils/routes';
import Hi from '@/assets/svg/hi.svg';
import './businessControl.css';

// Lazy load the components
const ExplorePage = lazy(() => import('@/components/templates/businessForm/explorePage'));
const MenuPage = lazy(() => import('@/components/templates/businessForm/menu'));
const Congratulation = lazy(() => import('@/components/templates/signupPage/congratulation'));
const SectionWithLogo = lazy(() => import('@/pages/signup').then(module => ({ default: module.SectionWithLogo })));
const BusinessControl = lazy(() => import('@/components/templates/businessForm/businessControl'));
const Setting = lazy(() => import('@/components/templates/businessForm/setting'));

const MainBusinessPage: React.FC = () => {
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
						isIconBusinessShow={true}
					/>
				</div>
			)}
			<Suspense fallback={<div><LoadingSpinner /></div>}>
				{step === 0 && <BusinessControl />}
				{step === 1 && <ExplorePage />}
				{step === 2 && <MenuPage />}
				{step === 3 && <Setting />}
				{step === 4 && (
					<SectionWithLogo>
						<Congratulation />
					</SectionWithLogo>
				)}
			</Suspense>
		</main>
	);
};

export default memo(MainBusinessPage);
