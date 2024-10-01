import React, { memo } from "react";
import Image from "next/image";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import {
  adjustLightness,
  cn,
  formatDiscount,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import EmblaCarousel2 from "@/components/atoms/emblaCarousel/emblaCarousel2";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { apiRpc } from "@hi/common";
import ShimmerImage from "@/components/atoms/imageshimmer";

const MemoCouponzBlink = () => {
  const { promoteOnBillCouponz, setPromoteOnBillCouponz } = useCouponz((s) => ({
    promoteOnBillCouponz: s.promoteOnBillCouponz,
    setPromoteOnBillCouponz: s.setPromoteOnBillCouponz,
  }));
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const path = usePathname();
  const isReviewPage = path.includes("review");

  const getPromoteOnBill = async () => {
    const response = await apiRpc.couponz["promotAfterBill-couponz"][
      ":businessId"
    ].$get({
      param: {
        businessId,
      },
    });
    const data = await response.json();
    setPromoteOnBillCouponz(data.data);
    return data;
  };

  useQuery({
    queryKey: ["getPromoteOnBill", businessId],
    queryFn: getPromoteOnBill,
    enabled: !!businessId,
  });

  if (promoteOnBillCouponz && promoteOnBillCouponz.length === 0) return null;
  return (
    <section
      // style={{
      //   background: `linear-gradient(133.14deg, ${
      //     promoteOnBillCouponz[0]?.bgColour
      //   } 25.81%, ${adjustLightness(
      //     promoteOnBillCouponz[0]?.bgColour,
      //     20,
      //   )} 104.42%)`,
      // }}
      className={`bg-[${
        promoteOnBillCouponz[0]?.bgColour || "#9267EC"
      }]relative flex flex-col items-center justify-center pt-5 space-y-10`}
    >
      {isReviewPage ? (
        <center className="!font-semibold text-2xl poppins-regular">
          Don't miss other couponz
        </center>
      ) : null}
      <EmblaCarousel2 customCarousel={true}>
        {promoteOnBillCouponz?.map((coupon) => {
          return (
            <center key={coupon?._id} className="ml-4">
              <ShimmerImage
                src={coupon?.image || birthdayPlaceholder}
                alt="Birthday Placeholder"
                width={195}
                height={130}
                className="bg-black rounded-t-xl"
                style={{
                  objectFit: "cover",
                  height: "8.125rem",
                  width: "12.2rem",
                }}
              />
              <hr
                className="bg-white"
                style={{
                  backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                    `${coupon?.bgColour || "#9267EC"}`,
                  )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  height: "2px",
                  border: "none",
                }}
              />
              <div className="relative w-[12.188rem] min-h-[5.5rem] max-h-full z-10 text-black bg-white rounded-b-xl">
                <div className="absolute flex items-center justify-between w-full px-2">
                  <div
                    className={cn(
                      `bg-[${coupon?.bgColour || "#9267EC"}]`,
                      "absolute w-[1.875rem] h-8 rounded-full -left-4",
                    )}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                    }}
                  />
                  <div
                    className={cn(
                      `bg-[${coupon?.bgColour || "#9267EC"}]`,
                      "absolute w-8 h-8 rounded-full -right-4",
                    )}
                    style={{
                      clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
                    }}
                  />
                </div>
                <h1 className="w-full px-2 pt-4 mb-2 text-sm bungee-inline">
                  {coupon?.name}
                </h1>
                <p className="col-span-2 mb-2 text-2xl text-center text-black space-grotesk-700">
                  {formatDiscount(
                    coupon?.config?.value,
                    coupon?.config?.discountType,
                  )}{" "}
                  OFF
                </p>
              </div>
            </center>
          );
        })}
      </EmblaCarousel2>
    </section>
  );
};

const CouponzBlink = memo(MemoCouponzBlink);
export default CouponzBlink;
