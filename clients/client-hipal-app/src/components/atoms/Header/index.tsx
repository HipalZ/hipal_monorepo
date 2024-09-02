"use client";

import { memo, startTransition } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import hipalz from "@/assets/img/hipalzColor.png";

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
    const router = useRouter();

    const handleBackClick = () => {
      if (onBack) {
        onBack();
      } else {
        startTransition(() => {
          router.back();
        });
      }
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
              <picture>
                <Image src={centerImage} alt="Center img" loading="lazy" />
              </picture>
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
          <div>
            {isIconBusinessShow && (
              <Image
                src={hipalz}
                alt="hipalz"
                width={100}
                height={100}
                className="float-right scale-75 bg-transparent"
              />
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
