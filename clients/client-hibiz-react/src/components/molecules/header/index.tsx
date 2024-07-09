import { memo, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { TbSettings } from "react-icons/tb";
import { FaArrowLeft } from "react-icons/fa";
interface HeaderProps {
	leftIcon?: JSX.Element;
	centerImage?: string;
	rightImage?: string;
	rightButton?: JSX.Element;
	isIconBusinessShow: boolean;
	title?: string;
	onBack?: () => void;
	children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = memo(
	({ leftIcon, centerImage, isIconBusinessShow, title, rightButton,children }) => {
		const navigate = useNavigate();

		const handleBackClick = () => {
			navigate(-1);
		};

		const profile = () => {
			startTransition(() => {
				navigate("/app/business/profile");
			});
		};

		const logoutUser = () => {
			localStorage.clear();
			startTransition(() => {
				navigate("/");
			});
		};

		return (
			<>
				<div className="flex items-center justify-between px-6 pt-6">
					<div
						onClick={handleBackClick}
						onKeyDown={handleBackClick}
						className="px-4 py-2 bg-[#FFFFFF] border border-[#00000050] rounded-3xl on_active_bounce"
					>
						{leftIcon || <FaArrowLeft />}
					</div>
					<div className={`${centerImage ? 'flex items-center justify-center': ''} `}>
						{centerImage && (
							<div onKeyDown={logoutUser} onClick={logoutUser}>
								<img src={centerImage} alt="Center img" loading="lazy" />
							</div>
						)}
						&nbsp;
						<span className={`${centerImage ? '' : 'absolute transform -translate-x-1/2 left-1/2'} text-2xl font-medium capitalize`}>
							{title}
						</span>
					</div>
					<div className="absolute right-6 text-sm">
						{rightButton}
					</div>
					<div>
						{isIconBusinessShow && (
							<button onClick={profile} type="button">
								<TbSettings size={24} />
							</button>
						)}
					</div>
				</div>
				&nbsp;
				<center>
					{children}
				</center>
			</>
		);
	},
);

const MemoizedHeader = memo(Header);

export default MemoizedHeader;
