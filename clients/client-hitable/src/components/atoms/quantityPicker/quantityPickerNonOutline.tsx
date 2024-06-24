import { IExtraItem, IExtras } from '@/components/types/hiTableData';
import { memo } from 'react';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';

function QuantityPickerNonOutline({
  quantity,
  setQuantity,
  minQuantity,
  extra,
  item,
  selectedItemsCount,
  isDisabled,
  displayAlertPopUp,
}: {
  quantity: number;
  setQuantity: (arg1: number) => void;
  minQuantity: number;
  extra: IExtras;
  item: IExtraItem;
  selectedItemsCount: any;
  isDisabled: any;
  displayAlertPopUp: () => void;
}) {
  const onDecreaseQuantity = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };
  function onIncreaseQuantity() {
    setQuantity(quantity + 1);
  }
  const handleCheckboxChange = (isChecked) => {
    if (extra?.maxQuantity === 0) {
      return;
    }
    const currentSelectedCount = selectedItemsCount[extra?.id] || 0;
    const maxAllowed = extra?.maxQuantity || extra?.numSelections;

    if (isChecked) {
      if (currentSelectedCount >= maxAllowed) {
        displayAlertPopUp();
        return;
      }
    }
    setQuantity(isChecked ? 1 : 0);
  };
  return (
    <>
      {extra?.addOnType === 'multiple' ? (
        <div className="mx-1 my-auto flex flex-row">
          {/* Decrease */}
          <div className="flex w-1/3 flex-col">
            <button
              className="btn btn-xs btn-outline btn-primary !min-h-4 !my-auto flex aspect-square !h-6 !w-6 flex-col rounded-full border-0  !px-0 !py-0 "
              onClick={isDisabled && quantity === 0 && extra?.name ? displayAlertPopUp : onDecreaseQuantity}
            >
              <HiMinusSm size={24} className="m-auto p-0" />
            </button>
          </div>

          {/* Quantity */}
          <span className=" text-base-content mx-auto my-auto flex w-1/3 flex-col !py-0 px-2 text-center text-xs font-bold">{quantity}</span>

          {/* Increase */}
          <div className="flex w-1/3 flex-col">
            <button
              className="btn btn-xs btn-outline btn-primary !min-h-4 !my-auto flex aspect-square !h-6 !w-6 flex-col rounded-full border-0  !px-0 !py-0"
              onClick={
                extra?.id
                  ? quantity === item?.maxQuantity || selectedItemsCount[extra?.id] === extra?.maxQuantity
                    ? displayAlertPopUp
                    : onIncreaseQuantity
                  : isDisabled && quantity === 0 && extra?.name
                    ? displayAlertPopUp
                    : onIncreaseQuantity
              }
            >
              <HiPlusSm size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-1 my-auto flex flex-row">
          <input type="checkbox" checked={quantity > 0} className="scale-110" onChange={(e) => handleCheckboxChange(e.target.checked)} />
        </div>
      )}
    </>
  );
}

export default memo(QuantityPickerNonOutline);
