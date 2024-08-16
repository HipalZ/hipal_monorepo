import { memo, useCallback } from "react";
import {
  type SelectedCardType,
  useLoyalty,
} from "@/components/store/useLoyalty";
import { cn } from "@/components/utils/helper";
import card11 from "@/assets/cards/card11.png";
import card23 from "@/assets/cards/card23.png";
import card31 from "@/assets/cards/card31.png";
import card41 from "@/assets/cards/card41.png";
import card52 from "@/assets/cards/card52.png";
import card63 from "@/assets/cards/card63.png";

const cards = [
  { src: card11, type: "CARD_ONE" },
  { src: card23, type: "CARD_TWO" },
  { src: card31, type: "CARD_THREE" },
  { src: card41, type: "CARD_FOUR" },
  { src: card52, type: "CARD_FIVE" },
  { src: card63, type: "CARD_SIX" },
];

const MemoSelectCardFromBottom = () => {
  const { setSelectedCardType, selectedCardType } = useLoyalty();

  const handleSelectCard = useCallback(
    (cardType: SelectedCardType) => {
      setSelectedCardType(cardType);
    },
    [setSelectedCardType],
  );

  return (
    <section className="relative">
      <article className="flex w-full p-4 space-x-2 overflow-x-auto hide-scrollbar">
        {cards.map((card) => (
          <button
            key={card.type}
            type="button"
            onClick={() => handleSelectCard(card.type as SelectedCardType)}
            className={cn(
              selectedCardType === card.type
                ? "scale-125 px-2 underline underline-offset-4"
                : "",
              "rounded-xl transition-transform duration-300",
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
