"use client";
import { useLogin } from "@/components/store/useLogin";
import React, { memo } from "react";
import { useParams } from "next/navigation";
import { CiDiscount1 } from "react-icons/ci";
import { TfiWallet } from "react-icons/tfi";
import { useUserToken } from "@hi/common/src/useUserToken";

const Rewards = () => {
  const { userDetails, userCoinZ, isLogin } = useLogin((s) => ({
    userDetails: s.userDetails,
    userCoinZ: s.userCoinZ,
    isLogin: s.isLogin,
  }));
  const accessToken = useUserToken.getState().accessToken;
  const customLink = useParams()?.businessId as string;

  if (!accessToken) return null;

  return (
    <div className="h-[11rem] bg-base-200 absolute w-full z-[-1] mt-16">
      <center className="mt-[3rem]">
        <h3 className="py-4 mr-2 text-xl text-Primary">
          👋 Hi {userDetails.name}
        </h3>
        <section className="flex items-center justify-center gap-4">
          <article className="flex items-center justify-center gap-1">
            <CiDiscount1 size={36} />
            <div className="text-start">
              <h3 className="text-sm font-semibold text-Primary">Rewards</h3>
              <p className="text-xs text-base-content opacity-60 text-nowrap">
                Explore
              </p>
            </div>
          </article>
          <article className="flex items-center justify-center gap-1">
            <TfiWallet size={30} />
            <div className="text-start">
              <h3 className="text-sm font-semibold text-Primary">Rewards</h3>
              <p className="text-xs text-base-content opacity-60 text-nowrap">
                Use {userCoinZ} CoinZ
              </p>
            </div>
          </article>
          <article className="flex items-center justify-center gap-1">
            <CiDiscount1 size={36} />
            <div className="text-start">
              <h3 className="text-sm font-semibold text-Primary">Couponz</h3>
              <p className="text-xs text-base-content opacity-60 text-nowrap">
                Coming Soon
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
