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
	dropDown?: JSX.Element;
	children?: React.ReactNode;
}

const MemoizedHeader: React.FC<HeaderProps> = memo(
	({ leftIcon, centerImage, isIconBusinessShow, title, rightButton, children, onBack ,dropDown}) => {
		const navigate = useNavigate();

    const handleBackClick = () => {
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
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
						onClick={onBack ? onBack : handleBackClick}
						onKeyDown={onBack ? onBack : handleBackClick}
						className="px-4 py-2 bg-[#FFFFFF] border border-[#00000050] rounded-3xl on_active_bounce"
					>
						{leftIcon || <FaArrowLeft />}
					</div>
					<div className={`${centerImage ? 'flex items-center justify-center' : ''} `}>
						{centerImage && (
							<div onKeyDown={logoutUser} onClick={logoutUser}>
								<img src={centerImage} alt="Center img" loading="lazy" />
							</div>
						)}
						&nbsp;
						<span className={`${centerImage ? '' : 'absolute w-max transform -translate-x-1/2 left-1/2'} text-2xl font-medium capitalize`}>
							{dropDown? dropDown : title}
						</span>
					</div>
					{rightButton ? <div className="absolute text-sm right-6">
						{rightButton}
					</div> : null}
					{isIconBusinessShow && (
						<div>
							<button onClick={profile} type="button">
								<TbSettings size={24} />
							</button>
						</div>
					)}
				</div>
				&nbsp;
				{children ? <center>
					{children}
				</center>:null}
			</>
		);
	},
);

const HisiteHeader = memo(MemoizedHeader);

export default HisiteHeader;
