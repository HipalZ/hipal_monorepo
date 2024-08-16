"use client";
import { memo } from "react";

import CardOneLayout from "./cardOne";
import CardTwoLayout from "./cardTwo";
import CardThreeLayout from "./cardThree";
import CardFiveLayout from "./cardFive";
import CardSixLayout from "./cardSix";
import CardFourLayout from "./cardFour";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoCardSection = () => {
  const { cardType } = _useAllBusiness((state) => state.data.loyalty);
  console.log(cardType);
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
