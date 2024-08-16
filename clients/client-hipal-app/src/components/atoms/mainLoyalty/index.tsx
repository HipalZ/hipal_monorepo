import { useLogin } from "@/components/store/useLogin";
import React, { memo } from "react";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { useParams, useRouter } from "next/navigation";
import TitleTransition from "../titletransition";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { ILoyaltySetting } from "@/components/store/useLoyaltyData";
import { useUserToken } from "@hi/common/src/useUserToken";
import CardSection from "../cardSection";

interface ILoyaltyCard {
  logo?: string;
  cardColor: string;
  fontColor: string;
  hiCode?: string;
  loyaltySetting: ILoyaltySetting;
}

const MainLoyalty = ({
  logo,
  cardColor,
  fontColor,
  hiCode,
  loyaltySetting,
}: ILoyaltyCard) => {
  const accessToken = useUserToken.getState().accessToken;
  const customLink = useParams()?.businessId as string;
  const setDirection = useLogin((s) => s.setDirection);
  const router = useRouter();

  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const goToLoyalty = (str: string) => {
    if (!accessToken) {
      setDirection(str);
      router.push(routePaths[PAGE_TYPES.SIGN_UP](customLink));
    } else {
      setDirection("");
      router.push(routePaths[PAGE_TYPES.LOYALTY](customLink));
    }
  };

  const handleClaimNowClick = () => {
    goToLoyalty("loyalty");
  };

  return (
    <div className="pt-2 bg-base-100">
      <div className="py-4 text-xl font-semibold text-center text-primary syne-font">
        <div>Treat yourself to a</div>
        <TitleTransition
          loyaltySetting={loyaltySetting}
          data={businessDetails.name}
          align="center"
        />
        <div>with every bill you settle!!</div>
      </div>

      <CardSection />
      <center className="text-xl text-primary">
        CVV :- <span className="text-2xl font-bold">{hiCode}</span>
      </center>
      <div className="py-4 mx-6 text-sm text-center text-primary">
        Get {loyaltySetting?.setCashBackPercentage}% cash back every time you
        Pay bill! It&#39;s our way of saying thanks for choosing us. Simple
        savings, just for you!
      </div>
      {!hiCode && (
        <div onClick={handleClaimNowClick} className="w-full px-4 pt-2 pb-4">
          <button
            type="button"
            className="w-full py-3 rounded-full bg-primary text-primary-content"
          >
            Claim now
          </button>
        </div>
      )}
    </div>
  );
};

const MemoMainLoyalty = memo(MainLoyalty);
export default MemoMainLoyalty;
