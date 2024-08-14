import { memo, useCallback } from "react";
import { type SelectedCardType, useLoyalty } from "@/components/store/useLoyalty";
import { cn } from "@/components/utils/helper";

const cards = [
  { src: "/src/assets/cards/card11.png", type: "CARD_ONE" },
  { src: "/src/assets/cards/card23.png", type: "CARD_TWO" },
  { src: "/src/assets/cards/card31.png", type: "CARD_THREE" },
  { src: "/src/assets/cards/card41.png", type: "CARD_FOUR" },
  { src: "/src/assets/cards/card52.png", type: "CARD_FIVE" },
  { src: "/src/assets/cards/card63.png", type: "CARD_SIX" },
];

const MemoSelectCardFromBottom = () => {
  const { setSelectedCardType, selectedCardType } = useLoyalty();

  const handleSelectCard = useCallback(
    (cardType: SelectedCardType) => {
      setSelectedCardType(cardType);
    },
    [setSelectedCardType]
  );

  return (
    <section className="relative">
      <article className="flex w-full p-4 space-x-2 overflow-x-auto hide-scrollbar max-w-[24rem]">
        {cards.map((card) => (
          <button
            key={card.type}
            type="button"
            onClick={() => handleSelectCard(card.type as SelectedCardType)}
            className={cn(
              selectedCardType === card.type
                ? "scale-125 px-2 underline underline-offset-4"
                : "",
              "rounded-xl transition-transform duration-300"
            )}
            aria-label={`Select ${card.type}`}
          >
            <img
              src={card.src}
              alt={`Preview of ${card.type}`}
              className="object-cover cursor-pointer"
            />
          </button>
        ))}
      </article>
    </section>
  );
};

const SelectCardFromBottom = memo(MemoSelectCardFromBottom);

export default memo(SelectCardFromBottom);
