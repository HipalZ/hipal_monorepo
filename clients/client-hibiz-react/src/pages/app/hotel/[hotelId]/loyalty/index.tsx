import { useCallback } from "react";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useLoyalty } from "@/components/store/useLoyalty";
import CardSelection from "@/components/templates/loyalty/cardSelection";
import GetStarted from "@/components/templates/loyalty/getStarted";
import { apiRpc, cn } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import type { LoyaltyType } from "@hi/db-models/src/validators";
import UniversalNav from "@/components/templates/menu/sideNavbaar/universelSidenav";
import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData.ts";

const navItems = [{ text: "CARD_SELECTION" }];

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

  const businessId = useBusinessData((s) => s.outletInfo?.businessId) || "";
  const businessData = useBusinessData((s) => s.outletInfo);

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
    } else {
      setSelectedPage("GET_STARTED");
    }

    return loyaltyData;
  };

  const { isLoading, data: loyaltyDataQuery } = useQuery({
    queryKey: ["hotelLoyalty", businessId],
    queryFn: getLoyaltyData,
    enabled: !!businessId,
  });

  const changeLayout = useCallback(
    (text: string) => {
      setSelectedPage(text as "CARD_SELECTION" | "LOYALTY_USER");
    },
    [selectedPage],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section>
      {selectedPage === "GET_STARTED" && <GetStarted />}
      {selectedPage !== "GET_STARTED" && (
        <main>
          <article className="sticky top-0 z-50 bg-white md:bg-transparent lg:bg-transparent">
            <MemoizedHeader title="Loyalty CardZ" />
            <nav className="w-full px-4 space-x-4 overflow-hidden text-sm mobile-only">
              {navItems.map((item) => (
                <button
                  className={cn(
                    "pb-3 bg-white ",
                    selectedPage?.toLowerCase() === item.text.toLowerCase()
                      ? "border-b-2 border-[#8162e6] transition-all text-[#8162e6] font-semibold"
                      : "",
                  )}
                  key={item.text}
                  type="button"
                  onClick={() => changeLayout(item.text)}
                >
                  {item.text.split("_").join(" ")}
                </button>
              ))}
            </nav>
          </article>

          <UniversalNav
            items={navItems}
            selectedNavItem={selectedPage}
            changeNav={changeLayout}
          />
          {selectedPage === "CARD_SELECTION" && (
            <CardSelection
              key={loyaltyDataQuery?._id?.toString() ?? "no-id"}
            />
          )}
        </main>
      )}
    </section>
  );
};

export default Loyalty;
