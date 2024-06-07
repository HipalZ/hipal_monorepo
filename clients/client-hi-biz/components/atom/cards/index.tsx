import { memo, useEffect, useState } from "react";
import Image from "next/image";
import useBusinessData from "@/components/store/useBusinessData";
import { useCroppedImage } from "@/components/store/useCroppedImage";

export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
  size: "md" | "lg";
  src: any;
  imageSrc: string;
  isActive?: boolean;
  fontColor?: string | null;
  logo?: string;
}

function Cards({ size, src, imageSrc, isActive, fontColor, logo }: ICard) {
  const classes = {
    md: {
      mainCard: "h-[6rem] w-[10rem] rounded-md",
      marginTag: "m-2",
    },
    lg: {
      mainCard: "h-[6rem] w-[10rem]",
      marginTag: "m-2",
    },
  };

  const businessName = useBusinessData((s) => s.businessData?.businessName);
  const businessLogo = useBusinessData((s) => s.businessData?.logo);
  const croppedImage = useCroppedImage((s) => s.croppedImage);
  return (
    <>
      <div
        style={{
          backgroundColor: `${src?.triangle || src?.wave ? "#4B84EB" : "#22341F"
            }`,
          backgroundImage: `url(${imageSrc})`,
          backgroundPosition: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud
            ? "right 5% top 50%"
            : ""
            }`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud
            ? "75px 50px"
            : "cover"
            }`,
        }}
        className={`${isActive ? "border-2 border-yellow-600" : ""} ${classes[size].mainCard
          } mr-2 text-base-content justify-between flex flex-col rounded-md transition-transform duration-500`}
      >
        <div
          className="text-[0.5rem] ml-2 font-semibold flex self-start mt-2"
          style={{
            maxWidth: "calc(20%)",
            whiteSpace: "nowrap",
            height:'50px',
            width:'50px'
          }}
        >
          <Image
            src={croppedImage || businessLogo || logo!}
            alt="logo"
            width={50}
            height={50}
          />
        </div>
        <h1
          style={{
            maxWidth: "calc(100% - 2rem)",
            whiteSpace: "nowrap",
            color: `${fontColor}`,
          }}
          className="ml-2 text-xs text-white font-semibold flex self-start mb-2"
        >
          {businessName}
        </h1>
      </div>
    </>
  );
}

export default memo(Cards);
