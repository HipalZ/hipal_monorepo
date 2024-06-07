import { BsChevronLeft, BsPerson } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { memo, startTransition } from "react";
interface HeaderProps {
	leftIcon?: JSX.Element;
	centerImage?: string;
	rightImage?: string;
	isIconBusinessShow: boolean;
	title?: string;
	onBack?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({
	leftIcon,
	centerImage,
	isIconBusinessShow,
	title,
	onBack
}) => {
	const navigate = useNavigate();
	const location = useLocation();

	const handleBackClick = () => {
		if (onBack) {
			onBack();
		} else if (new URLSearchParams(location.search).get('tab')) {
			startTransition(() => {
				navigate({
					pathname: '/',
					search: new URLSearchParams({ businessId: new URLSearchParams(location.search).get('businessId') }).toString(),
				});
			});
		} else {
			startTransition(() => {
				navigate(-1);
			});
		}
	};

	const profile = () => {
		startTransition(() => {
			navigate(`/app/business/profile`);
		});
	};

	let wordAfterBusinessId = location.pathname.split("/")[3];
	if (wordAfterBusinessId === "taxesandcharges") {
		wordAfterBusinessId = "taxes and Charges";
	} else if (wordAfterBusinessId === "zone") {
		wordAfterBusinessId = "Dine In";
	} else if (wordAfterBusinessId === "editZone") {
		wordAfterBusinessId = "Dine In";
	} else if (wordAfterBusinessId === "addKitchen") {
		wordAfterBusinessId = "Dine In";
	} else if (wordAfterBusinessId === "editKitchen") {
		wordAfterBusinessId = "Dine In";
	} else if (wordAfterBusinessId === "passwordManager") {
		wordAfterBusinessId = "Settings";
	} else {
		wordAfterBusinessId = title || '';
	}

	const logoutUser = () => {
		localStorage.clear();
		startTransition(() => {
			navigate("/");
		});
	};

	return (
		<div className="flex items-center justify-between px-6 pt-6">
			<div
				onClick={handleBackClick}
				className="on_active_bounce bg-white p-2 rounded-full border border-[#cacaca]"
			>
				{leftIcon || <BsChevronLeft />}
			</div>
			<div className="flex items-center justify-center">
				{centerImage && (
					<div onClick={logoutUser}>
						<img src={centerImage} alt="Center Image" loading="lazy" />
					</div>
				)}
				<span className="ml-2 text-2xl font-medium capitalize">
					{wordAfterBusinessId || title}
				</span>
			</div>
			<div>
				{isIconBusinessShow && (
					<button type="button" className="flex space-x-6">
						<div
							onClick={profile}
							className="bg-white w-8 h-8 border border-[#cacaca] rounded-full justify-center items-center flex"
						>
							<BsPerson />
						</div>
					</button>
				)}
			</div>
		</div>
	);
});

export default Header;
