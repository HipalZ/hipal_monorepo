import { memo } from "react";

import useBusinessData from "@/components/store/useBusinessData";
import CartwithoutPos from "./cartwithoutPos";
import CartWithPos from "./cartWithpos";

const MemoCartItems = () => {
  const outletInfo = useBusinessData((s) => s.outletInfo);

  return (
    <div className="grid items-start grid-cols-1 gap-4 m-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
      {outletInfo?.isPosEnabled ? <CartWithPos /> : <CartwithoutPos />}
    </div>
  );
};

const CartItems = memo(MemoCartItems);
export default CartItems;
