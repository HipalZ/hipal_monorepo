import CardOne from "@/assets/cards/card51.png";
import CardTwo from "@/assets/cards/card52.png";
import CardThree from "@/assets/cards/card53.png";
import { memo } from "react";
import hipalLogo from "@/assets/hibizNewLogo.png";

import {
  type LoyaltyCardLayout,
  type SelectedCardType,
  useLoyalty,
} from "@/components/store/useLoyalty";
import { cn } from "@/components/utils/helper";

const cardArr = [
  {
    color: "#1366FF",
    selectLayout: "LAYOUT_ONE" as LoyaltyCardLayout,
    cardType: "CARD_FIVE" as SelectedCardType,
    backgroundColor: "#8465FF",
  },
  {
    color: "#FF1313",
    selectLayout: "LAYOUT_TWO" as LoyaltyCardLayout,
    cardType: "CARD_FIVE" as SelectedCardType,
    backgroundColor: "#1154D1",
  },
  {
    color: "#13FF81",
    selectLayout: "LAYOUT_THREE" as LoyaltyCardLayout,
    cardType: "CARD_FIVE" as SelectedCardType,
    backgroundColor: "#664AF4",
  },
];

const MemoCardFiveLayout = ({
  name,
  logo,
}: {
  name: string;
  logo: string | undefined;
}) => {
  const {
    selectedCardLayout,
    selectedCardType,
    setSelectedCardLayout,
    setSelectedCardType,
    setCardColor
  } = useLoyalty();

  const handleClick = (layout: LoyaltyCardLayout, type: SelectedCardType,color:string) => {
    setSelectedCardLayout(layout);
    setSelectedCardType(type);
    setCardColor(color)
  };

  const selectedCard = cardArr.find(
    (card) =>
      card.selectLayout === selectedCardLayout &&
      card.cardType === selectedCardType,
  );

  return (
    <section className="relative flex justify-between bg-[#ffffff] w-[23.5rem] gap-4 overflow-hidden p-4 lg:rounded-2xl">
      {selectedCard && (
        <>
          <img
            src={
              selectedCardLayout === "LAYOUT_ONE"
                ? CardOne
                : selectedCardLayout === "LAYOUT_TWO"
                  ? CardTwo
                  : CardThree
            }
            width={260}
            height={160}
            alt="Selected Card"
            className="object-cover w-[18rem] max-w-[18rem] h-full transition-opacity duration-500 ease-in-out opacity-0 animate-fadeIn transform scale-95 rounded-2xl"
          />
          <img
            width={64}
            height={64}
            src={logo || hipalLogo}
            alt="logo"
            className="absolute top-6 right-[5.5rem] filter invert-0 mix-blend-screen rounded-xl"
            style={{ filter: "invert(100%) contrast(150%) brightness(150%)" }}
          />
          <figcaption className="absolute w-[70%] flex justify-between text-left text-white top-[10rem] leading-6 left-8">
            <h3 className="w-[70%] truncate font-semibold">{name}</h3>
            <span className="mt-1 text-xs opacity-50">coinZ - 0</span>
          </figcaption>
        </>
      )}
      <article className="flex flex-col items-center justify-center space-y-4">
        {cardArr.map((card) => (
          <button
            key={card.color}
            type="button"
            onClick={() => handleClick(card.selectLayout, card.cardType,card.backgroundColor)}
            className={cn(
              "h-[1.5rem] rounded-l-full transition-all duration-500 ease-in-out -mr-10",
              selectedCardLayout === card.selectLayout
                ? "w-[4.5rem]"
                : "w-[1.5rem]",
            )}
            style={{ backgroundColor: card.color }}
          />
        ))}
      </article>
    </section>
  );
};

const CardFiveLayout = memo(MemoCardFiveLayout);

export default CardFiveLayout;
