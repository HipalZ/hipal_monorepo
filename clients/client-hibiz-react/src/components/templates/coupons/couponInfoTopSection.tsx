import CouponImages from "@/assets/coupon/coupon card.png";
import useCouponsStore from "@/components/store/useCouponsStore";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { memo } from "react";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formattedDate}`;
};

const MemoCouponInfoTopSection = () => {
  const {
    couponName,
    couponType,
    couponImage,
    bgColor,
    couponDiscount,
    couponPrice,
    couponEndDate,
  } = useCouponsStore((s) => ({
    couponName: s.couponName,
    couponType: s.couponType,
    couponDiscount: s.couponDiscount,
    couponPrice: s.couponPrice,
    couponEndDate: s.couponEndDate,
    bgColor: s.bgColor,
    couponImage: s.couponImage,
  }));

  const ownerName = useOwnerLogin((s) => s.user.name);
  return (
    <>
      <h3 className="ml-6 font-semibold opacity-50 lg:ml-0"> Coupon Info</h3>
      <article
        style={{
          backgroundColor: bgColor,
        }}
        className="flex h-[9.5rem] w-full gap-6 p-4 md:rounded-2xl mt-2"
      >
        <figure className="w-full max-w-[10.75rem] h-[7.5rem] rounded-2xl flex-1 overflow-hidden object-cover">
          <img
            className="object-cover w-full h-auto rounded-xl"
            src={couponImage || CouponImages}
            alt=""
          />
        </figure>
        <figcaption className="flex-1 text-white">
          <h3 className="bungee-inline">{couponName}</h3>
          <p className="text-3xl space-grotesk-700">
            {couponType === "PERCENTAGE"
              ? `${couponDiscount}% OFF`
              : `₹ ${couponPrice} OFF`}
          </p>
          <p className="mt-4 text-sm">
            Active till{" "}
            <span className="font-semibold">
              {couponEndDate ? formatDate(couponEndDate) : "No Expiry"}
            </span>
          </p>
          <p className="text-sm">
            Created by <span className="font-semibold">{ownerName}</span>
          </p>
        </figcaption>
      </article>
    </>
  );
};

const CouponInfoTopSection = memo(MemoCouponInfoTopSection);

export default CouponInfoTopSection;
