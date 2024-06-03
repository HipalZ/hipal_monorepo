import { memo, useEffect, useState } from "react";
import Image from "next/image";
import useBusinessData from "@/components/store/useBusinessData";
import { useLoyalityData } from "@/components/store/useLoyality";
import { useCroppedImage } from "@/components/store/useCroppedImage";
export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
  logo: string | undefined;
  size: "md" | "lg";
  src: Record<string, string>;
  croppedImage?: string | null;
  cardColor?: string | null;
  fontColor?: string | null;
}

function LoyalityCard({
  logo,
  size,
  src,
  croppedImage,
  cardColor,
  fontColor,
  ...props
}: ICard) {
  const classes = {
    md: {
      mainCard: "h-[6rem] w-[10rem] rounded-md",
      marginTag: "m-2",
    },
    lg: {
      mainCard: "w-[19rem] min-w-[90%] h-[13rem] rounded-2xl",
      marginTag: "m-5",
    },
  };
  const [image, setImage] = useState<any>(null);
  const { existingLoyalty, isLoyaltyExists } = useBusinessData();
  const { setCroppedImage } = useCroppedImage();
  const { setCardColor, setFontColor, setLogo } = useLoyalityData()
  useEffect(() => {
    if (
      src?.beans ||
      src?.bowl ||
      src?.love ||
      src?.flower ||
      src?.bud ||
      src?.triangle ||
      src?.wave
    ) {
      setImage(Object?.values(src)[0]);
    }
  }, [src]);
  const businessName = useBusinessData((s) => s.businessData?.businessName);
  const businessLogo = useBusinessData((s) => s.businessData?.logo);
  useEffect(() => {
    if (isLoyaltyExists) {
      setCardColor(existingLoyalty?.cardColor)
      setFontColor(existingLoyalty?.fontColor)
      setLogo(existingLoyalty?.logo)
      setCroppedImage(existingLoyalty?.logo)
    }
  }, [])
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud
            ? "right 5% top 50%"
            : ""
            }`,
          backgroundRepeat: "no-repeat",
          backgroundColor: `${cardColor}`,
          backgroundSize: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud
            ? "75px 50px"
            : "cover"
            }`,
        }}
        className={`${classes[size].mainCard} text-base-content justify-between flex flex-col border border-1 transition-transform duration-500`}
      >
        <div
          className={`${classes[size].marginTag} text-[1rem] font-semibold flex self-start`}
          style={{
            maxWidth: "calc(20%)",
            whiteSpace: "nowrap",
          }}
        >
          <Image
            src={croppedImage || businessLogo || logo!}
            alt="logo"
            height={100}
            width={100}
          />
        </div>
        <h1
          style={{
            maxWidth: "calc(100% - 2rem)",
            whiteSpace: "nowrap",
            color: `${fontColor}`,
          }}
          className={`${classes[size].marginTag} ${size === "md" ? "text-sm" : "text-base"
            }  font-[500] flex self-start`}
        >
          {businessName}
        </h1>
      </div>
    </>
  );
}

export default memo(LoyalityCard);
