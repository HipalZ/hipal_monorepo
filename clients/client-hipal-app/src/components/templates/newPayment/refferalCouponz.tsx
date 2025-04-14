import Image from "next/image";
import React, { memo, useRef } from "react";
import birthdayCoupon from "@/assets/img/birthdayCouponComing.png";
import referFriend from "@/assets/img/referFriend.png";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import BirthdayCardClaim from "@/components/atoms/subLoyalty/birthdayCardClaim";
import { useInView } from "framer-motion";

const MemoRefferalCouponz = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);
  return (
    <>
      <center className="my-2 text-xl text-black poppins-regular">
        Rewardz
      </center>
      <section className="flex items-center justify-around mt-6 poppins-regular">
        {outletInfo?.birthdayCampaign ? <BirthdayCardClaim ref={ref} isInView={isInView} /> : <article className="coupon-card-responsive text-center bg-[#AF92FF] h-[16.5rem] max-w-[190px] rounded-2xl relative">
          <Image
            src={birthdayCoupon}
            alt="birthdayCoupon"
            className="mix-blend-luminosity rounded-2xl"
          />
          <center className="text-[#210178] text-xl font-semibold">
            50% back
          </center>
          <center className="text-[#210178] text-sm font-semibold">
            Birthday Coupon
          </center>
          <button
            type="button"
            className="text-xs py-1 bg-[#FFFFFFA6] absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] rounded-2xl text-[#210178]"
          >
            Coming soon
          </button>
        </article>}
        <article className="coupon-card-responsive text-center bg-[#F6D13C] h-[16.5rem] max-w-[190px] rounded-2xl relative">
          <center className="text-[#000000] text-lg font-semibold p-2">
            Refer a friend
          </center>
          <center className="text-[#000000] text-xs font-semibold">
            win 50 Coinz on each referral
          </center>
          <Image
            src={referFriend}
            alt="referFriend"
            className="absolute bottom-0 rounded-2xl"
          />
          <button
            type="button"
            className="text-xs py-1 bg-[#FFFFFFA6] absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[calc(100%-1rem)] rounded-2xl text-[#000000]"
          >
            Coming Soon
          </button>
        </article>
      </section>
    </>
  );
};

const RefferalCouponz = memo(MemoRefferalCouponz);
export default RefferalCouponz;
