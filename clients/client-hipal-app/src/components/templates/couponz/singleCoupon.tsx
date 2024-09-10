"use client";
import MemoPlaceholderImg from "@/components/atoms/placeholder";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { memo } from "react";
import { BiArrowBack } from "react-icons/bi";
import baloonsRight from "@/assets/img/baloons_right.png";
import baloonsLeft from "@/assets/img/baloon_left.png";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { GoArrowUpRight } from "react-icons/go";
import { apiRpc, cn } from "@hi/common";
import {
  formatDate,
  formatDiscount,
  formatTime,
  getAvailabilityText,
  getLinearGradient,
  ICouponPage,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import curvedLine from "@/assets/svg/curvedline.svg";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";

const MemoCouponz = () => {
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const { logoUrl, name } = useBusinessDetails((s) => ({
    logoUrl: s.businessDetails?.logoUrl,
    name: s.businessDetails?.name,
  }));

  const { userDetails } = useLogin((s) => ({
    userDetails: s.userDetails,
  }));

  const { selectedCoupon, setCurrentPage } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
    setCurrentPage: s.setCurrentPage,
  }));

  const grabCouponz = async () => {
    const response = await apiRpc.couponz["grabbed-couponz"].$post({
      json: {
        couponId: selectedCoupon?._id,
        userId: userDetails?._id,
      },
    });
    const data = await response.json();
    if (response.status === 201) {
      toast.success(data?.message || "Coupon grabbed successfully");
      if (selectedCoupon?.conditions?.requiredFields?.includes("dob")) {
        setCurrentPage(ICouponPage.BIRTHDAYCOUPON);
      } else {
        setCurrentPage(ICouponPage.CONGRATULATIONZ);
      }
    } else if (response.status === 400) {
      toast.error(data?.message || "Coupon already grabbed");
      setCurrentPage(ICouponPage.SINGLECOUPON);
      router.push(`/${customLink}/explore`);
    }
  };

  const startTime = formatTime(
    selectedCoupon?.conditions?.availability?.startTime || 1,
  );
  const endTime = formatTime(
    selectedCoupon?.conditions?.availability?.endTime || 23.5,
  );

  return (
    <main
      className={cn(
        `bg-[${selectedCoupon?.bgColour || "#9267EC"}]`,
        `text-[${selectedCoupon?.bgColour || "#9267EC"}]`,
        "h-[100vh] overflow-y-auto pb-[10rem] relative",
      )}
    >
      <Link href={`/${customLink}/explore`}>
        <button
          type="button"
          className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
        >
          <BiArrowBack />
        </button>
      </Link>
      <picture className="absolute right-0 -top-14">
        <Image src={baloonsRight} alt="baloonsRight" width={155} height={300} />
      </picture>
      <center className="z-10 pt-4">
        {logoUrl ? (
          <div className="w-[80px] h-[80px] flex justify-center items-center">
            <Image
              src={logoUrl}
              height={86}
              width={86}
              quality={95}
              alt="logo-business"
              className="z-10 object-center bg-white rounded-full aspect-square"
              placeholder="blur"
              blurDataURL={getRandomBlurImg(65, 65)}
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <MemoPlaceholderImg />
        )}
        <h1 className="my-2">{name}</h1>
        <h1 className="mx-12 my-4 text-xl bungee-inline">
          {selectedCoupon?.name || "Birthday Coupon"}
        </h1>
      </center>
      <center className="relative z-10">
        <Image
          src={birthdayPlaceholder}
          alt="Birthday Placeholder"
          width={256}
          height={200}
          className="rounded-t-xl"
        />
        <div className="relative z-10 grid w-64 grid-cols-2 gap-4 p-4 -mt-px text-black bg-white rounded-b-xl">
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs text-gray-500">Min. Bill Amount</h3>
            <p>₹{selectedCoupon?.conditions?.billValue}</p>
          </div>
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs text-gray-500">Valid Till</h3>
            <p>{formatDate(selectedCoupon?.conditions?.couponEndDate)}</p>
          </div>
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs text-gray-500">Applicable On</h3>
            <p className="text-left">
              {getAvailabilityText(
                selectedCoupon?.conditions?.availability?.when,
                selectedCoupon?.conditions?.availability?.customDays || [],
              )}{" "}
            </p>
          </div>
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs text-gray-500">Available On</h3>
            <p>
              {startTime}-{endTime}
            </p>
          </div>
          <hr
            className="w-full col-span-2 mt-6"
            style={{
              backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                `${selectedCoupon?.bgColour || "#9267EC"}`,
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "2px",
              border: "none",
            }}
          />
          <p className="col-span-2 text-3xl text-center text-black space-grotesk-700">
            {formatDiscount(
              selectedCoupon?.config?.value,
              selectedCoupon?.config?.discountType,
            )}{" "}
            OFF
          </p>
          <div className="absolute flex items-center justify-between w-full h-full px-2">
            <div
              className={cn(
                `bg-[${selectedCoupon?.bgColour || "#9267EC"}]`,
                "absolute w-8 h-8 rounded-full -left-4 bottom-14",
              )}
            />
            <div
              className={cn(
                `bg-[${selectedCoupon?.bgColour || "#9267EC"}]`,
                "absolute w-8 h-8 rounded-full -right-4 bottom-14",
              )}
            />
          </div>
        </div>
        <div
          className="absolute w-3/4 h-8 transform -translate-x-1/2 bg-black opacity-75 left-1/2 -bottom-5"
          style={{ filter: "blur(30px)" }}
        />
      </center>
      <picture className="absolute w-full h-[50%] custom-curved-line">
        <Image src={curvedLine} alt="curvedLine" className="w-full" />
      </picture>
      <picture className="absolute scale-80 -left-2 bottom-24">
        <Image src={baloonsLeft} alt="baloonsLeft" width={100} height={100} />
      </picture>
      <center className="text-black fixed w-full text-sm underline opacity-75 bottom-32 underline-offset-4 max-w-[30rem]">
        View Terms and conditions
      </center>
      <section
        onClick={grabCouponz}
        onKeyDown={grabCouponz}
        className="z-10 w-full max-w-[calc(100%-2rem)] md:max-w-[28rem] h-[5.5rem] p-4 rounded-xl flex gap-4 items-center fixed md:absolute left-1/2 transform -translate-x-1/2 bottom-4"
        style={{
          background: getLinearGradient(selectedCoupon?.bgColour) || "",
        }}
      >
        <article className="bg-black h-[3.5rem] rounded-lg aspect-square flex items-center justify-center">
          <GoArrowUpRight color="white" size={36} />
        </article>
        <article className="text-black on_active_bounce">
          <h1 className="text-lg">Grab the coupon now !</h1>
          <p className="text-sm opacity-90">
            Get{" "}
            {formatDiscount(
              selectedCoupon?.config?.value,
              selectedCoupon?.config?.discountType,
            )}
            Off
          </p>
        </article>
      </section>
    </main>
  );
};

const Couponz = memo(MemoCouponz);
export default Couponz;
