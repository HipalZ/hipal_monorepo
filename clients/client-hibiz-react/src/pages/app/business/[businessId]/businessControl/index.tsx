import { startTransition, useCallback, lazy, memo } from 'react';
import { useNavigate} from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import useBusinessCtrl from '@/components/store/useBusinessCtrl';
import Header from '@/components/molecules/header';
import SectionWithLogo from "@/components/atom/sectionWithLogo"
import Hi from '@/assets/svg/hi.svg';
import useBusinessData from '@/components/store/useBusinessData';

// Lazy load the components
const ExplorePage = lazy(() => import('@/components/templates/businessForm/explorePage'));
const MenuPage = lazy(() => import('@/components/templates/businessForm/menu'));
const Congratulation = lazy(() => import('@/components/templates/signupPage/congratulation'));
const BusinessControl = lazy(() => import('@/components/templates/businessForm/businessControl'));
const Setting = lazy(() => import('@/components/templates/businessForm/setting'));

const MainBusinessPage: React.FC = () => {
	const navigate = useNavigate();
	const { step, setStep } = useBusinessCtrl();
	const businessId = useBusinessData((s) => s.businessData?._id);

	const handleBack = useCallback(() => {
		if (step === 0) {
			startTransition(() => {
				navigate(`/app/business/${businessId}`);
			});
		} else {
			setStep(step - 1);
		}
	}, [ businessId, step]);

	const handleTitle = useCallback(() => {
		const titles = ["Business Control", "Explore Page", "Menu Page", "Themes"];
		return titles[step] || "";
	}, [step]);

	return (
		<main className="business_control_background">
			{step === 4 ? null : (
				<div className="linear_gradient_background">
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

const MemoizedMainBusinessPage = memo(MainBusinessPage);

export default MemoizedMainBusinessPage;
