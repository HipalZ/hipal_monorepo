import type { IExtraItem, IExtras } from "@/components/types/businessData";
import { memo } from "react";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";

const QuantityPickerNonOutline = ({
  setQuantity,
  minQuantity,
  maxQuantity,
  quantity,
  extra,
  item,
}: {
  setQuantity: (arg1: number) => void;
  minQuantity: number;
  maxQuantity: number;
  quantity: number;
  extra: IExtras;
  item: IExtraItem;
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

  return (
    <>
      {extra?.addOnType === "multiple" ? (
        <div className="flex flex-row mx-1 my-auto">
          {/* Decrease */}
          <div className="flex flex-col w-1/3">
            <button
              type="button"
              className="btn btn-xs btn-outline btn-primary aspect-square !px-0 !py-0 !min-h-4 !h-6 !w-6 flex flex-col border-0  rounded-full !my-auto "
              onClick={handleDecrease}
            >
              <HiMinusSm size={24} className="p-0 m-auto" />
            </button>
          </div>

          {/* Quantity */}
          <span className="w-1/3 !py-0 px-2 flex flex-col text-xs font-bold my-auto mx-auto text-center text-base-content">
            {quantity}
          </span>

          {/* Increase */}
          <div className="flex flex-col w-1/3">
            <button
              type="button"
              className="btn btn-xs btn-outline btn-primary aspect-square !px-0 !py-0 !min-h-4 !h-6 !w-6 flex flex-col border-0  rounded-full !my-auto"
              onClick={handleIncrease}
            >
              <HiPlusSm size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row mx-1 my-auto">
          <input
            type="checkbox"
            className="scale-110"
            checked={quantity > 0}
            onChange={() => setQuantity(quantity > 0 ? 0 : 1)}
          />
        </div>
      )}
    </>
  );
};

const MemoQuantityPickerNonOutline = memo(QuantityPickerNonOutline);
export default MemoQuantityPickerNonOutline;
