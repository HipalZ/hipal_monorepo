import useCouponsStore from "@/components/store/useCouponsStore";
import { memo } from "react";
import HipalLogo from "@/assets/hipal.png";
import useBusinessData from "@/components/store/useBusinessData";
import QRCode from "react-qr-code";

const MemoInfoSocialMedia = () => {
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
    <figure className="relative">
      {/* Image container */}
      <img
        src={couponImage}
        alt=""
        className="object-cover w-[320px] h-[320px] aspect-square"
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(146, 103, 236, 0) 47%, ${bgColor} 77.68%)`,
        }}
      />

      {/* QR Code */}
      {qrLink && (
        <div className="absolute p-1 bg-white rounded top-2 right-2">
          <QRCode
            value={qrLink}
            size={64}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 64 64`}
          />
        </div>
      )}

      <p
        style={{
          fontFamily: "darker",
        }}
        className="absolute  bottom-[2rem] left-4 text-xl  font-bold text-white"
      >
        {couponType === "PERCENTAGE" && couponDiscount
          ? `${couponDiscount}% OFF`
          : `₹ ${couponPrice || "0"} OFF`}{" "}
        &nbsp;
        <span className="text-base">Grab Now!</span>
      </p>

      <figure className="absolute w-[4rem]  bottom-2 right-2  ">
        <img className="filter invert brightness-0" src={HipalLogo} alt="" />
      </figure>

      <figcaption className="absolute text-[0.5rem] text-white bottom-2 left-2">
        Terms & Conditions
      </figcaption>

      <div
        style={{
          fontFamily: "Bungee",
        }}
        className="absolute bottom-[3.75rem] left-4 text-3xl font-bold text-white"
      >
        <figure className=" w-[4rem] rounded-full overflow-hidden">
          <img src={logo} alt="business logo" className="rounded-full" />
        </figure>
        {couponName || "Coupon"}
      </div>
    </figure>
  );
};

const InfoSocialMedia = memo(MemoInfoSocialMedia);

export default InfoSocialMedia;
