import EmptyCart from '@/components/organisms/cart/emptyCart';
import { useCart } from '@/components/store/useCart';
import { useCartStore } from '@/components/store/useCartStore';
import { cn } from '@/components/utils/helpers';
import { ArrowLeft } from 'lucide-react';
import { memo, useCallback } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';
import CartItemHotel from './CartItemHotel';

const MemoCart = () => {
  const { cart } = useCartStore();
  const setShowCart = useCart((s) => s.setShowCart);
  const cartPage = useCart((s) => s.cartPage);
  const setCartPage = useCart((s) => s.setCartPage);

  const handleBack = useCallback(() => {
    if (cartPage === 'cart') {
      setShowCart(false);
    } else {
      setCartPage('cart');
    }
  }, [cartPage, setShowCart, setCartPage]);

  return (
    <div className={cn('hide-scrollbar relative h-[100dvh] overflow-y-auto bg-[#ffffff] text-[#000000]')}>
      {cartPage === 'cart' && (
        <section className="relative h-[calc(91dvh+5px)]">
          <div className="sticky top-0 z-[500] flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
            <article className="flex items-center gap-3">
              <button
                onClick={handleBack}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white px-1 shadow-sm transition hover:bg-gray-100"
              >
                <ArrowLeft size={18} className="text-gray-700" />
              </button>

              <h2 className="text-2xl font-semibold text-gray-800">Live cart</h2>
            </article>

            <article className="flex items-center text-black">
              <MdOutlineShoppingCart size={24} />
              <span className="text-sm">{cart?.length} items</span>
            </article>
          </div>
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex-1 divide-y divide-gray-100">
              {cart?.length > 0 ? cart?.map((cartItem) => <CartItemHotel key={cartItem.id} cartItem={cartItem} />) : <EmptyCart />}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const MemoRestaurantCart = memo(MemoCart);
export default MemoRestaurantCart;
