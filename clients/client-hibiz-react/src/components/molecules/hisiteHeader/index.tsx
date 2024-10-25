import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { TbSettings } from "react-icons/tb";
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "@/components/utils/helper";
import { useIsExplorePage } from "@/hooks/useExplore";
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

const MemoizedHeader: React.FC<HeaderProps> = memo(
  ({
    leftIcon,
    centerImage,
    isIconBusinessShow,
    title,
    rightButton,
    children,
    onBack,
  }) => {
    const navigate = useNavigate();
    const isExplorePage = useIsExplorePage();

    const handleBackClick = () => {
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
    };

    const profile = () => {
      navigate("/app/business/profile");
    };

    const logoutUser = () => {
      localStorage.clear();
      navigate("/");
    };

    return (
      <>
        <div
          className={cn(
            "fixed top-0 z-10 flex items-center justify-between w-full p-6 md:max-w-[69rem] rounded-b-xl",
            isExplorePage ? "bg-white" : "",
          )}
        >
          <button
            type="button"
            onClick={handleBackClick}
            className="px-4 py-2 transition-transform transform active:shadow-sm active:translate-y-1 bg-[#FFFFFF] border border-[#00000050] rounded-3xl on_active_bounce shadow-2xl"
          >
            {leftIcon || <FaArrowLeft />}
          </button>
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
                  ? ""
                  : "absolute w-max transform -translate-x-1/2 left-1/2"
              } text-2xl font-medium capitalize`}
            >
              {title}
            </span>
          </div>
          {rightButton ? (
            <div className="absolute text-sm right-2">{rightButton}</div>
          ) : null}
          {isIconBusinessShow && (
            <button onClick={profile} type="button">
              <TbSettings size={24} />
            </button>
          )}
        </div>
        &nbsp;
        {children ? <center>{children}</center> : null}
      </>
    );
  },
);

const HisiteHeader = memo(MemoizedHeader);
export default HisiteHeader;
