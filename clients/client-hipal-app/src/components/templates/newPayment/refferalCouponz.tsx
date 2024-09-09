import Image from "next/image";
import React, { memo } from "react";
import birthdayCoupon from "@/assets/img/birthdayCouponComing.png";
import referFriend from "@/assets/img/referFriend.png";

const MemoRefferalCouponz = () => {
  return (
    <section className="flex items-center justify-around mt-6 poppins-regular">
      <article className="w-[10.5rem] text-center bg-[#AF92FF] h-[15rem] rounded-2xl relative">
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
          Grab Now
        </button>
      </article>
      <article className="w-[10.5rem] text-center bg-[#F6D13C] h-[15rem] rounded-2xl relative">
        <center className="text-[#000000] text-lg font-semibold mt-12">
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
  );
};

const RefferalCouponz = memo(MemoRefferalCouponz);
export default RefferalCouponz;
