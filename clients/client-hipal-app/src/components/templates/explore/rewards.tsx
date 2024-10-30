"use client";
import { useLogin } from "@/components/store/useLogin";
import React, { memo } from "react";
import { useParams } from "next/navigation";
import { CiDiscount1 } from "react-icons/ci";
import { TfiWallet } from "react-icons/tfi";
import { useUserToken } from "@hi/common/src/useUserToken";

const Rewards = () => {
  const { userDetails, userCoinZ } = useLogin((s) => ({
    userDetails: s.userDetails,
    userCoinZ: s.userCoinZ,
  }));
  const accessToken = useUserToken.getState().accessToken;
  if (!accessToken) return null;

  return (
    <div className="h-[10rem] bg-base-200 absolute w-full z-[-1] pt-[7rem]">
      <center className="pb-8 bg-base-200 ">
        <h3 className="py-4 mr-4 text-xl !text-[var(--bc)] font-bold">
          👋 Hi {userDetails.name}
        </h3>
        <section className="flex items-center justify-center gap-5 scale-90 text-primary">
          <article className="flex items-center justify-center gap-2">
            <CiDiscount1 size={36} />
            <div className="leading-4 text-start">
              <h3 className="text-sm font-semibold text-primary">Rewards</h3>
              <p className="text-[0.625rem] text-base-content opacity-60 text-nowrap">
                Explore
              </p>
            </div>
          </article>
          <article className="flex items-center justify-center gap-2">
            <TfiWallet size={30} />
            <div className="leading-4 text-start">
              <h3 className="text-sm font-semibold text-primary">CoinZ</h3>
              <p className="text-[0.625rem] text-base-content opacity-60 text-nowrap">
                Use {userCoinZ} CoinZ
              </p>
            </div>
          </article>
          <article className="flex items-center justify-center gap-2">
            <CiDiscount1 size={36} />
            <div className="leading-4 text-start">
              <h3 className="text-sm font-semibold text-primary">Couponz</h3>
              <p className="text-[0.625rem] text-base-content opacity-60 text-nowrap">
                Grab & Avail
              </p>
            </div>
          </article>
        </section>
      </center>
    </div>
  );
};

const MemoRewards = memo(Rewards);
export default MemoRewards;
