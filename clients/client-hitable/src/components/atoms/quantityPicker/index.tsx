import { memo } from 'react';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { BiTrash } from 'react-icons/bi';

function QuantityPicker({
  quantity,
  setQuantity,
  minQuantity,
  isDeleteAble,
  onDeleteItem,
}: {
  quantity: number;
  setQuantity: (arg1: number) => void;
  minQuantity: number;
  isDeleteAble: boolean;
  onDeleteItem: () => void;
}) {
  const onIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  const onDecreaseQuantity = () => {
    if (quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };
  return (
    <div className="border-primary !bg-base-100  mx-1 my-auto flex min-h-[2.241rem] min-w-[6.044rem] flex-row rounded-full border !text-[0.969rem] !font-medium ">
      {isDeleteAble && quantity === 0 ? (
        <>
          {/* Delete Item */}
          <button
            className="btn btn-xs btn-outline btn-primary  my-auto flex w-1/2 flex-col rounded-none rounded-l-full border-0 !py-0 focus:!bg-transparent active:!bg-transparent"
            onClick={onDeleteItem}
          >
            <BiTrash className=" !fill-primary font-bold" />
          </button>
        </>
      ) : (
        <>
          {/* Decrease */}
          <button
            className="btn btn-xs btn-outline btn-primary  my-auto flex w-1/3 flex-col rounded-none rounded-l-full border-0 !py-0 focus:!bg-transparent active:!bg-transparent"
            onClick={onDecreaseQuantity}
          >
            <AiOutlineMinus className=" !fill-primary font-bold" />
          </button>

          {/* Quantity */}
          <span
            className={`${isDeleteAble && quantity === 0 ? ' w-1/2' : ' w-1/3'} text-primary mx-auto my-auto flex  flex-col !py-0 px-1 text-center`}
          >
            {quantity}
          </span>
        </>
      )}

      {/* Increase */}
      <button
        className="btn btn-xs btn-outline btn-primary  my-auto flex w-1/3 flex-col rounded-none rounded-r-full border-0 !py-0 focus:!bg-transparent active:!bg-transparent "
        onClick={onIncreaseQuantity}
      >
        <AiOutlinePlus className=" !fill-primary font-bold" />
      </button>
    </div>
  );
}
export default memo(QuantityPicker);
