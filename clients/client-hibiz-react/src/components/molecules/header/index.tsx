import { memo, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { cn } from "@hi/common";

interface HeaderProps {
  leftIcon?: JSX.Element;
  centerImage?: string;
  rightImage?: string;
  rightButton?: JSX.Element;
  title?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  hideBack?: boolean;
  headingColor?: string;
}

const Header: React.FC<HeaderProps> = memo(
  ({
    leftIcon,
    centerImage,
    title,
    rightButton,
    children,
    onBack,
    hideBack,
    headingColor,
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
            className={cn(
              centerImage ? "flex items-center justify-center" : "",
            )}
          >
            <span
              style={{
                color: headingColor ? headingColor : "#000000",
              }}
              onClick={logoutUser}
              className={cn(
                centerImage
                  ? "mr-8"
                  : "absolute transform -translate-x-1/2 lg:left-[17%] left-1/2 top-6",
                "text-2xl font-medium capitalize text-nowrap",
                headingColor && `text-[${headingColor}]`,
              )}
            >
              {title?.toLowerCase()}
            </span>
          </div>
          <div className="absolute text-sm right-6">{rightButton}</div>
        </div>
        &nbsp;
        <center>{children}</center>
      </>
    );
  },
);

const MemoizedHeader = memo(Header);
export default MemoizedHeader;
