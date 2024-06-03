import { BsChevronLeft, BsPerson } from "react-icons/bs";
import Image from "next/image";
import { useRouter } from "next/router";
import { BiBell } from "react-icons/bi";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";

interface HeaderProps {
	leftIcon?: JSX.Element;
	centerImage?: string;
	rightImage?: string;
	isIconBusinessShow: boolean;
	title? : string;
	onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
	leftIcon,
	centerImage,
	isIconBusinessShow,
	title,
	onBack
}) => {
	const router = useRouter();
	const handleBackClick = () => {
		if (onBack){
			onBack();
		} 
		else if (router.query.tab) {
			router.push({
				pathname: ".",
				query: {
					businessId: router.query.businessId,
				},
			});
		}
		else {
			router.back();
		}
	};
	const profile = () => {
		router.push(routePaths[PAGE_TYPES.PROFILE]());
	};

	let wordAfterBusinessId = router.pathname.split("/")[3];
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
	}else{
		wordAfterBusinessId = title || '';
	}
	async function logoutUser() {
		localStorage.clear();
		router.push("/")
	}
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
					<div
						onClick={logoutUser}
					>
						<Image src={centerImage} alt="Center Image" />
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
};

export default Header;
