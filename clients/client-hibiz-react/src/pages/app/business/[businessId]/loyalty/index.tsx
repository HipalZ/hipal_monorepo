import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useLoyalty } from "@/components/store/useLoyalty";
import CardSelection from "@/components/templates/loyalty/cardSelection";
import GetStarted from "@/components/templates/loyalty/getStarted";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import type { LoyaltyType } from "@hi/db-models/src/validators";

const Loyalty = () => {
  const {
    selectedPage,
    setSignupBonus,
    setCoinzBack,
    setResetExpiry,
    setMaxRedemption,
    setLoyaltyID,
    setSelectedPage,
    setLoyaltyStartDate,
    setSelectedCardType,
    setSelectedCardLayout,
    setCardColor,
  } = useLoyalty((state) => ({
    selectedPage: state.selectedPage,
    setSignupBonus: state.setSignupBonus,
    setCoinzBack: state.setCoinzBack,
    setResetExpiry: state.setResetExpiry,
    setMaxRedemption: state.setMaxRedemption,
    setLoyaltyID: state.setLoyaltyID,
    setSelectedPage: state.setSelectedPage,
    setLoyaltyStartDate: state.setLoyaltyStartDate,
    setSelectedCardType: state.setSelectedCardType,
    setSelectedCardLayout: state.setSelectedCardLayout,
    setCardColor: state.setCardColor,
  }));

  const businessId = useParams()?.businessId;

  const getLoyaltyData = async () => {
    const response = await apiRpc.businesses[":businessId"].loyalty.$get({
      param: {
        businessId: businessId,
      },
    });
    const loyaltyData = (await response.json()).data as LoyaltyType;
    if (response.status === 200 || response.status === 201) {
      setSignupBonus(loyaltyData?.signUpBonus ?? 0);
      setCoinzBack(loyaltyData?.setCashBackPercentage || 0);
      setResetExpiry(loyaltyData?.loyaltyExpiryDate || 0);
      setMaxRedemption(loyaltyData?.setClaimedPercentage || 0);
      setLoyaltyID(loyaltyData._id?.toString() ?? "");
      setLoyaltyStartDate(loyaltyData?.loyaltyStartDate ?? 0);
      setSelectedCardType(loyaltyData?.cardType ?? "CARD_ONE");
      setSelectedCardLayout(loyaltyData?.cardLayout ?? "LAYOUT_THREE");
      setCardColor(loyaltyData?.cardColor ?? "#C4E4B4");
      setSelectedPage("CARD_SELECTION");
    }

    return loyaltyData;
  };

  const { isLoading } = useQuery({
    queryKey: ["loyalty", businessId],
    queryFn: getLoyaltyData,
    enabled: !!businessId,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section>
      {selectedPage === "GET_STARTED" && <GetStarted />}
      <main>{selectedPage === "CARD_SELECTION" && <CardSelection />}</main>
    </section>
  );
};

export default Loyalty;
