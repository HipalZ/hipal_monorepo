import { memo } from "react";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
import type { AddOnType } from "@hi/db-models/src/validators";

const QuantityPickerNonOutline = ({
  setQuantity,
  minQuantity,
  maxQuantity,
  quantity,
  extra,
  item,
}: {
  setQuantity: (quantity: number) => void;
  minQuantity: number;
  maxQuantity: number;
  quantity: number;
  extra: AddOnType;
  item: AddOnType['choices'][number]; 
}) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // Determine the component type based on `choiceType`
  const isNumberType = extra.choiceType === "NUMBER";

  return (
    <>
      {isNumberType ? (
        <div className="flex items-center mx-1 my-auto">
          {/* Decrease Button */}
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= minQuantity}
          >
            <HiMinusSm size={24} />
          </button>

          {/* Quantity Display */}
          <span className="w-1/3 px-2 text-xs font-bold text-center">
            {quantity}
          </span>

          {/* Increase Button */}
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity}
          >
            <HiPlusSm size={24} />
          </button>
        </div>
      ) : (
        <div className="flex flex-row mx-1 my-auto">
          {/* Checkbox for binary choice */}
          <input
            type="checkbox"
            className="scale-125 "
            checked={quantity > 0}
            onChange={() => setQuantity(quantity > 0 ? 0 : 1)}
          />
        </div>
      )}
    </>
  );
};

export default memo(QuantityPickerNonOutline);
