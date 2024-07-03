import { memo, startTransition } from "react";
import {  useNavigate  } from "react-router-dom";
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
	({ leftIcon, centerImage, isIconBusinessShow, title }) => {
		const navigate = useNavigate();
		console.log("center", centerImage);

		const handleBackClick = () => {
			navigate(-1);
		};

		const profile = () => {
			startTransition(() => {
				navigate(`/app/business/profile`);
			});
		};

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
						{ title}
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

const MemoizedHeader = memo(Header);

export default MemoizedHeader;
