import { cn } from '@hi/common';
import { memo, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  leftIcon?: JSX.Element;
  centerImage?: string;
  rightImage?: string;
  rightButton?: JSX.Element;
  isIconBusinessShow?: boolean;
  title?: string;
  onBack?: () => void;
  children?: React.ReactNode;
  hideBack?: boolean;
  headingColor?: string;
}

const Header: React.FC<HeaderProps> = memo(({ leftIcon, centerImage, title, rightButton, children, onBack, hideBack, headingColor }) => {
  const navigate = useNavigate();

  const handleBackClick = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  }, [onBack, navigate]);

  const logoutUser = useCallback(() => {
    localStorage.clear();
    navigate('/');
  }, [navigate]);

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-6">
        {hideBack ? (
          <div />
        ) : (
          <button
            type="button"
            onClick={handleBackClick}
            className="transform rounded-3xl border border-[#00000050] bg-[#FFFFFF] px-4 py-2 transition-transform active:translate-y-1 active:shadow-sm"
          >
            {leftIcon || <FaArrowLeft />}
          </button>
        )}
        <div className={cn(centerImage ? 'flex items-center justify-center' : '')}>
          <span
            style={{ color: headingColor ?? '#000000' }}
            onClick={logoutUser}
            onKeyDown={logoutUser}
            className={cn(
              centerImage ? 'mr-8' : 'absolute left-1/2 top-6 -translate-x-1/2 transform',
              'max-w-[16ch] truncate text-2xl font-medium md:max-w-[15rem]',
              'md:max-w-full md:overflow-visible md:whitespace-normal',
              headingColor && `text-[${headingColor}]`,
            )}
          >
            {title}
          </span>
        </div>
        {rightButton ? (
          <div
            // onClick={logoutUser}
            // onKeyDown={logoutUser}
            className="absolute right-6 text-sm"
          >
            {rightButton}
          </div>
        ) : (
          <div />
        )}
      </div>
      &nbsp;
      <center>{children}</center>
    </>
  );
});

const MemoizedHeader = memo(Header);
export default MemoizedHeader;
