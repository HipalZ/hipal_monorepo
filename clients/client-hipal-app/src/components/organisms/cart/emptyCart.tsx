import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { memo } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { MdOutlineRemoveShoppingCart } from "react-icons/md";

const MemoEmptyCart = () => {
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  return (
    <div className="flex flex-col items-center justify-center pt-[20vh]">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
        {outletInfo?.outLetType === "OTHER" ? (
          <MdOutlineRemoveShoppingCart className="text-4xl text-primary-100" />
        ) : (
          <GiKnifeFork className="text-4xl text-primary-100" />
        )}
      </div>
      <div className="mt-4 text-2xl font-bold">Your cart is empty</div>
    </div>
  );
};

const EmptyCart = memo(MemoEmptyCart);

export default EmptyCart;
