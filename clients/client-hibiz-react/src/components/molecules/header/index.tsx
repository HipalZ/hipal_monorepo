import { memo, startTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbSettings } from "react-icons/tb";
import { FaArrowLeft } from "react-icons/fa";
interface HeaderProps {
	leftIcon?: JSX.Element;
	centerImage?: string;
	rightImage?: string;
	isIconBusinessShow: boolean;
	title?: string;
	onBack?: () => void;
}

const Header: React.FC<HeaderProps> = memo(
	({ leftIcon, centerImage, isIconBusinessShow, title, onBack }) => {
		const navigate = useNavigate();
		const location = useLocation();

		const handleBackClick = () => {
			if (onBack) {
				onBack();
			} else if (new URLSearchParams(location.search).get("tab")) {
				startTransition(() => {
					return navigate({
						pathname: "/",
						search: new URLSearchParams({
							businessId: new URLSearchParams(location.search).get(
								"businessId"
							),
						}).toString(),
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
			wordAfterBusinessId = title || "";
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
					className="px-4 py-2 bg-[#FFFFFF] border border-[#00000050] rounded-3xl on_active_bounce"
				>
					{leftIcon || <FaArrowLeft />}
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
						<button onClick={profile} type="button">
							<TbSettings size={24} />
						</button>
					)}
				</div>
			</div>
		);
	},
);

export default Header;
