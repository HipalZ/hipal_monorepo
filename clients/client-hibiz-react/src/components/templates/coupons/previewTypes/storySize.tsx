import useCouponsStore from "@/components/store/useCouponsStore";
import birthdayPlaceholder from "@/assets/coupon/birthdayCouponz.png";
import { memo } from "react";
import HipalLogo from "@/assets/hipal.png";
import useBusinessData from "@/components/store/useBusinessData";
import QRCode from "react-qr-code";

const MemoStorySize = () => {
  const {
    couponPrice,
    couponName,
    bgColor,
    couponImage,
    couponDiscount,
    couponType,
    links,
  } = useCouponsStore((s) => ({
    couponPrice: s.couponPrice,
    couponName: s.couponName,
    bgColor: s.bgColor,
    couponImage: s.couponImage,
    couponDiscount: s.couponDiscount,
    couponType: s.couponType,
    links: s.links,
  }));

  const logo = useBusinessData((s) => s.businessData?.logo);
  const qrLink = links && links.length > 0 ? links[0].link : "";

  return (
    <div className="relative w-[236px] mx-auto -mt-8 h-[420px] overflow-hidden scale-[0.9]">
      {qrLink && (
        <div className="absolute z-50 p-1 bg-white rounded top-2 right-2">
          <QRCode
            value={qrLink}
            size={48}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 48 48`}
          />
        </div>
      )}

      <div
        className="absolute inset-0 w-[236px] h-[420px]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(146, 103, 236, 0) 47%, ${bgColor} 77.68%), url(${couponImage || birthdayPlaceholder
            })`,
          backgroundPosition: "top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <figure className="absolute w-[4rem] bottom-2 right-2">
        <img className="filter invert brightness-0" src={HipalLogo} alt="" />
      </figure>

      <figcaption className="absolute text-[0.5rem] text-white bottom-2 left-2">
        Terms & Conditions
      </figcaption>

      <p
        style={{
          fontFamily: "darker",
        }}
        className="absolute text-2xl font-bold text-white left-1/2 bottom-[10%] transform -translate-x-1/2 text-center"
      >
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% off `
          : `₹ ${couponPrice || "0"} off `}
      </p>
      <div
        style={{
          fontFamily: "Bungee",
        }}
        className="absolute w-full text-2xl font-bold text-white left-1/2 bottom-[17%] transform -translate-x-1/2 text-center max-w-[90%] break-words"
      >
        <figure className="w-[4rem] h-[4rem] mx-auto mb-2 rounded-full overflow-hidden">
          <img
            src={logo}
            alt="business logo"
            className="object-cover w-full h-full rounded-full"
          />
        </figure>

        {couponName || "Coupon"}
      </div>
    </div>
  );
};

const StorySize = memo(MemoStorySize);
export default StorySize;
