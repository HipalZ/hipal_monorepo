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
  hideBack?: boolean;
}

const Header: React.FC<HeaderProps> = memo(
  ({
    leftIcon,
    centerImage,
    isIconBusinessShow,
    title,
    rightButton,
    children,
    onBack,
    hideBack,
  }) => {
    const navigate = useNavigate();

    const handleBackClick = () => {
      if (onBack) {
        onBack();
      } else {
        startTransition(() => {
          navigate(-1);
        });
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
          {hideBack ? (
            <div />
          ) : (
            <button
              type="button"
              onClick={handleBackClick}
              className="transition-transform transform px-4 active:shadow-sm active:translate-y-1 py-2 bg-[#FFFFFF] border border-[#00000050] rounded-3xl"
            >
              {leftIcon || <FaArrowLeft />}
            </button>
          )}
          <div
            className={`${
              centerImage ? "flex items-center justify-center" : ""
            } `}
          >
            {centerImage && (
              <button type="button" onClick={logoutUser}>
                <img src={centerImage} alt="Center img" loading="lazy" />
              </button>
            )}
            &nbsp;
            <span
              className={`${
                centerImage
                  ? "mr-8"
                  : "absolute transform -translate-x-1/2 left-1/2"
              } text-2xl font-medium capitalize text-nowrap`}
            >
              {title?.toLowerCase()}
            </span>
          </div>
          <div className="absolute text-sm right-6">{rightButton}</div>
          <div className="transition-transform transform shadow-2xl active:shadow-sm active:translate-y-1 ">
            {isIconBusinessShow && (
              <button onClick={profile} type="button">
                <TbSettings size={24} />
              </button>
            )}
          </div>
        </div>
        &nbsp;
        <center>{children}</center>
      </>
    );
  },
);

const MemoizedHeader = memo(Header);
export default MemoizedHeader;
