import useBusinessData from '@/components/store/useBusinessData';
import { useCroppedImage } from '@/components/store/useCroppedImage';
import { useLoyalityData } from '@/components/store/useLoyality';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
export interface ICard extends React.HTMLAttributes<HTMLButtonElement> {
  logo: string | undefined;
  size: 'md' | 'lg';
  src: Record<string, string>;
  croppedImage?: string | null;
  cardColor?: string | null;
  fontColor?: string | null;
}

function LoyalityCard({ logo, size, src, croppedImage, cardColor, fontColor, ...props }: ICard) {
  const classes = {
    md: {
      mainCard: 'h-[6rem] w-[10rem] rounded-md',
      marginTag: 'm-2',
    },
    lg: {
      mainCard: 'w-[19rem] min-w-[90%] h-[13rem] rounded-2xl',
      marginTag: 'm-5',
    },
  };
  const [image, setImage] = useState<any>(null);
  const { existingLoyalty, isLoyaltyExists } = useBusinessData();
  const { setCroppedImage } = useCroppedImage();
  const { setCardColor, setFontColor, setLogo } = useLoyalityData();
  useEffect(() => {
    if (src?.beans || src?.bowl || src?.love || src?.flower || src?.bud || src?.triangle || src?.wave) {
      setImage(Object?.values(src)[0]);
    }
  }, [src]);
  const businessName = useBusinessData((s) => s.businessData?.businessName);
  const businessLogo = useBusinessData((s) => s.businessData?.logo);
  useEffect(() => {
    if (isLoyaltyExists) {
      setCardColor(existingLoyalty?.cardColor);
      setFontColor(existingLoyalty?.fontColor);
      setLogo(existingLoyalty?.logo);
      setCroppedImage(existingLoyalty?.logo);
    }
  }, []);
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud ? 'right 5% top 50%' : ''}`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: `${cardColor}`,
          backgroundSize: `${src?.beans || src?.bowl || src?.love || src?.flower || src?.bud ? '75px 50px' : 'cover'}`,
        }}
        className={`${classes[size].mainCard} text-base-content border-1 flex flex-col justify-between border transition-transform duration-500`}
      >
        <div
          className={`${classes[size].marginTag} flex self-start text-[1rem] font-semibold`}
          style={{
            maxWidth: 'calc(20%)',
            whiteSpace: 'nowrap',
            height: '100px',
            width: '100px',
          }}
        >
          <Image src={croppedImage || businessLogo || logo!} alt="logo" height={100} width={100} />
        </div>
        <h1
          style={{
            maxWidth: 'calc(100% - 2rem)',
            whiteSpace: 'nowrap',
            color: `${fontColor}`,
          }}
          className={`${classes[size].marginTag} ${size === 'md' ? 'text-sm' : 'text-base'}  flex self-start font-[500]`}
        >
          {businessName}
        </h1>
      </div>
    </>
  );
}

export default memo(LoyalityCard);
