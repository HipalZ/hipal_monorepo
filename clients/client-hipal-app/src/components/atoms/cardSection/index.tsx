"use client";
import { memo, useEffect } from "react";

import CardOneLayout from "./cardOne";
import CardTwoLayout from "./cardTwo";
import CardThreeLayout from "./cardThree";
import CardFiveLayout from "./cardFive";
import CardSixLayout from "./cardSix";
import CardFourLayout from "./cardFour";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { updateTheme } from "@/components/utils/themes";

const MemoCardSection = () => {
  const cardType = useLoyaltyData((s) => s.loyaltySetting.cardType);
  const settings = _useAllBusiness((s) => s.data?.settings);
  useEffect(() => {
    updateTheme(settings);
  }, [settings]);
  return (
    <section>
      <center className="mx-auto overflow-hidden">
        {cardType === "CARD_ONE" && <CardOneLayout />}
        {cardType === "CARD_TWO" && <CardTwoLayout />}
        {cardType === "CARD_THREE" && <CardThreeLayout />}
        {cardType === "CARD_FOUR" && <CardFourLayout />}
        {cardType === "CARD_FIVE" && <CardFiveLayout />}
        {cardType === "CARD_SIX" && <CardSixLayout />}
      </center>
    </section>
  );
};

const CardSection = memo(MemoCardSection);
export default CardSection;
