import { cn } from "@/components/utils/helpers";
import { MdOutlineShoppingCart } from "react-icons/md";
import { memo, useCallback } from "react";
import { useCart } from "@/components/store/useCart";
import { useCartStore } from "@/components/store/useCartStore";
import EmptyCart from "@/components/organisms/cart/emptyCart";
import CartItemHotel from "./CartItemHotel";
import { ArrowLeft } from "lucide-react";

const MemoCart = () => {
  const { cart } = useCartStore();
  const setShowCart = useCart((s)=>s.setShowCart);
  const cartPage = useCart((s)=>s.cartPage)
  const setCartPage = useCart((s) => s.setCartPage);

    const handleBack = useCallback(() => {
      if (cartPage === "cart") {
        setShowCart(false);
      } else {
        setCartPage("cart");
      }
    }, [cartPage, setShowCart, setCartPage]);

  return (
    <div className={cn("overflow-y-auto h-[100dvh] hide-scrollbar text-[#000000] bg-[#ffffff] relative")}>
      {cartPage === "cart" &&
        <section className="relative h-[calc(91dvh+5px)]">
          <div className="bg-white z-[500] sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <article className="flex items-center gap-3">
              <button
                onClick={handleBack}
                type="button"
                className="flex h-8 w-8 px-1 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-100 transition"
              >
                <ArrowLeft size={18} className="text-gray-700" />
              </button>

            <h2 className="text-2xl font-semibold text-gray-800">Live cart</h2>
          </article>

            <article className="flex items-center text-black">
              <MdOutlineShoppingCart size={24} />
              <span className="text-sm">
                {cart?.length} items
              </span>
            </article>
          </div>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex-1 divide-y divide-gray-100">
              {cart?.length > 0 ? cart?.map((cartItem) => (
                <CartItemHotel key={cartItem.id} cartItem={cartItem} />
              )) : <EmptyCart />}
            </div>
          </div>
        </section>
      }
    </div>
  );
};

const MemoRestaurantCart = memo(MemoCart);
export default MemoRestaurantCart;
